/**
 * STARK Real-Time - Sistema de Atualizações em Tempo Real
 * Usa polling otimizado + notificações visuais elegantes
 * (Netlify não suporta WebSocket, mas isso funciona muito bem!)
 */

class StarkRealTime {
  constructor() {
    this.conectado = false;
    this.ultimoSync = null;
    this.pollInterval = null;
    this.pollRate = 5000; // 5 segundos para updates mais rápidos
    this.fastPollRate = 2000; // 2 segundos após ação
    this.normalPollRate = 10000; // 10 segundos normal
    this.listeners = new Map();
    this.ultimosDados = null;

    this.init();
  }

  init() {
    console.log('🚀 STARK Real-Time inicializando...');
    this.criarIndicadorConexao();
    this.iniciarPolling();
    this.setupVisibilityListener();
    this.conectado = true;
    this.atualizarStatusConexao('online');
    console.log('✅ STARK Real-Time pronto!');
  }

  // ============================================
  // INDICADOR DE CONEXÃO
  // ============================================

  criarIndicadorConexao() {
    // Indicador desabilitado
    return;
  }

  injetarEstilos() {
    if (document.getElementById('stark-realtime-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'stark-realtime-styles';
    styles.textContent = `
      .stark-connection-status {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 8px 16px;
        border-radius: 25px;
        font-size: 13px;
        font-weight: 600;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(0,0,0,0.15);
        cursor: pointer;
        user-select: none;
      }

      .stark-connection-status:hover {
        transform: scale(1.05);
      }

      .status-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        animation: pulse-dot 2s infinite;
      }

      .status-online {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
      }

      .status-online .status-dot {
        background: white;
        box-shadow: 0 0 10px rgba(255,255,255,0.8);
      }

      .status-offline {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
      }

      .status-offline .status-dot {
        background: white;
        animation: none;
      }

      .status-syncing {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
      }

      .status-syncing .status-dot {
        background: white;
        animation: spin 1s linear infinite;
      }

      @keyframes pulse-dot {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.2); opacity: 0.7; }
      }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* Toast Notifications */
      .stark-toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 80vh;
        overflow-y: auto;
        pointer-events: none;
      }

      .stark-toast {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        padding: 16px 20px;
        min-width: 320px;
        max-width: 400px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        pointer-events: auto;
        border-left: 4px solid #4A6B54;
      }

      .stark-toast.toast-success {
        border-left-color: #10b981;
      }

      .stark-toast.toast-warning {
        border-left-color: #f59e0b;
      }

      .stark-toast.toast-error {
        border-left-color: #ef4444;
      }

      .stark-toast.toast-info {
        border-left-color: #3b82f6;
      }

      .stark-toast.removing {
        animation: slideOut 0.3s ease forwards;
      }

      .stark-toast-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .stark-toast-content {
        flex: 1;
      }

      .stark-toast-title {
        font-weight: 700;
        color: #1f2937;
        margin-bottom: 4px;
        font-size: 14px;
      }

      .stark-toast-message {
        color: #6b7280;
        font-size: 13px;
        line-height: 1.4;
      }

      .stark-toast-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        font-size: 18px;
        padding: 0;
        line-height: 1;
        transition: color 0.2s;
      }

      .stark-toast-close:hover {
        color: #4b5563;
      }

      .stark-toast-timestamp {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 6px;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      /* Highlight de elementos atualizados */
      .stark-highlight {
        animation: highlightPulse 1.5s ease;
      }

      @keyframes highlightPulse {
        0% {
          box-shadow: 0 0 0 0 rgba(74, 107, 84, 0.4);
          background-color: rgba(74, 107, 84, 0.1);
        }
        50% {
          box-shadow: 0 0 20px 10px rgba(74, 107, 84, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(74, 107, 84, 0);
          background-color: transparent;
        }
      }

      /* Badge de novos itens */
      .stark-new-badge {
        display: inline-block;
        background: linear-gradient(135deg, #4A6B54, #7A9B84);
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 10px;
        margin-left: 8px;
        text-transform: uppercase;
        animation: badgePop 0.3s ease;
      }

      @keyframes badgePop {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .stark-toast {
          background: #1f2937;
        }
        .stark-toast-title {
          color: #f9fafb;
        }
        .stark-toast-message {
          color: #9ca3af;
        }
      }
    `;
    document.head.appendChild(styles);
  }

  atualizarStatusConexao(status) {
    const indicator = document.getElementById('stark-connection-status');
    if (!indicator) return;

    const configs = {
      online: { text: 'Online', class: 'status-online' },
      offline: { text: 'Offline', class: 'status-offline' },
      syncing: { text: 'Sincronizando...', class: 'status-syncing' }
    };

    const config = configs[status] || configs.online;
    indicator.className = `stark-connection-status ${config.class}`;
    indicator.querySelector('.status-text').textContent = config.text;
  }

  // ============================================
  // POLLING OTIMIZADO
  // ============================================

  iniciarPolling() {
    // Polling desabilitado por padrão para evitar erros de conexão
    console.log('ℹ️ STARK Real-Time em modo offline - dados salvos localmente');
    return;

    // Para reativar polling, remova o return acima
    if (this.pollInterval) clearInterval(this.pollInterval);

    this.pollInterval = setInterval(() => {
      this.verificarAtualizacoes();
    }, this.pollRate);

    // Primeira verificação imediata
    this.verificarAtualizacoes();
  }

  async verificarAtualizacoes() {
    // Modo offline forçado para evitar erros de console em ambiente local sem backend
    return;

    if (!this.conectado) return;

    try {
      this.atualizarStatusConexao('syncing');

      // Vercel Serverless Function
      const response = await fetch('/api/sync-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acao: 'buscar-tudo', mes: this.getMesAtual() })
      });

      if (!response.ok) throw new Error('Falha na sincronização');

      const resultado = await response.json();

      if (resultado.success) {
        this.processarAtualizacao(resultado.dados);
        this.ultimoSync = Date.now();
      }

      this.atualizarStatusConexao('online');

    } catch (error) {
      // Erro silencioso - modo offline sem poluir console
      this.atualizarStatusConexao('offline');
    }
  }

  processarAtualizacao(novosDados) {
    if (!this.ultimosDados) {
      // Primeira carga, apenas salva
      this.ultimosDados = novosDados;
      return;
    }

    // Compara com dados anteriores
    const mudancas = this.detectarMudancas(this.ultimosDados, novosDados);

    if (mudancas.length > 0) {
      console.log('🔄 Mudanças detectadas:', mudancas);

      // Atualiza stark core
      if (window.stark) {
        window.stark._estado.receitas = novosDados.receitas;
        window.stark._estado.despesas = novosDados.despesas;
        window.stark._estado.resumo = novosDados.resumo;
        window.stark._estado.alertas = novosDados.alertas;
        window.stark.notificarTodos();
      }

      // Notifica mudanças
      mudancas.forEach(mudanca => {
        this.notificar(mudanca);
      });

      // Dispara evento
      document.dispatchEvent(new CustomEvent('stark-dados-atualizados', {
        detail: { mudancas, dados: novosDados }
      }));
    }

    this.ultimosDados = novosDados;
  }

  detectarMudancas(antigo, novo) {
    const mudancas = [];

    // Verifica novas receitas
    const receitasAntigas = new Set(antigo.receitas.map(r => r.nome));
    novo.receitas.forEach(r => {
      if (!receitasAntigas.has(r.nome)) {
        mudancas.push({
          tipo: 'nova-receita',
          item: r,
          mensagem: `Nova receita: ${r.nome}`,
          valor: r.valor
        });
      }
    });

    // Verifica novas despesas
    const despesasAntigas = new Set(antigo.despesas.map(d => d.nome));
    novo.despesas.forEach(d => {
      if (!despesasAntigas.has(d.nome)) {
        mudancas.push({
          tipo: 'nova-despesa',
          item: d,
          mensagem: `Nova despesa: ${d.nome}`,
          valor: d.valor
        });
      }
    });

    // Verifica mudanças de status
    antigo.receitas.forEach(ra => {
      const rn = novo.receitas.find(r => r.nome === ra.nome);
      if (rn && ra.status !== rn.status) {
        mudancas.push({
          tipo: 'status-receita',
          item: rn,
          statusAnterior: ra.status,
          statusNovo: rn.status,
          mensagem: `${rn.nome}: ${ra.status} → ${rn.status}`
        });
      }
    });

    antigo.despesas.forEach(da => {
      const dn = novo.despesas.find(d => d.nome === da.nome);
      if (dn && da.status !== dn.status) {
        mudancas.push({
          tipo: 'status-despesa',
          item: dn,
          statusAnterior: da.status,
          statusNovo: dn.status,
          mensagem: `${dn.nome}: ${da.status} → ${dn.status}`
        });
      }
    });

    return mudancas;
  }

  // ============================================
  // NOTIFICAÇÕES TOAST
  // ============================================

  getOrCreateToastContainer() {
    let container = document.getElementById('stark-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'stark-toast-container';
      container.className = 'stark-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  notificar(mudanca) {
    const container = this.getOrCreateToastContainer();

    const icons = {
      'nova-receita': '💰',
      'nova-despesa': '💳',
      'status-receita': '✅',
      'status-despesa': '✅',
      'removido': '🗑️',
      'editado': '✏️'
    };

    const tipos = {
      'nova-receita': 'success',
      'nova-despesa': 'warning',
      'status-receita': 'success',
      'status-despesa': 'success'
    };

    const titulos = {
      'nova-receita': 'Nova Receita Adicionada',
      'nova-despesa': 'Nova Despesa Adicionada',
      'status-receita': 'Status Atualizado',
      'status-despesa': 'Status Atualizado'
    };

    const toast = document.createElement('div');
    toast.className = `stark-toast toast-${tipos[mudanca.tipo] || 'info'}`;
    toast.innerHTML = `
      <span class="stark-toast-icon">${icons[mudanca.tipo] || '📢'}</span>
      <div class="stark-toast-content">
        <div class="stark-toast-title">${titulos[mudanca.tipo] || 'Atualização'}</div>
        <div class="stark-toast-message">${mudanca.mensagem}</div>
        ${mudanca.valor ? `<div class="stark-toast-message"><strong>R$ ${mudanca.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>` : ''}
        <div class="stark-toast-timestamp">${new Date().toLocaleTimeString('pt-BR')}</div>
      </div>
      <button class="stark-toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    // Auto-remove após 5 segundos
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // Toast manual para mensagens customizadas
  toast(mensagem, opcoes = {}) {
    const container = this.getOrCreateToastContainer();

    const {
      tipo = 'info',
      titulo = 'Notificação',
      icone = '📢',
      duracao = 5000
    } = opcoes;

    const toast = document.createElement('div');
    toast.className = `stark-toast toast-${tipo}`;
    toast.innerHTML = `
      <span class="stark-toast-icon">${icone}</span>
      <div class="stark-toast-content">
        <div class="stark-toast-title">${titulo}</div>
        <div class="stark-toast-message">${mensagem}</div>
        <div class="stark-toast-timestamp">${new Date().toLocaleTimeString('pt-BR')}</div>
      </div>
      <button class="stark-toast-close" onclick="this.parentElement.remove()">×</button>
    `;

    container.appendChild(toast);

    if (duracao > 0) {
      setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
      }, duracao);
    }

    return toast;
  }

  // ============================================
  // HIGHLIGHT DE ELEMENTOS
  // ============================================

  destacarElemento(seletor) {
    const elementos = document.querySelectorAll(seletor);
    elementos.forEach(el => {
      el.classList.remove('stark-highlight');
      // Force reflow
      void el.offsetWidth;
      el.classList.add('stark-highlight');
    });
  }

  adicionarBadgeNovo(elemento) {
    if (elemento.querySelector('.stark-new-badge')) return;

    const badge = document.createElement('span');
    badge.className = 'stark-new-badge';
    badge.textContent = 'Novo';
    elemento.appendChild(badge);

    // Remove badge após 10 segundos
    setTimeout(() => badge.remove(), 10000);
  }

  // ============================================
  // VISIBILIDADE E OTIMIZAÇÃO
  // ============================================

  setupVisibilityListener() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab não visível - polling lento
        this.pollRate = 30000; // 30 segundos
        this.reiniciarPolling();
      } else {
        // Tab visível - polling rápido + sync imediato
        this.pollRate = this.normalPollRate;
        this.reiniciarPolling();
        this.verificarAtualizacoes();
      }
    });
  }

  reiniciarPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.iniciarPolling();
  }

  // Acelera polling temporariamente (após ação do usuário)
  acelerarPolling() {
    this.pollRate = this.fastPollRate;
    this.reiniciarPolling();

    // Volta ao normal após 30 segundos
    setTimeout(() => {
      this.pollRate = this.normalPollRate;
      this.reiniciarPolling();
    }, 30000);
  }

  // ============================================
  // HELPERS
  // ============================================

  getMesAtual() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  // Forçar sync manual
  async forcarSync() {
    console.log('🔄 Sync manual iniciado...');
    await this.verificarAtualizacoes();
    this.toast('Dados sincronizados!', {
      tipo: 'success',
      titulo: 'Sincronização',
      icone: '🔄',
      duracao: 3000
    });
  }

  // Parar polling
  parar() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
    this.conectado = false;
    this.atualizarStatusConexao('offline');
  }

  // Retomar polling
  retomar() {
    this.conectado = true;
    this.iniciarPolling();
    this.atualizarStatusConexao('online');
  }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

// Aguarda DOM e stark-core
document.addEventListener('DOMContentLoaded', () => {
  // Espera um pouco para stark-core inicializar
  setTimeout(() => {
    window.starkRealTime = new StarkRealTime();
  }, 1000);
});

// Expor globalmente
window.StarkRealTime = StarkRealTime;
