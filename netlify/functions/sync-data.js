const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
};

// Dados financeiros base (mesmo do agent.js)
const dadosBase = {
  "2025-12": {
    receitas: [
      { nome: "Bengers - App Festival", valor: 10000, categoria: "starken", tipo: "Projeto", status: "A Receber" },
      { nome: "Mortadella Blumenau", valor: 2000, categoria: "starken", status: "A Receber" },
      { nome: "Hamburgueria Feio", valor: 2000, categoria: "starken", status: "A Receber" },
      { nome: "Academia São Pedro", valor: 1080, categoria: "starken", status: "A Receber" },
      { nome: "Estilo Tulipa", valor: 659, categoria: "starken", status: "A Receber" },
      { nome: "JPR Móveis Rústicos", valor: 2000, categoria: "starken", status: "A Receber" },
      { nome: "Realizzati Móveis", valor: 2500, categoria: "starken", status: "A Receber" },
      { nome: "Suprema Pizza", valor: 2000, categoria: "starken", status: "A Receber" },
      { nome: "Shield Car Blumenau", valor: 297, categoria: "starken", status: "A Receber" },
      { nome: "Rosa Mexicano Blumenau", valor: 2000, categoria: "starken", status: "A Receber" },
      { nome: "Rosa Mexicano Brusque", valor: 2000, categoria: "starken", status: "A Receber" },
      { nome: "Divino Tempero", valor: 1000, categoria: "starken", status: "A Receber" },
      { nome: "Alexandria Burger", valor: 2000, categoria: "starken", status: "A Receber" },
      { nome: "Dommus Smart Home", valor: 297, categoria: "starken", status: "A Receber" },
      { nome: "Oca Restaurante", valor: 2000, categoria: "alpha", tipo: "MRR", status: "A Receber" },
      { nome: "Madrugão Lanches", valor: 2000, categoria: "alpha", tipo: "MRR", status: "A Receber" },
      { nome: "Saporitto Pizzaria", valor: 1500, categoria: "alpha", tipo: "MRR", status: "A Receber" },
      { nome: "Fratellis Pizzaria", valor: 2500, categoria: "alpha", tipo: "MRR", status: "A Receber" },
      { nome: "Brazza Hamburgueria", valor: 3000, categoria: "alpha", tipo: "MRR", status: "A Receber" },
      { nome: "Fabinhus Restaurante", valor: 1000, categoria: "alpha", tipo: "MRR", status: "A Receber" },
      { nome: "Tempero Manero Grill", valor: 1000, categoria: "alpha", tipo: "MRR", status: "A Receber" },
      { nome: "Super Dupe Hamburgueria BC", valor: 2000, categoria: "alpha", tipo: "MRR", status: "A Receber" },
      { nome: "Churrascaria Paiaguas", valor: 3149.75, categoria: "alpha", tipo: "TCV", status: "Recebido" }
    ],
    despesas: [
      { nome: "Ederson", valor: 3200, categoria: "pessoal", funcao: "Desenvolvedor", status: "A Pagar" },
      { nome: "Victor", valor: 3000, categoria: "pessoal", funcao: "Desenvolvedor", status: "A Pagar" },
      { nome: "Igor", valor: 2300, categoria: "pessoal", funcao: "Desenvolvedor", status: "A Pagar" },
      { nome: "Kim", valor: 1300, categoria: "pessoal", funcao: "Design", status: "A Pagar" },
      { nome: "Erick", valor: 1300, categoria: "pessoal", funcao: "Desenvolvedor", status: "A Pagar" },
      { nome: "Dante - Closer", valor: 3500, categoria: "comercial", status: "A Pagar" },
      { nome: "Nathan - SDR", valor: 2000, categoria: "comercial", status: "A Pagar" },
      { nome: "João - SDR", valor: 2000, categoria: "comercial", status: "A Pagar" },
      { nome: "Aluguel - Sala", valor: 2800, categoria: "estrutura", status: "A Pagar" },
      { nome: "Celesc - Energia", valor: 100, categoria: "estrutura", status: "A Pagar" },
      { nome: "Internet - Claro", valor: 109, categoria: "estrutura", status: "A Pagar" },
      { nome: "Alpha - Franquia", valor: 7500, categoria: "alpha", status: "A Pagar" },
      { nome: "Render.com", valor: 120, categoria: "ferramentas", status: "A Pagar" },
      { nome: "OpenAI", valor: 120, categoria: "ferramentas", status: "A Pagar" },
      { nome: "Anthropic", valor: 120, categoria: "ferramentas", status: "A Pagar" },
      { nome: "Pipedrive", valor: 750, categoria: "ferramentas", status: "A Pagar" },
      { nome: "Telefonia IP", valor: 250, categoria: "ferramentas", status: "A Pagar" },
      { nome: "Kommo", valor: 640, categoria: "ferramentas", status: "A Pagar" },
      { nome: "Contabilidade", valor: 550.90, categoria: "ferramentas", status: "A Pagar" },
      { nome: "Make.com", valor: 210, categoria: "ferramentas", status: "A Pagar" }
    ]
  }
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const path = event.path.replace('/.netlify/functions/sync-data', '');
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};

    // ============================================
    // NOVA ROTA: POST com ação para StarkCore
    // ============================================
    if (method === 'POST' && body.acao) {
      return await handleAcao(body.acao, body.dados || body);
    }

    // GET /status - Buscar todos os status de pagamento
    if (method === 'GET' && (path === '' || path === '/')) {
      const statusData = await prisma.paymentStatus.findMany();
      const customItems = await prisma.customItem.findMany();
      const deletedItems = await prisma.deletedItem.findMany();
      const editedItems = await prisma.editedItem.findMany();

      // Organizar dados por mês
      const organizedStatus = {};
      statusData.forEach(item => {
        const key = `${item.mes}_${item.tipo}_${item.itemNome}`;
        organizedStatus[key] = {
          status: item.status,
          dataPagamento: item.dataPagamento
        };
      });

      const organizedCustom = {};
      customItems.forEach(item => {
        if (!organizedCustom[item.mes]) {
          organizedCustom[item.mes] = { despesas: [], receitas: [] };
        }
        const tipo = item.tipo === 'despesa' ? 'despesas' : 'receitas';
        organizedCustom[item.mes][tipo].push({
          id: item.id,
          nome: item.nome,
          valor: item.valor,
          categoria: item.categoria,
          status: item.status,
          vencimento: item.vencimento,
          dataPagamento: item.dataPagamento,
          funcao: item.funcao,
          tipo: item.tipoDetalhe,
          empresa: item.empresa,
          isCustom: true
        });
      });

      const organizedDeleted = {};
      deletedItems.forEach(item => {
        const key = `${item.mes}_${item.tipo}_${item.itemNome}`;
        organizedDeleted[key] = true;
      });

      const organizedEdited = {};
      editedItems.forEach(item => {
        if (!organizedEdited[item.mes]) {
          organizedEdited[item.mes] = { despesas: {}, receitas: {} };
        }
        const tipo = item.tipo === 'despesa' ? 'despesas' : 'receitas';
        organizedEdited[item.mes][tipo][item.itemNome] = {
          novoNome: item.novoNome,
          novoValor: item.novoValor,
          novaCategoria: item.novaCategoria
        };
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          data: {
            statusData: organizedStatus,
            customItems: organizedCustom,
            deletedItems: organizedDeleted,
            editedItems: organizedEdited
          }
        })
      };
    }

    // POST /status - Salvar/atualizar status de pagamento
    if (method === 'POST' && path === '/status') {
      const { mes, tipo, itemNome, status, dataPagamento } = body;

      const result = await prisma.paymentStatus.upsert({
        where: {
          mes_tipo_itemNome: { mes, tipo, itemNome }
        },
        update: { status, dataPagamento, updatedAt: new Date() },
        create: { mes, tipo, itemNome, status, dataPagamento }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: result })
      };
    }

    // POST /custom - Adicionar item customizado
    if (method === 'POST' && path === '/custom') {
      const result = await prisma.customItem.create({
        data: {
          mes: body.mes,
          tipo: body.tipo,
          nome: body.nome,
          valor: body.valor,
          categoria: body.categoria,
          status: body.status || 'A Pagar',
          vencimento: body.vencimento,
          dataPagamento: body.dataPagamento,
          funcao: body.funcao,
          tipoDetalhe: body.tipoDetalhe,
          empresa: body.empresa
        }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: result })
      };
    }

    // DELETE /custom/:id - Remover item customizado
    if (method === 'DELETE' && path.startsWith('/custom/')) {
      const id = path.replace('/custom/', '');
      await prisma.customItem.delete({ where: { id } });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    }

    // POST /sync - Sincronizar todos os dados de uma vez
    if (method === 'POST' && path === '/sync') {
      const { statusData, customItems, deletedItems, editedItems } = body;

      // Limpar dados existentes e inserir novos
      await prisma.$transaction(async (tx) => {
        // Sincronizar status
        if (statusData && Object.keys(statusData).length > 0) {
          for (const [key, value] of Object.entries(statusData)) {
            const [mes, tipo, ...nomeParts] = key.split('_');
            const itemNome = nomeParts.join('_');

            await tx.paymentStatus.upsert({
              where: { mes_tipo_itemNome: { mes, tipo, itemNome } },
              update: { status: value.status, dataPagamento: value.dataPagamento },
              create: { mes, tipo, itemNome, status: value.status, dataPagamento: value.dataPagamento }
            });
          }
        }

        // Sincronizar custom items
        if (customItems && Object.keys(customItems).length > 0) {
          for (const [mes, data] of Object.entries(customItems)) {
            if (data.despesas) {
              for (const item of data.despesas) {
                if (!item.id || !item.id.startsWith('c')) {
                  await tx.customItem.create({
                    data: {
                      mes,
                      tipo: 'despesa',
                      nome: item.nome,
                      valor: item.valor,
                      categoria: item.categoria,
                      status: item.status,
                      vencimento: item.vencimento,
                      dataPagamento: item.dataPagamento,
                      funcao: item.funcao,
                      tipoDetalhe: item.tipo,
                      empresa: item.empresa
                    }
                  });
                }
              }
            }
            if (data.receitas) {
              for (const item of data.receitas) {
                if (!item.id || !item.id.startsWith('c')) {
                  await tx.customItem.create({
                    data: {
                      mes,
                      tipo: 'receita',
                      nome: item.nome,
                      valor: item.valor,
                      categoria: item.categoria,
                      status: item.status,
                      vencimento: item.vencimento,
                      dataPagamento: item.dataPagamento,
                      funcao: item.funcao,
                      tipoDetalhe: item.tipo,
                      empresa: item.empresa
                    }
                  });
                }
              }
            }
          }
        }
      });

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Dados sincronizados com sucesso' })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Rota não encontrada' })
    };

  } catch (error) {
    console.error('Erro na API:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await prisma.$disconnect();
  }
};

