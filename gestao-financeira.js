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

    // URL da API Vercel/Netlify (Produção)
    API_URL: (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
        ? '/api/sync-data'
        : 'https://starken-financeiro-production-0684.up.railway.app/api/sync-data',

    // URL do backend Railway (produção)
    RAILWAY_API_URL: 'https://starken-financeiro-production-0684.up.railway.app',
    // Para desenvolvimento local, use: 'http://localhost:3000'

    // Flag para controlar sincronização
    syncEnabled: true,
    syncInProgress: false,
    railwayAvailable: true,
    railwayRetryTimer: null,

    // Polling interval (30 segundos)
    pollingInterval: null,
    POLLING_TIME: 30000, // 30s

    isLocalhost() {
        return typeof window !== 'undefined'
            && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    },

    isRailwayEnabled() {
        return !this.isLocalhost() && !!this.RAILWAY_API_URL && this.railwayAvailable;
    },

    // Inicializar sistema
    init() {
        this.loadFromStorage();
        console.log('💰 Sistema de Gestão Financeira inicializado');

        // Carregar dados do servidor em background (não bloqueia)
        this.loadFromServer().then(() => {
            console.log('🔄 Iniciando sincronização forçada com o servidor...');
            this.syncToServer();
            window.dispatchEvent(new CustomEvent('gestao-sync-complete'));
        });
    },

    // Carregar dados do servidor
    async loadFromServer() {
        if (!this.syncEnabled) return;

        try {
            const response = await fetch(this.API_URL);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    // Mesclar dados do servidor com localStorage
                    this.mergeServerData(result.data);
                    console.log('☁️ Dados carregados do servidor');
                }
            }
        } catch (error) {
            console.log('⚠️ Servidor não disponível, usando localStorage');
        }
    },

    // Mesclar dados do servidor com localStorage
    mergeServerData(serverData) {
        // PRIORIDADE: dados locais são mais recentes que dados do servidor
        // Ordem correta: servidor primeiro, depois local (local sobrescreve)

        if (serverData.statusData && Object.keys(serverData.statusData).length > 0) {
            // Dados do servidor primeiro, depois sobrescreve com locais
            this.statusData = { ...serverData.statusData, ...this.statusData };
        }
        if (serverData.customItems && Object.keys(serverData.customItems).length > 0) {
            // Mesclar por mês para preservar dados locais
            const merged = { ...serverData.customItems };
            const buildItemKey = (item) => {
                const nome = String(item?.nome || '').trim().toLowerCase();
                const valor = Number(item?.valor ?? item?.valorOriginal ?? 0);
                const rawVencimento = item?.vencimento || item?.dataVencimento || '';
                let vencimento = String(rawVencimento || '').trim();
                if (vencimento.includes('T')) vencimento = vencimento.split('T')[0];
                if (vencimento.includes('/')) {
                    const [d, m, y] = vencimento.split('/');
                    if (d && m && y) {
                        vencimento = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    }
                }
                const empresa = String(item?.empresa || '').trim().toLowerCase();
                const tipoDetalhe = String(item?.tipoDetalhe || '').trim().toLowerCase();
                const tipo = String(item?.tipo || '').trim().toLowerCase();
                const grupo = tipoDetalhe || (tipo === 'despesa' || tipo === 'receita' ? '' : tipo);
                return `${nome}|${valor}|${vencimento}|${empresa}|${grupo}`;
            };
            const dedupeItems = (items) => Array.from(new Map(items.map(i => [buildItemKey(i), i])).values());
            Object.keys(this.customItems).forEach(mes => {
                if (!merged[mes]) {
                    merged[mes] = this.customItems[mes];
                } else {
                    // Mesclar despesas e receitas do mês
                    merged[mes] = {
                        despesas: [...(merged[mes].despesas || []), ...(this.customItems[mes].despesas || [])],
                        receitas: [...(merged[mes].receitas || []), ...(this.customItems[mes].receitas || [])]
                    };
                    merged[mes].despesas = dedupeItems(merged[mes].despesas);
                    merged[mes].receitas = dedupeItems(merged[mes].receitas);
                }
            });
            this.customItems = merged;
        }
        if (serverData.deletedItems && Object.keys(serverData.deletedItems).length > 0) {
            this.deletedItems = { ...serverData.deletedItems, ...this.deletedItems };
        }
        if (serverData.editedItems && Object.keys(serverData.editedItems).length > 0) {
            this.editedItems = { ...serverData.editedItems, ...this.editedItems };
        }

        // Salvar no localStorage
        this.saveToStorage();
        console.log('🔄 Dados mesclados - localStorage tem prioridade');
    },

    // Sincronizar com servidor
    async syncToServer() {
        if (!this.syncEnabled || this.syncInProgress || this.isLocalhost()) return;

        this.syncInProgress = true;
        try {
            const response = await fetch(this.API_URL + '/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    statusData: this.statusData,
                    customItems: this.customItems,
                    deletedItems: this.deletedItems,
                    editedItems: this.editedItems
                })
            });

            if (response.ok) {
                console.log('☁️ Dados sincronizados com servidor');
            }
        } catch (error) {
            console.log('⚠️ Erro ao sincronizar:', error.message);
        } finally {
            this.syncInProgress = false;
        }
    },

    // Salvar status no servidor
    async saveStatusToServer(mes, tipo, itemNome, status, dataPagamento) {
        if (!this.syncEnabled || this.isLocalhost()) return;

        try {
            await fetch(this.API_URL + '/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mes, tipo, itemNome, status, dataPagamento })
            });
        } catch (error) {
            console.log('⚠️ Erro ao salvar no servidor');
        }
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
            empresa: despesa.empresa || '',
            vencimento: despesa.vencimento || '',
            dataCriacao: new Date().toISOString(),
            isCustom: true,
            origemParcial: despesa.origemParcial || null,  // Nome da despesa mãe
            valorOriginal: despesa.valorOriginal || null,   // Valor original antes do parcial
            observacao: despesa.observacao || '',
            importRunId: despesa.importRunId || '',
            importedAt: despesa.importedAt || '',
            importSource: despesa.importSource || ''
        };

        if (!this.customItems[mes]) {
            this.customItems[mes] = { despesas: [], receitas: [] };
        }
        this.customItems[mes].despesas.push(novaDespesa);
        this.saveToStorage();

        // Sincronizar com servidor
        this.syncAddDespesaToServer(mes, novaDespesa);

        this.dispatchEvent('despesaAdded', { mes, despesa: novaDespesa });
        return novaDespesa;
    },

    async syncAddDespesaToServer(mes, despesa) {
        if (!this.syncEnabled) return;
        try {
            await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    acao: 'adicionar-despesa',
                    dados: { mes, ...despesa }
                })
            });
            console.log('✅ Despesa sincronizada com servidor');
        } catch (error) {
            console.error('❌ Erro ao sincronizar despesa:', error);
        }
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

        // Sincronizar com servidor
        this.syncEditDespesaToServer(mes, nomeOriginal, novosDados);

        this.dispatchEvent('despesaEdited', { mes, nomeOriginal, novosDados });
        return true;
    },

    async syncEditDespesaToServer(mes, nomeOriginal, novosDados) {
        if (!this.syncEnabled) return;
        try {
            await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    acao: 'editar-item',
                    dados: {
                        mes,
                        tipo: 'despesa',
                        nomeAtual: nomeOriginal,
                        novoNome: novosDados.nome,
                        novoValor: parseFloat(novosDados.valor),
                        novaCategoria: novosDados.categoria,
                        novoVencimento: novosDados.vencimento || ''
                    }
                })
            });
            console.log('✅ Edição sincronizada com servidor');
        } catch (error) {
            console.error('❌ Erro ao sincronizar edição:', error);
        }
    },

    // Excluir despesa
    deleteDespesa(mes, nome, isCustom = false) {
        console.log('deleteDespesa chamado:', { mes, nome, isCustom });

        let deleted = false;
        const smartDeletedNames = [];

        // 1. Tentar remover de customItems primeiro
        if (this.customItems[mes] && this.customItems[mes].despesas) {
            const antes = this.customItems[mes].despesas.length;
            this.customItems[mes].despesas = this.customItems[mes].despesas.filter(d => {
                const match = d.nome === nome || d.nome.trim() === nome.trim();
                if (match) {
                    console.log('Removendo de customItems:', d.nome);
                    if (d.importSource === 'royalties-alpha-smart') {
                        smartDeletedNames.push(d.nome);
                    }
                }
                return !match;
            });
            if (this.customItems[mes].despesas.length < antes) {
                deleted = true;
                console.log('Item removido de customItems');
                if (isCustom && this.deletedItems[mes]?.despesas) {
                    this.deletedItems[mes].despesas = this.deletedItems[mes].despesas.filter(n => n !== nome);
                }
                if (!isCustom) {
                    if (!this.deletedItems[mes]) {
                        this.deletedItems[mes] = { despesas: [], receitas: [] };
                    }
                    if (!this.deletedItems[mes].despesas.includes(nome)) {
                        this.deletedItems[mes].despesas.push(nome);
                    }
                }
            }
        }

        // 2. Tentar remover de editedItems (itens originais que foram editados)
        if (this.editedItems[mes] && this.editedItems[mes].despesas) {
            // Procurar por nome original que foi editado para este nome
            for (const [nomeOriginal, dados] of Object.entries(this.editedItems[mes].despesas)) {
                if (dados.nome === nome || nomeOriginal === nome) {
                    delete this.editedItems[mes].despesas[nomeOriginal];
                    // Também marcar o original como deletado
                    if (!this.deletedItems[mes]) {
                        this.deletedItems[mes] = { despesas: [], receitas: [] };
                    }
                    if (!this.deletedItems[mes].despesas.includes(nomeOriginal)) {
                        this.deletedItems[mes].despesas.push(nomeOriginal);
                    }
                    deleted = true;
                    console.log('Item removido de editedItems:', nomeOriginal);
                    break;
                }
            }
        }

        // 3. Se não foi deletado de nenhum lugar, marcar como deletado (item original)
        if (!deleted && !isCustom) {
            if (!this.deletedItems[mes]) {
                this.deletedItems[mes] = { despesas: [], receitas: [] };
            }
            if (!this.deletedItems[mes].despesas.includes(nome)) {
                this.deletedItems[mes].despesas.push(nome);
                console.log('Item marcado como deletado:', nome);
            }
        }

        if (smartDeletedNames.length > 0) {
            if (!this.deletedItems[mes]) {
                this.deletedItems[mes] = { despesas: [], receitas: [] };
            }
            smartDeletedNames.forEach(itemNome => {
                if (!this.deletedItems[mes].despesas.includes(itemNome)) {
                    this.deletedItems[mes].despesas.push(itemNome);
                }
            });
        }

        this.saveToStorage();

        // Sincronizar com servidor
        this.syncDeleteDespesaToServer(mes, nome);
        this.syncToServer();

        this.dispatchEvent('despesaDeleted', { mes, nome });
        return true;
    },

    async syncDeleteDespesaToServer(mes, nome) {
        if (!this.syncEnabled) return;
        try {
            await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    acao: 'remover-item',
                    dados: { mes, tipo: 'despesa', nome }
                })
            });
            console.log('✅ Exclusão sincronizada com servidor');
        } catch (error) {
            console.error('❌ Erro ao sincronizar exclusão:', error);
        }
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
            origemParcial: receita.origemParcial || null,
            valorOriginal: receita.valorOriginal || null,
            observacao: receita.observacao || '',
            dataVencimento: receita.dataVencimento || '',
            dataCriacao: new Date().toISOString(),
            isCustom: true,
            importRunId: receita.importRunId || '',
            importedAt: receita.importedAt || '',
            importSource: receita.importSource || ''
        };

        if (!this.customItems[mes]) {
            this.customItems[mes] = { despesas: [], receitas: [] };
        }
        this.customItems[mes].receitas.push(novaReceita);
        this.saveToStorage();

        // Sincronizar com servidor
        this.syncAddReceitaToServer(mes, novaReceita);

        this.dispatchEvent('receitaAdded', { mes, receita: novaReceita });
        return novaReceita;
    },

    async syncAddReceitaToServer(mes, receita) {
        if (!this.syncEnabled) return;
        try {
            await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    acao: 'adicionar-receita',
                    dados: { mes, ...receita, categoria: receita.empresa }
                })
            });
            console.log('✅ Receita sincronizada com servidor');
        } catch (error) {
            console.error('❌ Erro ao sincronizar receita:', error);
        }
    },

    // Editar receita existente
    editReceita(mes, nomeOriginal, novosDados) {
        if (!this.editedItems[mes]) {
            this.editedItems[mes] = { despesas: {}, receitas: {} };
        }

        this.editedItems[mes].receitas[nomeOriginal] = {
            ...novosDados,
            valor: parseFloat(novosDados.valor),
            dataEdicao: new Date().toISOString(),
            novoVencimento: novosDados.vencimento || ''
        };

        this.saveToStorage();

        // Sincronizar com servidor
        this.syncEditReceitaToServer(mes, nomeOriginal, novosDados);

        this.dispatchEvent('receitaEdited', { mes, nomeOriginal, novosDados });
        return true;
    },

    async syncEditReceitaToServer(mes, nomeOriginal, novosDados) {
        if (!this.syncEnabled) return;
        try {
            await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    acao: 'editar-item',
                    dados: {
                        mes,
                        tipo: 'receita',
                        nomeAtual: nomeOriginal,
                        novoNome: novosDados.nome,
                        novoValor: parseFloat(novosDados.valor),
                        novaCategoria: novosDados.empresa,
                        novoVencimento: novosDados.vencimento || ''
                    }
                })
            });
            console.log('✅ Edição de receita sincronizada com servidor');
        } catch (error) {
            console.error('❌ Erro ao sincronizar edição de receita:', error);
        }
    },

    // Excluir receita
    deleteReceita(mes, nome, isCustom = false) {
        let deleted = false;
        if (this.customItems[mes] && this.customItems[mes].receitas) {
            const antes = this.customItems[mes].receitas.length;
            this.customItems[mes].receitas = this.customItems[mes].receitas.filter(r => r.nome !== nome);
            if (this.customItems[mes].receitas.length < antes) {
                deleted = true;
            }
        }
        if (isCustom && this.deletedItems[mes]?.receitas) {
            this.deletedItems[mes].receitas = this.deletedItems[mes].receitas.filter(n => n !== nome);
        }
        if (!deleted && !isCustom) {
            if (!this.deletedItems[mes]) {
                this.deletedItems[mes] = { despesas: [], receitas: [] };
            }
            if (!this.deletedItems[mes].receitas.includes(nome)) {
                this.deletedItems[mes].receitas.push(nome);
            }
        }

        this.saveToStorage();

        // Sincronizar com servidor
        this.syncDeleteReceitaToServer(mes, nome);
        this.syncToServer();

        this.dispatchEvent('receitaDeleted', { mes, nome });
        return true;
    },

    async syncDeleteReceitaToServer(mes, nome) {
        if (!this.syncEnabled) return;
        try {
            await fetch(this.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    acao: 'remover-item',
                    dados: { mes, tipo: 'receita', nome }
                })
            });
            console.log('✅ Exclusão de receita sincronizada com servidor');
        } catch (error) {
            console.error('❌ Erro ao sincronizar exclusão de receita:', error);
        }
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
        const finalDate = dataPagamento || (status === 'Pago' || status === 'Recebido' ? new Date().toISOString().split('T')[0] : null);

        this.statusData[id] = {
            status: status,
            dataPagamento: finalDate,
            updatedAt: new Date().toISOString()
        };
        this.saveToStorage();

        // Sincronizar com servidor
        this.saveStatusToServer(mes, tipo, nome, status, finalDate);

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
        const disableBaseDespesas = typeof localStorage !== 'undefined' && localStorage.getItem('starken_disable_base_despesas') === '1';
        if (disableBaseDespesas && dados.despesas) {
            dados.despesas = { total: 0, pago: 0, pendente: 0, categorias: {} };
        }

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
                    if (this.isDeleted(mes, 'receita', receita.nome)) {
                        return;
                    }
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
                    if (this.isDeleted(mes, 'despesa', despesa.nome)) {
                        return;
                    }
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
    },

    // ========== BACKUP E RESTAURAÇÃO ==========

    // Exportar todos os dados para JSON
    exportData() {
        const data = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            statusData: this.statusData,
            customItems: this.customItems,
            deletedItems: this.deletedItems,
            editedItems: this.editedItems
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `starken-financeiro-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('📦 Dados exportados com sucesso!');
        return true;
    },

    async exportToRailway() {
        try {
            const response = await fetch(`${this.RAILWAY_API_URL}/api/sync-data/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    statusData: this.statusData,
                    customItems: this.customItems,
                    deletedItems: this.deletedItems,
                    editedItems: this.editedItems
                })
            });
            if (!response.ok) {
                throw new Error('Falha ao exportar');
            }
            const result = await response.json();
            return !!result.success;
        } catch (error) {
            console.warn('⚠️ Erro ao exportar para produção:', error.message);
            return false;
        }
    },

    // Importar dados de arquivo JSON
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Validar estrutura do arquivo
                    if (!data.version || !data.statusData) {
                        throw new Error('Arquivo de backup inválido');
                    }

                    // Restaurar dados
                    this.statusData = data.statusData || {};
                    this.customItems = data.customItems || {};
                    this.deletedItems = data.deletedItems || {};
                    this.editedItems = data.editedItems || {};

                    // Salvar no localStorage
                    this.saveToStorage();

                    console.log('✅ Dados importados com sucesso!');
                    console.log('📅 Data do backup:', data.exportDate);

                    resolve({
                        success: true,
                        date: data.exportDate,
                        message: 'Dados restaurados com sucesso!'
                    });
                } catch (error) {
                    console.error('❌ Erro ao importar:', error);
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsText(file);
        });
    },

    // Obter estatísticas dos dados salvos
    getStats() {
        const statusCount = Object.keys(this.statusData).length;
        const customCount = Object.values(this.customItems).reduce((acc, month) => {
            return acc + (month.despesas?.length || 0) + (month.receitas?.length || 0);
        }, 0);

        return {
            statusRecords: statusCount,
            customItems: customCount,
            hasData: statusCount > 0 || customCount > 0
        };
    },

    // ============================================
    // SINCRONIZAÇÃO EM TEMPO REAL (Railway API)
    // ============================================

    // Sincronizar dados de um mês específico com o servidor
    async syncMesWithServer(mes) {
        if (!this.isRailwayEnabled()) {
            return false;
        }
        if (this.syncInProgress) {
            console.log('⏳ Sincronização já em andamento...');
            return;
        }

        this.syncInProgress = true;

        try {
            // Buscar dados do servidor
            const response = await fetch(`${this.RAILWAY_API_URL}/api/dados/${mes}`);

            if (!response.ok) {
                throw new Error('Falha na sincronização');
            }

            const result = await response.json();

            if (result.success && result.data) {
                // Mesclar dados do servidor com localStorage
                this.mergeRailwayData(mes, result.data);

                // Salvar no localStorage
                this.saveToStorage();

                // Disparar evento de sincronização completa
                window.dispatchEvent(new CustomEvent('gestao-railway-sync', {
                    detail: { mes, timestamp: new Date() }
                }));

                console.log(`✅ Dados de ${mes} sincronizados com o servidor`);
                this.railwayAvailable = true;
                return true;
            }
        } catch (error) {
            console.warn('⚠️ Erro na sincronização:', error.message);
            this.railwayAvailable = false;
            this.stopPolling();
            if (this.railwayRetryTimer) {
                clearTimeout(this.railwayRetryTimer);
            }
            this.railwayRetryTimer = setTimeout(() => {
                this.railwayAvailable = true;
                this.startPolling(mes);
            }, 60000);
            return false;
        } finally {
            this.syncInProgress = false;
        }
    },

    // Mesclar dados do Railway com localStorage
    mergeRailwayData(mes, serverData) {
        // Aplicar customItems
        if (serverData.customItems) {
            const local = this.customItems[mes] || { despesas: [], receitas: [] };
            const server = serverData.customItems || {};
            const merged = {
                despesas: [...(server.despesas || []), ...(local.despesas || [])],
                receitas: [...(server.receitas || []), ...(local.receitas || [])]
            };
            const buildItemKey = (item) => {
                const nome = String(item?.nome || '').trim().toLowerCase();
                const valor = Number(item?.valor ?? item?.valorOriginal ?? 0);
                const rawVencimento = item?.vencimento || item?.dataVencimento || '';
                let vencimento = String(rawVencimento || '').trim();
                if (vencimento.includes('T')) vencimento = vencimento.split('T')[0];
                if (vencimento.includes('/')) {
                    const [d, m, y] = vencimento.split('/');
                    if (d && m && y) {
                        vencimento = `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
                    }
                }
                const empresa = String(item?.empresa || '').trim().toLowerCase();
                const tipoDetalhe = String(item?.tipoDetalhe || '').trim().toLowerCase();
                const tipo = String(item?.tipo || '').trim().toLowerCase();
                const grupo = tipoDetalhe || (tipo === 'despesa' || tipo === 'receita' ? '' : tipo);
                return `${nome}|${valor}|${vencimento}|${empresa}|${grupo}`;
            };
            const dedupeItems = (items) => Array.from(new Map(items.map(i => [buildItemKey(i), i])).values());
            merged.despesas = dedupeItems(merged.despesas);
            merged.receitas = dedupeItems(merged.receitas);
            this.customItems[mes] = merged;
        }

        // Aplicar deletedItems
        if (serverData.deletedItems) {
            const localDeleted = this.deletedItems[mes] || { despesas: [], receitas: [] };
            const serverDeleted = serverData.deletedItems || {};
            this.deletedItems[mes] = {
                despesas: Array.from(new Set([...(serverDeleted.despesas || []), ...(localDeleted.despesas || [])])),
                receitas: Array.from(new Set([...(serverDeleted.receitas || []), ...(localDeleted.receitas || [])]))
            };
        }

        // Aplicar editedItems
        if (serverData.editedItems) {
            const localEdited = this.editedItems[mes] || { despesas: {}, receitas: {} };
            const serverEdited = serverData.editedItems || {};
            this.editedItems[mes] = {
                despesas: { ...(serverEdited.despesas || {}), ...(localEdited.despesas || {}) },
                receitas: { ...(serverEdited.receitas || {}), ...(localEdited.receitas || {}) }
            };
        }

        // Aplicar statusData
        if (serverData.statusData) {
            Object.assign(this.statusData, serverData.statusData);
        }

    },

    // Enviar mudança local para o servidor
    async pushToServer(tipo, acao, dados) {
        if (!this.isRailwayEnabled()) {
            return false;
        }
        try {
            let endpoint, method, body;

            switch (acao) {
                case 'criar_despesa':
                    endpoint = '/api/despesas';
                    method = 'POST';
                    body = dados;
                    break;

                case 'atualizar_despesa':
                    endpoint = `/api/despesas/${dados.id}`;
                    method = 'PUT';
                    body = dados;
                    break;

                case 'deletar_despesa':
                    endpoint = `/api/despesas/${dados.id}`;
                    method = 'DELETE';
                    break;

                case 'atualizar_status':
                    endpoint = '/api/status';
                    method = 'PUT';
                    body = dados;
                    break;

                case 'deletar_item':
                    endpoint = '/api/itens/deletar';
                    method = 'POST';
                    body = dados;
                    break;

                case 'editar_item':
                    endpoint = '/api/itens/editar';
                    method = 'PUT';
                    body = dados;
                    break;

                default:
                    console.warn('Ação não reconhecida:', acao);
                    return false;
            }

            const response = await fetch(`${this.RAILWAY_API_URL}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: body ? JSON.stringify(body) : undefined
            });

            if (!response.ok) {
                throw new Error('Falha ao enviar dados');
            }

            const result = await response.json();
            console.log(`✅ ${acao} enviado para o servidor`);
            return result.success;

        } catch (error) {
            console.warn('⚠️ Erro ao enviar para servidor:', error.message);
            return false;
        }
    },

    // Iniciar polling automático
    startPolling(mes) {
        if (!this.isRailwayEnabled()) {
            return;
        }
        if (this.pollingInterval) {
            this.stopPolling();
        }

        console.log(`🔄 Polling iniciado para ${mes} (a cada ${this.POLLING_TIME/1000}s)`);

        // Primeira sincronização imediata
        this.syncMesWithServer(mes);

        // Polling periódico
        this.pollingInterval = setInterval(() => {
            this.syncMesWithServer(mes);
        }, this.POLLING_TIME);
    },

    // Parar polling
    stopPolling() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
            console.log('⏹️ Polling parado');
        }
    },

    // Mostrar indicador de sincronização
    showSyncIndicator(show = true) {
        let indicator = document.getElementById('sync-indicator');

        if (!indicator && show) {
            indicator = document.createElement('div');
            indicator.id = 'sync-indicator';
            indicator.innerHTML = '🔄 Sincronizando...';
            indicator.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #4A6B54;
                color: white;
                padding: 10px 20px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: 600;
                z-index: 9999;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                animation: fadeIn 0.3s ease;
            `;
            document.body.appendChild(indicator);
        } else if (indicator && !show) {
            indicator.remove();
        }
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
