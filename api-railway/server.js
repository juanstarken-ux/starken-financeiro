const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const prisma = new PrismaClient();

// ============================================
// FUNÇÃO DE RESTAURAÇÃO INTEGRADA
// ============================================
async function restoreData() {
    try {
        console.log('📦 Iniciando restauração de dados via Endpoint...');
        
        // Ler arquivo de backup
        const backupPath = path.join(__dirname, 'backup-starken-completo.json');
        
        if (!fs.existsSync(backupPath)) {
            return { success: false, error: 'Arquivo backup-starken-completo.json não encontrado na raiz!' };
        }

        const backupContent = fs.readFileSync(backupPath, 'utf8');
        const backup = JSON.parse(backupContent);

        // Parsear os dados do LocalStorage
        const customItems = backup.customItems ? JSON.parse(backup.customItems) : {};
        const statusData = backup.statusData ? JSON.parse(backup.statusData) : {};
        const deletedItems = backup.deletedItems ? JSON.parse(backup.deletedItems) : {};
        const editedItems = backup.editedItems ? JSON.parse(backup.editedItems) : {};

        let stats = {
            customItems: 0,
            statusData: 0,
            deletedItems: 0,
            editedItems: 0
        };

        // 1. Restaurar Custom Items
        for (const [mes, dados] of Object.entries(customItems)) {
            if (dados.despesas && Array.isArray(dados.despesas)) {
                for (const item of dados.despesas) {
                    try {
                        await prisma.customItem.create({
                            data: {
                                mes,
                                tipo: 'despesa',
                                nome: item.nome,
                                valor: parseFloat(item.valor),
                                categoria: item.categoria || 'Outros',
                                status: item.status || 'A Pagar',
                                vencimento: item.vencimento || null,
                                dataPagamento: item.dataPagamento || null,
                                funcao: item.funcao || null,
                                tipoDetalhe: item.tipo || null,
                                empresa: item.empresa || null
                            }
                        });
                        stats.customItems++;
                    } catch (e) {}
                }
            }
            if (dados.receitas && Array.isArray(dados.receitas)) {
                for (const item of dados.receitas) {
                    try {
                        await prisma.customItem.create({
                            data: {
                                mes,
                                tipo: 'receita',
                                nome: item.nome,
                                valor: parseFloat(item.valor),
                                categoria: item.categoria || item.empresa || 'Outros',
                                status: item.status || 'A Receber',
                                vencimento: item.vencimento || null,
                                dataPagamento: item.dataPagamento || null,
                                empresa: item.empresa || null
                            }
                        });
                        stats.customItems++;
                    } catch (e) {}
                }
            }
        }

        // 2. Restaurar Status
        for (const [id, dados] of Object.entries(statusData)) {
            const parts = id.split('_');
            if (parts.length >= 3) {
                const mes = parts[0];
                const tipo = parts[1];
                const itemNome = parts.slice(2).join('_').replace(/_/g, ' ');
                try {
                    await prisma.paymentStatus.upsert({
                        where: { mes_tipo_itemNome: { mes, tipo, itemNome } },
                        update: { status: dados.status, dataPagamento: dados.dataPagamento },
                        create: { mes, tipo, itemNome, status: dados.status, dataPagamento: dados.dataPagamento }
                    });
                    stats.statusData++;
                } catch (e) {}
            }
        }

        // 3. Restaurar Deletados
        for (const [mes, dados] of Object.entries(deletedItems)) {
            if (dados.despesas) {
                for (const nome of dados.despesas) {
                    await prisma.deletedItem.create({
                        data: { mes, tipo: 'despesa', itemNome: nome }
                    }).catch(() => {});
                    stats.deletedItems++;
                }
            }
            if (dados.receitas) {
                for (const nome of dados.receitas) {
                    await prisma.deletedItem.create({
                        data: { mes, tipo: 'receita', itemNome: nome }
                    }).catch(() => {});
                    stats.deletedItems++;
                }
            }
        }

        // 4. Restaurar Editados
        for (const [mes, dados] of Object.entries(editedItems)) {
            if (dados.despesas) {
                for (const [nomeOriginal, edit] of Object.entries(dados.despesas)) {
                    await prisma.editedItem.create({
                        data: {
                            mes,
                            tipo: 'despesa',
                            itemNome: nomeOriginal,
                            novoNome: edit.nome,
                            novoValor: parseFloat(edit.valor),
                            novaCategoria: edit.categoria
                        }
                    }).catch(e => {});
                    stats.editedItems++;
                }
            }
            if (dados.receitas) {
                for (const [nomeOriginal, edit] of Object.entries(dados.receitas)) {
                    await prisma.editedItem.create({
                        data: {
                            mes,
                            tipo: 'receita',
                            itemNome: nomeOriginal,
                            novoNome: edit.nome,
                            novoValor: parseFloat(edit.valor),
                            novaCategoria: edit.categoria || edit.empresa
                        }
                    }).catch(e => {});
                    stats.editedItems++;
                }
            }
        }

        return { success: true, stats };

    } catch (error) {
        console.error('❌ Erro fatal na restauração:', error);
        return { success: false, error: error.message };
    }
}

