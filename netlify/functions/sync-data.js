const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Content-Type': 'application/json'
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
