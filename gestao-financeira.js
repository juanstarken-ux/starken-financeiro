// =====================================================
// SISTEMA DE GESTÃO FINANCEIRA - STARKEN TECNOLOGIA
// =====================================================
// Gerenciamento centralizado de contas a pagar e receber
// com persistência em localStorage e sincronização em tempo real

const GestaoFinanceira = {
    // Chave do localStorage
    STORAGE_KEY: 'starken_financeiro_status',

    // Inicializar sistema
    init() {
        this.loadFromStorage();
        console.log('💰 Sistema de Gestão Financeira inicializado');
    },

    // Carregar dados do localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.statusData = JSON.parse(saved);
            } else {
                this.statusData = {};
            }
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            this.statusData = {};
        }
    },

    // Salvar dados no localStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.statusData));
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
        }
    },

    // Gerar ID único para um item
    generateId(mes, tipo, nome) {
        return `${mes}_${tipo}_${nome.replace(/\s+/g, '_').toLowerCase()}`;
    },

    // Obter status de um item
    getStatus(mes, tipo, nome) {
        const id = this.generateId(mes, tipo, nome);
        return this.statusData[id] || null;
    },

    // Atualizar status de um item
    updateStatus(mes, tipo, nome, status, dataPagamento = null) {
        const id = this.generateId(mes, tipo, nome);
        this.statusData[id] = {
            status: status,
            dataPagamento: dataPagamento || (status === 'Pago' || status === 'Recebido' ? new Date().toISOString().split('T')[0] : null),
            updatedAt: new Date().toISOString()
        };
        this.saveToStorage();

        // Disparar evento para atualizar outras partes da página
        window.dispatchEvent(new CustomEvent('financeiroUpdated', {
            detail: { mes, tipo, nome, status }
        }));

        return this.statusData[id];
    },

    // Obter todos os dados de um mês com status atualizados
    getDadosMesComStatus(mes) {
        if (!dadosMensais || !dadosMensais[mes]) return null;

        const dados = JSON.parse(JSON.stringify(dadosMensais[mes])); // Deep clone

        // Atualizar status das receitas
        if (dados.receitas && dados.receitas.clientes) {
            let recebido = 0;
            let pendente = 0;

            dados.receitas.clientes.forEach(cliente => {
                const savedStatus = this.getStatus(mes, 'receita', cliente.nome);
                if (savedStatus) {
                    cliente.status = savedStatus.status;
                    cliente.dataPagamento = savedStatus.dataPagamento;
                }

                // Recalcular totais
                if (cliente.status === 'Recebido' || cliente.status === 'Feito') {
                    recebido += cliente.valor;
                } else if (cliente.status !== 'TCV' && cliente.status !== 'Bônus') {
                    pendente += cliente.valor;
                }
            });

            dados.receitas.recebido = recebido;
            dados.receitas.pendente = pendente;
            dados.receitas.taxa_recebimento = dados.receitas.total > 0
                ? ((recebido / dados.receitas.total) * 100).toFixed(1)
                : 0;
        }

        // Atualizar status das despesas
        if (dados.despesas && dados.despesas.categorias) {
            let pago = 0;
            let pendente = 0;

            for (const [categoriaKey, categoriaData] of Object.entries(dados.despesas.categorias)) {
                if (categoriaData.itens && Array.isArray(categoriaData.itens)) {
                    categoriaData.itens.forEach(item => {
                        const savedStatus = this.getStatus(mes, 'despesa', item.nome);
                        if (savedStatus) {
                            item.status = savedStatus.status;
                            item.dataPagamento = savedStatus.dataPagamento;
                        }

                        // Recalcular totais
                        if (item.status === 'Pago' || item.status === 'Feito') {
                            pago += item.valor;
                        } else {
                            pendente += item.valor;
                        }
                    });
                }
            }

            dados.despesas.pago = pago;
            dados.despesas.pendente = pendente;
        }

        return dados;
    },

    // Obter resumo financeiro de um mês
    getResumoMes(mes) {
        const dados = this.getDadosMesComStatus(mes);
        if (!dados) return null;

        return {
            periodo: dados.periodo,
            receitas: {
                total: dados.receitas.total,
                recebido: dados.receitas.recebido,
                pendente: dados.receitas.pendente,
                taxa: dados.receitas.taxa_recebimento
            },
            despesas: {
                total: dados.despesas.total,
                pago: dados.despesas.pago,
                pendente: dados.despesas.pendente,
                taxa: dados.despesas.total > 0
                    ? ((dados.despesas.pago / dados.despesas.total) * 100).toFixed(1)
                    : 0
            },
            resultado: dados.receitas.recebido - dados.despesas.pago,
            resultadoProjetado: dados.receitas.total - dados.despesas.total
        };
    },

    // Exportar dados para backup
    exportData() {
        return JSON.stringify(this.statusData, null, 2);
    },

    // Importar dados de backup
    importData(jsonString) {
        try {
            this.statusData = JSON.parse(jsonString);
            this.saveToStorage();
            return true;
        } catch (e) {
            console.error('Erro ao importar dados:', e);
            return false;
        }
    },

    // Limpar todos os dados
    clearAllData() {
        this.statusData = {};
        this.saveToStorage();
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    GestaoFinanceira.init();
});

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.GestaoFinanceira = GestaoFinanceira;
}
