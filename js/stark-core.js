/**
 * STARK Core - Sistema de Estado Reativo Global
 * Sincroniza dados entre STARK Agent, Dashboard e todas as páginas
 */

class StarkCore {
  constructor() {
    this.version = '1.0.0';
    this.listeners = new Map();
    this.syncInterval = null;
    this.lastSync = null;

    // Estado reativo com Proxy
    this._estado = {
      receitas: [],
      despesas: [],
      resumo: {
        receitaTotal: 0,
        despesaTotal: 0,
        lucro: 0,
        margem: 0,
        receitasCount: 0,
        despesasCount: 0
      },
      alertas: [],
      mesAtual: this.getMesAtual(),
      carregando: false,
      ultimaAtualizacao: null
    };

    // Proxy para reatividade
    this.dados = new Proxy(this._estado, {
      set: (target, prop, value) => {
        const oldValue = target[prop];
        target[prop] = value;

        // Notifica listeners
        this.notificar(prop, value, oldValue);

        // Dispara evento global
        this.dispararEvento('stark-update', { prop, value, oldValue });

        // Salva no localStorage para persistência
        this.salvarLocal();

        return true;
      },
      get: (target, prop) => {
        return target[prop];
      }
    });

    // Inicializa
    this.init();
  }

  async init() {
    console.log('🚀 STARK Core v' + this.version + ' inicializando...');

    // Carrega dados do localStorage primeiro (cache)
    this.carregarLocal();

    // Sincroniza com o banco
    await this.sincronizar();

    // Inicia polling para atualizações (a cada 30s)
    this.iniciarPolling(30000);

    console.log('✅ STARK Core pronto!');
  }

  getMesAtual() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // ============================================
  // SINCRONIZAÇÃO COM BACKEND
  // ============================================