// ============================================
// HANDLER DE AÇÕES PARA STARK CORE
// ============================================
async function handleAcao(acao, dados) {
  const mes = dados.mes || getMesAtual();

  try {
    switch (acao) {
      case 'buscar-tudo':
        return await buscarTudo(mes);

      case 'adicionar-receita':
        return await adicionarReceita(dados);

      case 'adicionar-despesa':
        return await adicionarDespesa(dados);

      case 'marcar-pago':
        return await marcarPago(dados);

      case 'marcar-recebido':
        return await marcarRecebido(dados);

      case 'editar-item':
        return await editarItem(dados);

      case 'remover-item':
        return await removerItem(dados);

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: `Ação desconhecida: ${acao}` })
        };
    }
  } catch (error) {
    console.error(`Erro na ação ${acao}:`, error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
}

function getMesAtual() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Busca todos os dados para o StarkCore
async function buscarTudo(mes) {
  try {
    // Buscar dados do banco
    const customItems = await prisma.customItem.findMany({ where: { mes } });
    const paymentStatus = await prisma.paymentStatus.findMany({ where: { mes } });
    const deletedItems = await prisma.deletedItem.findMany({ where: { mes } });
    const editedItems = await prisma.editedItem.findMany({ where: { mes } });

    // Pegar dados base do mês
    const base = dadosBase[mes] || { receitas: [], despesas: [] };

    // Processar receitas
    let receitas = [...base.receitas];

    // Aplicar status do banco
    receitas = receitas.map(r => {
      const status = paymentStatus.find(s => s.itemNome === r.nome && s.tipo === 'receita');
      if (status) {
        r.status = status.status;
        r.dataPagamento = status.dataPagamento;
      }
      return r;
    });

    // Aplicar edições
    receitas = receitas.map(r => {
      const edit = editedItems.find(e => e.itemNome === r.nome && e.tipo === 'receita');
      if (edit) {
        if (edit.novoNome) r.nome = edit.novoNome;
        if (edit.novoValor) r.valor = edit.novoValor;
        if (edit.novaCategoria) r.categoria = edit.novaCategoria;
      }
      return r;
    });

    // Remover deletados
    const deletedReceitas = deletedItems.filter(d => d.tipo === 'receita').map(d => d.itemNome);
    receitas = receitas.filter(r => !deletedReceitas.includes(r.nome));

    // Adicionar custom items
    const customReceitas = customItems.filter(c => c.tipo === 'receita').map(c => ({
      id: c.id,
      nome: c.nome,
      valor: c.valor,
      categoria: c.categoria,
      tipo: c.tipoDetalhe,
      empresa: c.empresa,
      status: c.status,
      vencimento: c.vencimento,
      dataPagamento: c.dataPagamento,
      isCustom: true
    }));
    receitas = [...receitas, ...customReceitas];

    // Processar despesas (mesmo processo)
    let despesas = [...base.despesas];

    despesas = despesas.map(d => {
      const status = paymentStatus.find(s => s.itemNome === d.nome && s.tipo === 'despesa');
      if (status) {
        d.status = status.status;
        d.dataPagamento = status.dataPagamento;
      }
      return d;
    });

    despesas = despesas.map(d => {
      const edit = editedItems.find(e => e.itemNome === d.nome && e.tipo === 'despesa');
      if (edit) {
        if (edit.novoNome) d.nome = edit.novoNome;
        if (edit.novoValor) d.valor = edit.novoValor;
        if (edit.novaCategoria) d.categoria = edit.novaCategoria;
      }
      return d;
    });

    const deletedDespesas = deletedItems.filter(d => d.tipo === 'despesa').map(d => d.itemNome);
    despesas = despesas.filter(d => !deletedDespesas.includes(d.nome));

    const customDespesas = customItems.filter(c => c.tipo === 'despesa').map(c => ({
      id: c.id,
      nome: c.nome,
      valor: c.valor,
      categoria: c.categoria,
      funcao: c.funcao,
      status: c.status,
      vencimento: c.vencimento,
      dataPagamento: c.dataPagamento,
      isCustom: true
    }));
    despesas = [...despesas, ...customDespesas];

    // Calcular resumo
    const receitaTotal = receitas.reduce((sum, r) => sum + (r.valor || 0), 0);
    const despesaTotal = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
    const lucro = receitaTotal - despesaTotal;
    const margem = receitaTotal > 0 ? (lucro / receitaTotal) * 100 : 0;

    // Gerar alertas
    const alertas = gerarAlertas(receitas, despesas);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        dados: {
          receitas,
          despesas,
          resumo: {
            receitaTotal,
            despesaTotal,
            lucro,
            margem,
            receitasCount: receitas.length,
            despesasCount: despesas.length
          },
          alertas,
          mes
        }
      })
    };

  } catch (error) {
    console.error('Erro ao buscar tudo:', error);
    throw error;
  }
}