// ROTA DE RESTAURAÇÃO (PRIORITÁRIA)
app.get('/restore', async (req, res) => {
    console.log('🔄 Recebida solicitação de restore...');
    const result = await restoreData();
    res.json(result);
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'STARK CFO Virtual API',
    version: '3.1.0',
    restore_enabled: true
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', database: 'connected' });
});

// ============================================
// CRUD BÁSICO PARA O FRONTEND
// ============================================

// GET /api/dados/:mes - Buscar todos os dados de um mês
app.get('/api/dados/:mes', async (req, res) => {
  try {
    const { mes } = req.params;

    // Buscar dados do banco
    const [customItems, deletedItems, editedItems, paymentStatus] = await Promise.all([
      prisma.customItem.findMany({ where: { mes } }),
      prisma.deletedItem.findMany({ where: { mes } }),
      prisma.editedItem.findMany({ where: { mes } }),
      prisma.paymentStatus.findMany({ where: { mes } })
    ]);

    res.json({
      success: true,
      data: {
        mes,
        customItems: {
          despesas: customItems.filter(i => i.tipo === 'despesa'),
          receitas: customItems.filter(i => i.tipo === 'receita')
        },
        deletedItems: {
          despesas: deletedItems.filter(i => i.tipo === 'despesa').map(i => i.itemNome),
          receitas: deletedItems.filter(i => i.tipo === 'receita').map(i => i.itemNome)
        },
        editedItems: {
          despesas: editedItems.filter(i => i.tipo === 'despesa').reduce((acc, i) => {
            acc[i.itemNome] = {
              nome: i.novoNome || i.itemNome,
              valor: i.novoValor,
              categoria: i.novaCategoria
            };
            return acc;
          }, {}),
          receitas: editedItems.filter(i => i.tipo === 'receita').reduce((acc, i) => {
            acc[i.itemNome] = {
              nome: i.novoNome || i.itemNome,
              valor: i.novoValor,
              categoria: i.novaCategoria
            };
            return acc;
          }, {})
        },
        statusData: paymentStatus.reduce((acc, s) => {
          acc[`${s.mes}_${s.tipo}_${s.itemNome}`] = {
            status: s.status,
            dataPagamento: s.dataPagamento
          };
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/clientes', async (req, res) => {
  try {
    const { at } = req.query;
    let filtroData = undefined;
    if (at) {
      const parsed = new Date(at);
      if (!Number.isNaN(parsed.getTime())) {
        filtroData = parsed;
      }
    }
    const registro = await prisma.starkMemory.findFirst({
      where: {
        tipo: 'clientes_manual',
        mes: 'global',
        ...(filtroData ? { updatedAt: { lte: filtroData } } : {})
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!registro) {
      return res.json({ success: true, data: { clients: [], deleted: [], updatedAt: null } });
    }

    let parsed = {};
    try {
      parsed = JSON.parse(registro.conteudo || '{}');
    } catch (e) {
      parsed = {};
    }

    const clients = Array.isArray(parsed.clients) ? parsed.clients : [];
    const deleted = Array.isArray(parsed.deleted) ? parsed.deleted : [];
    const updatedAt = parsed.updatedAt || registro.updatedAt.toISOString();

    res.json({ success: true, data: { clients, deleted, updatedAt } });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const { clients, deleted, updatedAt } = req.body || {};
    const payload = {
      clients: Array.isArray(clients) ? clients : [],
      deleted: Array.isArray(deleted) ? deleted : [],
      updatedAt: updatedAt || new Date().toISOString()
    };
    const conteudo = JSON.stringify(payload);

    const saved = await prisma.starkMemory.create({
      data: { conteudo, relevancia: 10, mes: 'global', tipo: 'clientes_manual' }
    });

    res.json({ success: true, data: { id: saved.id, updatedAt: saved.updatedAt } });
  } catch (error) {
    console.error('Erro ao salvar clientes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/historico', async (req, res) => {
  try {
    const payload = req.body || {};
    const parseMaybeJson = (value, fallback) => {
      if (!value) return fallback;
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch (e) {
          return fallback;
        }
      }
      return value;
    };
    const customItems = parseMaybeJson(payload.customItems, {});
    const statusData = parseMaybeJson(payload.statusData, {});
    const deletedItems = parseMaybeJson(payload.deletedItems, {});
    const editedItems = parseMaybeJson(payload.editedItems, {});
    const clients = Array.isArray(payload.clients) ? payload.clients : [];
    const deletedClients = Array.isArray(payload.deletedClients) ? payload.deletedClients : [];
    const updatedAt = payload.updatedAt || new Date().toISOString();

    const mesesCustom = Object.keys(customItems || {});
    const mesesDeleted = Object.keys(deletedItems || {});
    const mesesEdited = Object.keys(editedItems || {});
    const mesesStatus = Object.keys(statusData || {}).map(key => key.split('_')[0]).filter(Boolean);
    const mesesStatusUnicos = Array.from(new Set(mesesStatus));

    await prisma.$transaction(async (tx) => {
      if (mesesCustom.length > 0) {
        await tx.customItem.deleteMany({ where: { mes: { in: mesesCustom } } });
        for (const [mes, dados] of Object.entries(customItems)) {
          if (dados.despesas && Array.isArray(dados.despesas)) {
            for (const item of dados.despesas) {
              await tx.customItem.create({
                data: {
                  mes,
                  tipo: 'despesa',
                  nome: item.nome,
                  valor: parseFloat(item.valor),
                  categoria: item.categoria || 'Outros',
                  status: item.status || 'A Pagar',
                  vencimento: item.vencimento || null,
                  dataPagamento: item.dataPagamento || null,
                  funcao: item.funcao || null,
                  tipoDetalhe: item.tipo || null,
                  empresa: item.empresa || null
                }
              });
            }
          }
          if (dados.receitas && Array.isArray(dados.receitas)) {
            for (const item of dados.receitas) {
              await tx.customItem.create({
                data: {
                  mes,
                  tipo: 'receita',
                  nome: item.nome,
                  valor: parseFloat(item.valor),
                  categoria: item.categoria || item.empresa || 'Outros',
                  status: item.status || 'A Receber',
                  vencimento: item.vencimento || null,
                  dataPagamento: item.dataPagamento || null,
                  empresa: item.empresa || null,
                  funcao: item.funcao || null,
                  tipoDetalhe: item.tipo || null
                }
              });
            }
          }
        }
      }

      if (mesesStatusUnicos.length > 0) {
        await tx.paymentStatus.deleteMany({ where: { mes: { in: mesesStatusUnicos } } });
        for (const [id, dados] of Object.entries(statusData || {})) {
          const parts = id.split('_');
          if (parts.length >= 3) {
            const mes = parts[0];
            const tipo = parts[1];
            const itemNome = parts.slice(2).join('_').replace(/_/g, ' ');
            await tx.paymentStatus.create({
              data: {
                mes,
                tipo,
                itemNome,
                status: dados.status,
                dataPagamento: dados.dataPagamento
              }
            });
          }
        }
      }

      if (mesesDeleted.length > 0) {
        await tx.deletedItem.deleteMany({ where: { mes: { in: mesesDeleted } } });
        for (const [mes, dados] of Object.entries(deletedItems || {})) {
          if (dados.despesas) {
            for (const nome of dados.despesas) {
              await tx.deletedItem.create({ data: { mes, tipo: 'despesa', itemNome: nome } });
            }
          }
          if (dados.receitas) {
            for (const nome of dados.receitas) {
              await tx.deletedItem.create({ data: { mes, tipo: 'receita', itemNome: nome } });
            }
          }
        }
      }

      if (mesesEdited.length > 0) {
        await tx.editedItem.deleteMany({ where: { mes: { in: mesesEdited } } });
        for (const [mes, dados] of Object.entries(editedItems || {})) {
          if (dados.despesas) {
            for (const [nomeOriginal, edit] of Object.entries(dados.despesas)) {
              await tx.editedItem.create({
                data: {
                  mes,
                  tipo: 'despesa',
                  itemNome: nomeOriginal,
                  novoNome: edit.nome,
                  novoValor: parseFloat(edit.valor),
                  novaCategoria: edit.categoria
                }
              });
            }
          }
          if (dados.receitas) {
            for (const [nomeOriginal, edit] of Object.entries(dados.receitas)) {
              await tx.editedItem.create({
                data: {
                  mes,
                  tipo: 'receita',
                  itemNome: nomeOriginal,
                  novoNome: edit.nome,
                  novoValor: parseFloat(edit.valor),
                  novaCategoria: edit.categoria || edit.empresa
                }
              });
            }
          }
        }
      }

      if (clients.length > 0 || deletedClients.length > 0) {
        const conteudo = JSON.stringify({ clients, deleted: deletedClients, updatedAt });
        await tx.starkMemory.create({
          data: { conteudo, relevancia: 10, mes: 'global', tipo: 'clientes_manual' }
        });
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar histórico:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/acao', async (req, res) => {
  try {
    const { acao, dados } = req.body || {};

    if (acao !== 'adicionar-receita' || !dados) {
      return res.status(400).json({ success: false, error: 'Ação inválida' });
    }

    const { mes, nome, valor, categoria, status, vencimento, empresa, funcao, tipo } = dados;

    if (!nome || valor == null) {
      return res.status(400).json({ success: false, error: 'Dados inválidos' });
    }

    const item = await prisma.customItem.create({
      data: {
        mes: mes || new Date().toISOString().slice(0, 7),
        tipo: 'receita',
        nome,
        valor: Number(valor),
        categoria: categoria || empresa || 'Outros',
        status: status || 'A Receber',
        vencimento: vencimento || null,
        empresa: empresa || null,
        funcao: funcao || null,
        tipoDetalhe: tipo || null
      }
    });

    res.json({ success: true, item });
  } catch (error) {
    console.error('Erro ao adicionar receita:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 STARK API v3.1 running on port ${PORT}`);
});
