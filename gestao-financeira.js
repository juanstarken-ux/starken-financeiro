// =====================================================
// SISTEMA DE GESTÃO FINANCEIRA - STARKEN TECNOLOGIA
// =====================================================
// Gerenciamento centralizado de contas a pagar e receber
// com persistência em localStorage e CRUD completo

const GestaoFinanceira = {
    // Chaves do localStorage
    STORAGE_KEY: 'starken_financeiro_status',
    CUSTOM_ITEMS_KEY: 'starken_financeiro_custom_items',
    DELETED_ITEMS_KEY: 'starken_financeiro_deleted_items',
    EDITED_ITEMS_KEY: 'starken_financeiro_edited_items',

    // Inicializar sistema
    init() {
        this.loadFromStorage();
        console.log('💰 Sistema de Gestão Financeira inicializado');
    },

    // Carregar dados do localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            this.statusData = saved ? JSON.parse(saved) : {};

            const customItems = localStorage.getItem(this.CUSTOM_ITEMS_KEY);
            this.customItems = customItems ? JSON.parse(customItems) : {};

            const deletedItems = localStorage.getItem(this.DELETED_ITEMS_KEY);
            this.deletedItems = deletedItems ? JSON.parse(deletedItems) : {};

            const editedItems = localStorage.getItem(this.EDITED_ITEMS_KEY);
            this.editedItems = editedItems ? JSON.parse(editedItems) : {};
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            this.statusData = {};
            this.customItems = {};
            this.deletedItems = {};
            this.editedItems = {};
        }
    },

    // Salvar dados no localStorage
    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.statusData));
            localStorage.setItem(this.CUSTOM_ITEMS_KEY, JSON.stringify(this.customItems));
            localStorage.setItem(this.DELETED_ITEMS_KEY, JSON.stringify(this.deletedItems));
            localStorage.setItem(this.EDITED_ITEMS_KEY, JSON.stringify(this.editedItems));
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
        }
    },

    // Gerar ID único para um item
    generateId(mes, tipo, nome) {
        return `${mes}_${tipo}_${nome.replace(/\s+/g, '_').toLowerCase()}`;
    },

    // Gerar ID único para novos itens
    generateUniqueId() {
        return 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // ========== CRUD - DESPESAS ==========

    // Adicionar nova despesa
    addDespesa(mes, despesa) {
        const id = this.generateUniqueId();
        const novaDespesa = {
            id: id,
            nome: despesa.nome,
            valor: parseFloat(despesa.valor),
            categoria: despesa.categoria || 'outros',
            status: despesa.status || 'A Pagar',
            tipo: despesa.tipo || '',
            funcao: despesa.funcao || '',
            dataCriacao: new Date().toISOString(),
            isCustom: true
        };

        if (!this.customItems[mes]) {
            this.customItems[mes] = { despesas: [], receitas: [] };
        }
        this.customItems[mes].despesas.push(novaDespesa);
        this.saveToStorage();

        this.dispatchEvent('despesaAdded', { mes, despesa: novaDespesa });
        return novaDespesa;
    },

    // Editar despesa existente
    editDespesa(mes, nomeOriginal, novosDados) {
        const id = this.generateId(mes, 'despesa', nomeOriginal);

        if (!this.editedItems[mes]) {
            this.editedItems[mes] = { despesas: {}, receitas: {} };
        }

        this.editedItems[mes].despesas[nomeOriginal] = {
            ...novosDados,
            valor: parseFloat(novosDados.valor),
            dataEdicao: new Date().toISOString()
        };

        this.saveToStorage();
        this.dispatchEvent('despesaEdited', { mes, nomeOriginal, novosDados });
        return true;
    },

    // Excluir despesa
    deleteDespesa(mes, nome, isCustom = false) {
        if (isCustom) {
            // Remover de customItems
            if (this.customItems[mes] && this.customItems[mes].despesas) {
                this.customItems[mes].despesas = this.customItems[mes].despesas.filter(d => d.nome !== nome);
            }
        } else {
            // Marcar como deletado
            if (!this.deletedItems[mes]) {
                this.deletedItems[mes] = { despesas: [], receitas: [] };
            }
            if (!this.deletedItems[mes].despesas.includes(nome)) {
                this.deletedItems[mes].despesas.push(nome);
            }
        }

        this.saveToStorage();
        this.dispatchEvent('despesaDeleted', { mes, nome });
        return true;
    },

    // Restaurar despesa excluída
    restoreDespesa(mes, nome) {
        if (this.deletedItems[mes] && this.deletedItems[mes].despesas) {
            this.deletedItems[mes].despesas = this.deletedItems[mes].despesas.filter(n => n !== nome);
            this.saveToStorage();
            this.dispatchEvent('despesaRestored', { mes, nome });
        }
        return true;
    },

    // ========== CRUD - RECEITAS ==========

    // Adicionar nova receita
    addReceita(mes, receita) {
        const id = this.generateUniqueId();
        const novaReceita = {
            id: id,
            nome: receita.nome,
            valor: parseFloat(receita.valor),
            empresa: receita.empresa || 'Starken',
            status: receita.status || 'A Receber',
            origem: receita.origem || '',
            dataCriacao: new Date().toISOString(),
            isCustom: true
        };

        if (!this.customItems[mes]) {
            this.customItems[mes] = { despesas: [], receitas: [] };
        }
        this.customItems[mes].receitas.push(novaReceita);
        this.saveToStorage();

        this.dispatchEvent('receitaAdded', { mes, receita: novaReceita });
        return novaReceita;
    },

    // Editar receita existente
    editReceita(mes, nomeOriginal, novosDados) {
        if (!this.editedItems[mes]) {
            this.editedItems[mes] = { despesas: {}, receitas: {} };
        }

        this.editedItems[mes].receitas[nomeOriginal] = {
            ...novosDados,
            valor: parseFloat(novosDados.valor),
            dataEdicao: new Date().toISOString()
        };

        this.saveToStorage();
        this.dispatchEvent('receitaEdited', { mes, nomeOriginal, novosDados });
        return true;
    },

    // Excluir receita
    deleteReceita(mes, nome, isCustom = false) {
        if (isCustom) {
            if (this.customItems[mes] && this.customItems[mes].receitas) {
                this.customItems[mes].receitas = this.customItems[mes].receitas.filter(r => r.nome !== nome);
            }
        } else {
            if (!this.deletedItems[mes]) {
                this.deletedItems[mes] = { despesas: [], receitas: [] };
            }
            if (!this.deletedItems[mes].receitas.includes(nome)) {
                this.deletedItems[mes].receitas.push(nome);
            }
        }

        this.saveToStorage();
        this.dispatchEvent('receitaDeleted', { mes, nome });
        return true;
    },

    // ========== STATUS ==========

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

        this.dispatchEvent('financeiroUpdated', { mes, tipo, nome, status });
        return this.statusData[id];
    },

    // ========== OBTER DADOS ==========

    // Verificar se item foi deletado
    isDeleted(mes, tipo, nome) {
        if (!this.deletedItems[mes]) return false;
        const list = tipo === 'despesa' ? this.deletedItems[mes].despesas : this.deletedItems[mes].receitas;
        return list && list.includes(nome);
    },

    // Obter edições de um item
    getEdits(mes, tipo, nome) {
        if (!this.editedItems[mes]) return null;
        const edits = tipo === 'despesa' ? this.editedItems[mes].despesas : this.editedItems[mes].receitas;
        return edits ? edits[nome] : null;
    },

    // Obter todos os dados de um mês com status atualizados
    getDadosMesComStatus(mes) {
        if (!dadosMensais || !dadosMensais[mes]) return null;

        const dados = JSON.parse(JSON.stringify(dadosMensais[mes])); // Deep clone

        // ========== PROCESSAR RECEITAS ==========
        if (dados.receitas && dados.receitas.clientes) {
            let recebido = 0;
            let pendente = 0;
            let total = 0;

            // Filtrar itens deletados e aplicar edições
            dados.receitas.clientes = dados.receitas.clientes
                .filter(cliente => !this.isDeleted(mes, 'receita', cliente.nome))
                .map(cliente => {
                    // Aplicar edições
                    const edits = this.getEdits(mes, 'receita', cliente.nome);
                    if (edits) {
                        cliente = { ...cliente, ...edits };
                    }

                    // Aplicar status salvo
                    const savedStatus = this.getStatus(mes, 'receita', cliente.nome);
                    if (savedStatus) {
                        cliente.status = savedStatus.status;
                        cliente.dataPagamento = savedStatus.dataPagamento;
                    }

                    return cliente;
                });

            // Adicionar itens customizados
            if (this.customItems[mes] && this.customItems[mes].receitas) {
                this.customItems[mes].receitas.forEach(receita => {
                    const savedStatus = this.getStatus(mes, 'receita', receita.nome);
                    if (savedStatus) {
                        receita.status = savedStatus.status;
                        receita.dataPagamento = savedStatus.dataPagamento;
                    }
                    dados.receitas.clientes.push(receita);
                });
            }

            // Recalcular totais
            dados.receitas.clientes.forEach(cliente => {
                total += cliente.valor;
                if (cliente.status === 'Recebido' || cliente.status === 'Feito') {
                    recebido += cliente.valor;
                } else if (cliente.status !== 'TCV' && cliente.status !== 'Bônus') {
                    pendente += cliente.valor;
                }
            });

            dados.receitas.total = total;
            dados.receitas.recebido = recebido;
            dados.receitas.pendente = pendente;
            dados.receitas.taxa_recebimento = total > 0 ? ((recebido / total) * 100).toFixed(1) : 0;
        }

        // ========== PROCESSAR DESPESAS ==========
        if (dados.despesas && dados.despesas.categorias) {
            let pago = 0;
            let pendente = 0;
            let total = 0;

            for (const [categoriaKey, categoriaData] of Object.entries(dados.despesas.categorias)) {
                if (categoriaData.itens && Array.isArray(categoriaData.itens)) {
                    // Filtrar itens deletados e aplicar edições
                    categoriaData.itens = categoriaData.itens
                        .filter(item => !this.isDeleted(mes, 'despesa', item.nome))
                        .map(item => {
                            // Aplicar edições
                            const edits = this.getEdits(mes, 'despesa', item.nome);
                            if (edits) {
                                item = { ...item, ...edits };
                            }

                            // Aplicar status salvo
                            const savedStatus = this.getStatus(mes, 'despesa', item.nome);
                            if (savedStatus) {
                                item.status = savedStatus.status;
                                item.dataPagamento = savedStatus.dataPagamento;
                            }

                            return item;
                        });

                    // Calcular totais da categoria
                    let catTotal = 0;
                    categoriaData.itens.forEach(item => {
                        catTotal += item.valor;
                        total += item.valor;
                        if (item.status === 'Pago' || item.status === 'Feito') {
                            pago += item.valor;
                        } else {
                            pendente += item.valor;
                        }
                    });
                    categoriaData.total = catTotal;
                }
            }

            // Adicionar itens customizados
            if (this.customItems[mes] && this.customItems[mes].despesas) {
                this.customItems[mes].despesas.forEach(despesa => {
                    const savedStatus = this.getStatus(mes, 'despesa', despesa.nome);
                    if (savedStatus) {
                        despesa.status = savedStatus.status;
                        despesa.dataPagamento = savedStatus.dataPagamento;
                    }

                    // Adicionar na categoria correta
                    const cat = despesa.categoria || 'outros';
                    if (!dados.despesas.categorias[cat]) {
                        dados.despesas.categorias[cat] = { total: 0, itens: [] };
                    }
                    dados.despesas.categorias[cat].itens.push(despesa);
                    dados.despesas.categorias[cat].total += despesa.valor;

                    total += despesa.valor;
                    if (despesa.status === 'Pago' || despesa.status === 'Feito') {
                        pago += despesa.valor;
                    } else {
                        pendente += despesa.valor;
                    }
                });
            }

            dados.despesas.total = total;
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

    // Obter lista de itens deletados
    getDeletedItems(mes) {
        return this.deletedItems[mes] || { despesas: [], receitas: [] };
    },

    // ========== UTILITÁRIOS ==========

    // Disparar evento customizado
    dispatchEvent(eventName, detail) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    },

    // Exportar dados para backup
    exportData() {
        return JSON.stringify({
            statusData: this.statusData,
            customItems: this.customItems,
            deletedItems: this.deletedItems,
            editedItems: this.editedItems,
            exportDate: new Date().toISOString()
        }, null, 2);
    },

    // Importar dados de backup
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            this.statusData = data.statusData || {};
            this.customItems = data.customItems || {};
            this.deletedItems = data.deletedItems || {};
            this.editedItems = data.editedItems || {};
            this.saveToStorage();
            return true;
        } catch (e) {
            console.error('Erro ao importar dados:', e);
            return false;
        }
    },

    // Limpar todos os dados customizados de um mês
    clearMonthData(mes) {
        delete this.customItems[mes];
        delete this.deletedItems[mes];
        delete this.editedItems[mes];

        // Limpar status do mês
        Object.keys(this.statusData).forEach(key => {
            if (key.startsWith(mes)) {
                delete this.statusData[key];
            }
        });

        this.saveToStorage();
    },

    // Limpar todos os dados
    clearAllData() {
        this.statusData = {};
        this.customItems = {};
        this.deletedItems = {};
        this.editedItems = {};
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
