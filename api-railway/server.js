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
                                tipoDetalhe: item.tipo || null
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