  async sincronizar(forcar = false) {
    if (this.dados.carregando && !forcar) return;

    this.dados.carregando = true;

    try {
      const response = await fetch('/.netlify/functions/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes: this.dados.mesAtual,
          acao: 'buscar-tudo'
        })
      });

      if (!response.ok) throw new Error('Falha na sincronização');

      const resultado = await response.json();

      if (resultado.success) {
        // Atualiza estado sem disparar sync recursivo
        this._estado.receitas = resultado.dados?.receitas || [];
        this._estado.despesas = resultado.dados?.despesas || [];
        this._estado.resumo = resultado.dados?.resumo || this._estado.resumo;
        this._estado.alertas = resultado.dados?.alertas || [];
        this._estado.ultimaAtualizacao = new Date().toISOString();

        this.lastSync = Date.now();

        // Notifica todos os listeners
        this.notificarTodos();

        // Dispara evento de sync completo
        this.dispararEvento('stark-sync', { dados: resultado.dados });

        console.log('✅ Dados sincronizados:', resultado.dados?.resumo);
      }

    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      this.dispararEvento('stark-error', { error: error.message });
    } finally {
      this.dados.carregando = false;
    }
  }

  iniciarPolling(intervalo = 30000) {
    if (this.syncInterval) clearInterval(this.syncInterval);

    this.syncInterval = setInterval(() => {
      this.sincronizar();
    }, intervalo);
  }

  pararPolling() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // ============================================
  // OPERAÇÕES CRUD (via Agent ou direto)
  // ============================================

  async adicionarReceita(dados) {
    return this.executarAcao('adicionar-receita', dados);
  }

  async adicionarDespesa(dados) {
    return this.executarAcao('adicionar-despesa', dados);
  }

  async marcarPago(nome, tipo = 'despesa') {
    return this.executarAcao('marcar-pago', { nome, tipo });
  }

  async marcarRecebido(nome) {
    return this.executarAcao('marcar-recebido', { nome });
  }

  async editarItem(tipo, nomeAtual, novosDados) {
    return this.executarAcao('editar-item', { tipo, nomeAtual, ...novosDados });
  }

  async removerItem(tipo, nome) {
    return this.executarAcao('remover-item', { tipo, nome });
  }

  async executarAcao(acao, dados) {
    try {
      const response = await fetch('/.netlify/functions/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acao,
          dados: { ...dados, mes: this.dados.mesAtual }
        })
      });

      const resultado = await response.json();

      if (resultado.success) {
        // Sincroniza para pegar dados atualizados
        await this.sincronizar(true);

        this.dispararEvento('stark-acao', { acao, dados, resultado });
      }

      return resultado;

    } catch (error) {
      console.error('❌ Erro na ação:', acao, error);
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // SISTEMA DE EVENTOS
  // ============================================

  on(evento, callback) {
    if (!this.listeners.has(evento)) {
      this.listeners.set(evento, new Set());
    }
    this.listeners.get(evento).add(callback);

    // Retorna função para remover listener
    return () => this.off(evento, callback);
  }

  off(evento, callback) {
    if (this.listeners.has(evento)) {
      this.listeners.get(evento).delete(callback);
    }
  }

  notificar(prop, value, oldValue) {
    const listeners = this.listeners.get(prop);
    if (listeners) {
      listeners.forEach(cb => {
        try {
          cb(value, oldValue, prop);
        } catch (e) {
          console.error('Erro em listener:', e);
        }
      });
    }
  }

  notificarTodos() {
    Object.keys(this._estado).forEach(prop => {
      this.notificar(prop, this._estado[prop], null);
    });
  }

  dispararEvento(nome, detail) {
    document.dispatchEvent(new CustomEvent(nome, { detail }));
  }

  // ============================================
  // PERSISTÊNCIA LOCAL
  // ============================================

  salvarLocal() {
    try {
      const dados = {
        receitas: this._estado.receitas,
        despesas: this._estado.despesas,
        resumo: this._estado.resumo,
        mesAtual: this._estado.mesAtual,
        ultimaAtualizacao: this._estado.ultimaAtualizacao
      };
      localStorage.setItem('stark_dados', JSON.stringify(dados));
    } catch (e) {
      console.warn('Não foi possível salvar no localStorage');
    }
  }

  carregarLocal() {
    try {
      const saved = localStorage.getItem('stark_dados');
      if (saved) {
        const dados = JSON.parse(saved);
        Object.assign(this._estado, dados);
        console.log('📦 Dados carregados do cache local');
      }
    } catch (e) {
      console.warn('Não foi possível carregar do localStorage');
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0);
  }

  formatarPorcentagem(valor) {
    return `${(valor || 0).toFixed(1)}%`;
  }

  getReceitasPendentes() {
    return this.dados.receitas.filter(r => r.status === 'A Receber');
  }

  getDespesasPendentes() {
    return this.dados.despesas.filter(d => d.status === 'A Pagar');
  }

  getVencimentosProximos(dias = 7) {
    const hoje = new Date();
    const limite = new Date(hoje.getTime() + dias * 24 * 60 * 60 * 1000);

    const itens = [...this.dados.receitas, ...this.dados.despesas];

    return itens.filter(item => {
      if (!item.vencimento) return false;
      const venc = new Date(item.vencimento);
      return venc >= hoje && venc <= limite &&
             (item.status === 'A Pagar' || item.status === 'A Receber');
    }).sort((a, b) => new Date(a.vencimento) - new Date(b.vencimento));
  }

  // Calcula resumo financeiro
  calcularResumo() {
    const receitaTotal = this.dados.receitas.reduce((sum, r) => sum + (r.valor || 0), 0);
    const despesaTotal = this.dados.despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const lucro = receitaTotal - despesaTotal;
    const margem = receitaTotal > 0 ? (lucro / receitaTotal) * 100 : 0;

    return {
      receitaTotal,
      despesaTotal,
      lucro,
      margem,
      receitasCount: this.dados.receitas.length,
      despesasCount: this.dados.despesas.length
    };
  }
}

// ============================================
// COMPONENTES REATIVOS
// ============================================

class StarkComponent {
  constructor(elemento, propriedade) {
    this.elemento = typeof elemento === 'string' ?
      document.querySelector(elemento) : elemento;
    this.propriedade = propriedade;

    if (this.elemento) {
      // Escuta mudanças na propriedade
      window.stark.on(propriedade, (value) => {
        this.atualizar(value);
      });
    }
  }

  atualizar(value) {
    // Override nos componentes filhos
  }
}

// Componente para valores monetários
class StarkMoeda extends StarkComponent {
  atualizar(value) {
    if (this.elemento) {
      this.elemento.textContent = window.stark.formatarMoeda(value);
    }
  }
}

// Componente para listas
class StarkLista extends StarkComponent {
  constructor(elemento, propriedade, renderItem) {
    super(elemento, propriedade);
    this.renderItem = renderItem;
  }

  atualizar(value) {
    if (this.elemento && Array.isArray(value)) {
      this.elemento.innerHTML = value.map(this.renderItem).join('');
    }
  }
}

// ============================================
// INICIALIZAÇÃO GLOBAL
// ============================================

// Cria instância global
window.stark = new StarkCore();

// Helpers globais
window.StarkComponent = StarkComponent;
window.StarkMoeda = StarkMoeda;
window.StarkLista = StarkLista;

// Evento de ready
document.addEventListener('DOMContentLoaded', () => {
  document.dispatchEvent(new CustomEvent('stark-ready'));
});