function gerarAlertas(receitas, despesas) {
  const alertas = [];
  const hoje = new Date();

  // Alertas de vencimento próximo
  const itensProximos = [...receitas, ...despesas].filter(item => {
    if (!item.vencimento) return false;
    if (item.status === 'Pago' || item.status === 'Recebido') return false;
    const venc = new Date(item.vencimento);
    const diff = Math.ceil((venc - hoje) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 7;
  });

  if (itensProximos.length > 0) {
    alertas.push({
      tipo: 'vencimentos',
      nivel: 'warning',
      mensagem: `${itensProximos.length} itens vencem nos próximos 7 dias`
    });
  }

  // Alerta de margem
  const receitaTotal = receitas.reduce((sum, r) => sum + (r.valor || 0), 0);
  const despesaTotal = despesas.reduce((sum, d) => sum + (d.valor || 0), 0);
  const margem = receitaTotal > 0 ? ((receitaTotal - despesaTotal) / receitaTotal) * 100 : 0;

  if (margem < 30) {
    alertas.push({
      tipo: 'margem',
      nivel: 'warning',
      mensagem: `Margem em ${margem.toFixed(1)}% - abaixo da meta de 30%`
    });
  } else if (margem >= 40) {
    alertas.push({
      tipo: 'margem',
      nivel: 'success',
      mensagem: `Margem excelente: ${margem.toFixed(1)}%`
    });
  }

  return alertas;
}

// Adicionar receita
async function adicionarReceita(dados) {
  const mes = dados.mes || getMesAtual();

  const item = await prisma.customItem.create({
    data: {
      mes,
      tipo: 'receita',
      nome: dados.nome,
      valor: dados.valor,
      categoria: dados.categoria || dados.empresa || 'starken',
      status: dados.status || 'A Receber',
      vencimento: dados.vencimento,
      tipoDetalhe: dados.tipo,
      empresa: dados.empresa
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, item })
  };
}

// Adicionar despesa
async function adicionarDespesa(dados) {
  const mes = dados.mes || getMesAtual();

  const item = await prisma.customItem.create({
    data: {
      mes,
      tipo: 'despesa',
      nome: dados.nome,
      valor: dados.valor,
      categoria: dados.categoria,
      status: dados.status || 'A Pagar',
      vencimento: dados.vencimento,
      funcao: dados.funcao
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, item })
  };
}

// Marcar como pago
async function marcarPago(dados) {
  const mes = dados.mes || getMesAtual();
  const dataPagamento = dados.data_pagamento || new Date().toISOString().split('T')[0];

  // Primeiro tenta encontrar no CustomItem
  const customItem = await prisma.customItem.findFirst({
    where: {
      mes,
      tipo: 'despesa',
      nome: { contains: dados.nome, mode: 'insensitive' }
    }
  });

  if (customItem) {
    await prisma.customItem.update({
      where: { id: customItem.id },
      data: { status: 'Pago', dataPagamento }
    });
  } else {
    // Upsert no PaymentStatus para itens base
    await prisma.paymentStatus.upsert({
      where: {
        mes_tipo_itemNome: { mes, tipo: 'despesa', itemNome: dados.nome }
      },
      update: { status: 'Pago', dataPagamento },
      create: { mes, tipo: 'despesa', itemNome: dados.nome, status: 'Pago', dataPagamento }
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, mensagem: `${dados.nome} marcado como PAGO` })
  };
}

// Marcar como recebido
async function marcarRecebido(dados) {
  const mes = dados.mes || getMesAtual();
  const dataRecebimento = dados.data_recebimento || new Date().toISOString().split('T')[0];

  const customItem = await prisma.customItem.findFirst({
    where: {
      mes,
      tipo: 'receita',
      nome: { contains: dados.nome, mode: 'insensitive' }
    }
  });

  if (customItem) {
    await prisma.customItem.update({
      where: { id: customItem.id },
      data: { status: 'Recebido', dataPagamento: dataRecebimento }
    });
  } else {
    await prisma.paymentStatus.upsert({
      where: {
        mes_tipo_itemNome: { mes, tipo: 'receita', itemNome: dados.nome }
      },
      update: { status: 'Recebido', dataPagamento: dataRecebimento },
      create: { mes, tipo: 'receita', itemNome: dados.nome, status: 'Recebido', dataPagamento: dataRecebimento }
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, mensagem: `${dados.nome} marcado como RECEBIDO` })
  };
}

// Editar item
async function editarItem(dados) {
  const mes = dados.mes || getMesAtual();

  const customItem = await prisma.customItem.findFirst({
    where: {
      mes,
      tipo: dados.tipo,
      nome: { contains: dados.nomeAtual || dados.nome_atual, mode: 'insensitive' }
    }
  });

  if (customItem) {
    await prisma.customItem.update({
      where: { id: customItem.id },
      data: {
        nome: dados.novoNome || dados.novo_nome || customItem.nome,
        valor: dados.novoValor || dados.novo_valor || customItem.valor,
        categoria: dados.novaCategoria || customItem.categoria
      }
    });
  } else {
    await prisma.editedItem.upsert({
      where: {
        mes_tipo_itemNome: { mes, tipo: dados.tipo, itemNome: dados.nomeAtual || dados.nome_atual }
      },
      update: {
        novoNome: dados.novoNome || dados.novo_nome,
        novoValor: dados.novoValor || dados.novo_valor,
        novaCategoria: dados.novaCategoria
      },
      create: {
        mes,
        tipo: dados.tipo,
        itemNome: dados.nomeAtual || dados.nome_atual,
        novoNome: dados.novoNome || dados.novo_nome,
        novoValor: dados.novoValor || dados.novo_valor,
        novaCategoria: dados.novaCategoria
      }
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, mensagem: 'Item editado com sucesso' })
  };
}

// Remover item
async function removerItem(dados) {
  const mes = dados.mes || getMesAtual();

  const customItem = await prisma.customItem.findFirst({
    where: {
      mes,
      tipo: dados.tipo,
      nome: { contains: dados.nome, mode: 'insensitive' }
    }
  });

  if (customItem) {
    await prisma.customItem.delete({ where: { id: customItem.id } });
  } else {
    await prisma.deletedItem.upsert({
      where: {
        mes_tipo_itemNome: { mes, tipo: dados.tipo, itemNome: dados.nome }
      },
      update: {},
      create: { mes, tipo: dados.tipo, itemNome: dados.nome }
    });
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, mensagem: `${dados.nome} removido` })
  };
}
