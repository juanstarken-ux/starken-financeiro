const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// System prompt do agente financeiro
const SYSTEM_PROMPT = `Você é o STARK, o CFO Virtual da Starken Tecnologia, uma empresa de tecnologia e marketing digital.
Seu nome STARK representa força, inteligência e conexão com a marca Starken.
Você ajuda o CEO (Juan) a gerenciar as finanças da empresa de forma inteligente e proativa.

CONTEXTO DA EMPRESA:
- Starken Tecnologia: Empresa principal de desenvolvimento e marketing digital
- Alpha Project: Franquia de marketing para restaurantes (15% de royalties sobre receitas)
- A empresa tem dois tipos de receita: MRR (recorrente mensal) e TCV (contratos únicos)

SUAS CAPACIDADES:
1. Consultar despesas e receitas do banco de dados
2. Calcular métricas financeiras (totais, médias, projeções)
3. Listar contas próximas do vencimento
4. Comparar períodos e identificar tendências
5. Gerar resumos e relatórios

REGRAS:
- Sempre responda em português brasileiro
- Use formatação clara com valores em R$ (Real)
- Seja direto e objetivo nas respostas
- Quando mostrar listas, organize de forma clara
- Arredonde valores para 2 casas decimais
- Identifique padrões e faça observações úteis

FORMATO DE MOEDA:
- Use o formato brasileiro: R$ 1.234,56
- Para valores negativos: -R$ 123,45`;

// Definição das tools disponíveis
const tools = [
  {
    name: 'query_despesas',
    description: 'Consulta despesas no banco de dados. Pode filtrar por mês, categoria, status ou empresa.',
    input_schema: {
      type: 'object',
      properties: {
        mes: {
          type: 'string',
          description: 'Mês no formato YYYY-MM (ex: 2025-01). Se não informado, usa o mês atual.'
        },
        categoria: {
          type: 'string',
          description: 'Categoria da despesa (pessoal, comercial, estrutura, ferramentas, alpha_franquia, outros)'
        },
        status: {
          type: 'string',
          enum: ['Pago', 'A Pagar', 'Vencido'],
          description: 'Status do pagamento'
        }
      }
    }
  },
  {
    name: 'query_receitas',
    description: 'Consulta receitas no banco de dados. Pode filtrar por mês, empresa, status ou origem.',
    input_schema: {
      type: 'object',
      properties: {
        mes: {
          type: 'string',
          description: 'Mês no formato YYYY-MM (ex: 2025-01)'
        },
        empresa: {
          type: 'string',
          enum: ['Starken', 'Alpha'],
          description: 'Empresa (Starken ou Alpha)'
        },
        status: {
          type: 'string',
          enum: ['Recebido', 'A Receber', 'Vencido'],
          description: 'Status do recebimento'
        }
      }
    }
  },
  {
    name: 'get_metricas_mes',
    description: 'Obtém métricas consolidadas de um mês: total de receitas, despesas, lucro, margem.',
    input_schema: {
      type: 'object',
      properties: {
        mes: {
          type: 'string',
          description: 'Mês no formato YYYY-MM'
        }
      },
      required: ['mes']
    }
  },
  {
    name: 'get_vencimentos',
    description: 'Lista contas (despesas ou receitas) próximas do vencimento ou já vencidas.',
    input_schema: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          enum: ['despesas', 'receitas', 'todos'],
          description: 'Tipo de conta para verificar'
        },
        dias: {
          type: 'number',
          description: 'Quantidade de dias para considerar (padrão: 7)'
        }
      }
    }
  },
  {
    name: 'get_comparativo',
    description: 'Compara métricas entre dois meses ou entre empresas (Starken vs Alpha).',
    input_schema: {
      type: 'object',
      properties: {
        mes1: {
          type: 'string',
          description: 'Primeiro mês para comparar (YYYY-MM)'
        },
        mes2: {
          type: 'string',
          description: 'Segundo mês para comparar (YYYY-MM)'
        },
        tipo_comparacao: {
          type: 'string',
          enum: ['meses', 'empresas'],
          description: 'Tipo de comparação: entre meses ou entre empresas no mesmo mês'
        }
      }
    }
  }
];

// Funções que implementam as tools
async function queryDespesas({ mes, categoria, status }) {
  const mesAtual = mes || new Date().toISOString().slice(0, 7);

  const where = {
    mes: mesAtual,
    tipo: 'despesa'
  };

  if (categoria) where.categoria = categoria;
  if (status) where.status = status;

  const despesas = await prisma.customItem.findMany({ where });

  // Buscar também os status de pagamento
  const statusData = await prisma.paymentStatus.findMany({
    where: {
      mes: mesAtual,
      tipo: 'despesa'
    }
  });

  const statusMap = {};
  statusData.forEach(s => {
    statusMap[s.itemNome] = { status: s.status, dataPagamento: s.dataPagamento };
  });

  // Calcular totais
  const total = despesas.reduce((sum, d) => sum + d.valor, 0);
  const porCategoria = {};
  despesas.forEach(d => {
    const cat = d.categoria || 'outros';
    if (!porCategoria[cat]) porCategoria[cat] = 0;
    porCategoria[cat] += d.valor;
  });

  return {
    mes: mesAtual,
    quantidade: despesas.length,
    total,
    porCategoria,
    itens: despesas.map(d => ({
      nome: d.nome,
      valor: d.valor,
      categoria: d.categoria,
      status: statusMap[d.nome]?.status || d.status,
      vencimento: d.vencimento
    }))
  };
}

async function queryReceitas({ mes, empresa, status }) {
  const mesAtual = mes || new Date().toISOString().slice(0, 7);

  const where = {
    mes: mesAtual,
    tipo: 'receita'
  };

  if (empresa) where.empresa = empresa;
  if (status) where.status = status;

  const receitas = await prisma.customItem.findMany({ where });

  // Buscar status
  const statusData = await prisma.paymentStatus.findMany({
    where: {
      mes: mesAtual,
      tipo: 'receita'
    }
  });

  const statusMap = {};
  statusData.forEach(s => {
    statusMap[s.itemNome] = { status: s.status, dataPagamento: s.dataPagamento };
  });

  // Calcular totais
  const total = receitas.reduce((sum, r) => sum + r.valor, 0);
  const porEmpresa = { Starken: 0, Alpha: 0 };
  receitas.forEach(r => {
    const emp = r.empresa || 'Starken';
    if (!porEmpresa[emp]) porEmpresa[emp] = 0;
    porEmpresa[emp] += r.valor;
  });

  return {
    mes: mesAtual,
    quantidade: receitas.length,
    total,
    porEmpresa,
    itens: receitas.map(r => ({
      nome: r.nome,
      valor: r.valor,
      empresa: r.empresa,
      status: statusMap[r.nome]?.status || r.status,
      categoria: r.categoria
    }))
  };
}

async function getMetricasMes({ mes }) {
  const despesas = await queryDespesas({ mes });
  const receitas = await queryReceitas({ mes });

  const totalReceitas = receitas.total;
  const totalDespesas = despesas.total;
  const lucro = totalReceitas - totalDespesas;
  const margem = totalReceitas > 0 ? (lucro / totalReceitas) * 100 : 0;

  // Calcular recebido vs pendente
  const recebido = receitas.itens
    .filter(r => r.status === 'Recebido')
    .reduce((sum, r) => sum + r.valor, 0);

  const aReceber = receitas.itens
    .filter(r => r.status === 'A Receber')
    .reduce((sum, r) => sum + r.valor, 0);

  const pago = despesas.itens
    .filter(d => d.status === 'Pago')
    .reduce((sum, d) => sum + d.valor, 0);

  const aPagar = despesas.itens
    .filter(d => d.status === 'A Pagar')
    .reduce((sum, d) => sum + d.valor, 0);

  return {
    mes,
    receitas: {
      total: totalReceitas,
      recebido,
      aReceber,
      porEmpresa: receitas.porEmpresa
    },
    despesas: {
      total: totalDespesas,
      pago,
      aPagar,
      porCategoria: despesas.porCategoria
    },
    resultado: {
      lucro,
      margem: margem.toFixed(1) + '%'
    }
  };
}

async function getVencimentos({ tipo = 'todos', dias = 7 }) {
  const hoje = new Date();
  const limite = new Date();
  limite.setDate(hoje.getDate() + dias);

  const mesAtual = hoje.toISOString().slice(0, 7);

  const resultado = {
    despesasVencendo: [],
    receitasVencendo: [],
    despesasVencidas: [],
    receitasVencidas: []
  };

  if (tipo === 'todos' || tipo === 'despesas') {
    const despesas = await prisma.customItem.findMany({
      where: {
        mes: mesAtual,
        tipo: 'despesa',
        status: { not: 'Pago' }
      }
    });

    despesas.forEach(d => {
      if (d.vencimento) {
        const venc = new Date(d.vencimento);
        if (venc < hoje) {
          resultado.despesasVencidas.push({
            nome: d.nome,
            valor: d.valor,
            vencimento: d.vencimento,
            diasAtraso: Math.floor((hoje - venc) / (1000 * 60 * 60 * 24))
          });
        } else if (venc <= limite) {
          resultado.despesasVencendo.push({
            nome: d.nome,
            valor: d.valor,
            vencimento: d.vencimento,
            diasRestantes: Math.floor((venc - hoje) / (1000 * 60 * 60 * 24))
          });
        }
      }
    });
  }

  if (tipo === 'todos' || tipo === 'receitas') {
    const receitas = await prisma.customItem.findMany({
      where: {
        mes: mesAtual,
        tipo: 'receita',
        status: { not: 'Recebido' }
      }
    });

    receitas.forEach(r => {
      if (r.vencimento) {
        const venc = new Date(r.vencimento);
        if (venc < hoje) {
          resultado.receitasVencidas.push({
            nome: r.nome,
            valor: r.valor,
            vencimento: r.vencimento,
            diasAtraso: Math.floor((hoje - venc) / (1000 * 60 * 60 * 24))
          });
        } else if (venc <= limite) {
          resultado.receitasVencendo.push({
            nome: r.nome,
            valor: r.valor,
            vencimento: r.vencimento,
            diasRestantes: Math.floor((venc - hoje) / (1000 * 60 * 60 * 24))
          });
        }
      }
    });
  }

  return resultado;
}

async function getComparativo({ mes1, mes2, tipo_comparacao = 'meses' }) {
  if (tipo_comparacao === 'meses') {
    const metricas1 = await getMetricasMes({ mes: mes1 });
    const metricas2 = await getMetricasMes({ mes: mes2 });

    const variacaoReceita = metricas1.receitas.total > 0
      ? ((metricas2.receitas.total - metricas1.receitas.total) / metricas1.receitas.total) * 100
      : 0;

    const variacaoDespesa = metricas1.despesas.total > 0
      ? ((metricas2.despesas.total - metricas1.despesas.total) / metricas1.despesas.total) * 100
      : 0;

    return {
      tipo: 'comparativo_meses',
      mes1: {
        periodo: mes1,
        ...metricas1
      },
      mes2: {
        periodo: mes2,
        ...metricas2
      },
      variacao: {
        receita: variacaoReceita.toFixed(1) + '%',
        despesa: variacaoDespesa.toFixed(1) + '%',
        lucro: (metricas2.resultado.lucro - metricas1.resultado.lucro)
      }
    };
  } else {
    // Comparativo entre empresas no mesmo mês
    const mes = mes1 || new Date().toISOString().slice(0, 7);
    const receitasStarken = await queryReceitas({ mes, empresa: 'Starken' });
    const receitasAlpha = await queryReceitas({ mes, empresa: 'Alpha' });

    const totalGeral = receitasStarken.total + receitasAlpha.total;

    return {
      tipo: 'comparativo_empresas',
      mes,
      starken: {
        receita: receitasStarken.total,
        participacao: totalGeral > 0 ? ((receitasStarken.total / totalGeral) * 100).toFixed(1) + '%' : '0%',
        clientes: receitasStarken.quantidade
      },
      alpha: {
        receitaBruta: receitasAlpha.total,
        royalties: receitasAlpha.total * 0.15,
        receitaLiquida: receitasAlpha.total * 0.85,
        participacao: totalGeral > 0 ? ((receitasAlpha.total / totalGeral) * 100).toFixed(1) + '%' : '0%',
        clientes: receitasAlpha.quantidade
      },
      total: totalGeral
    };
  }
}

// Executar a tool correspondente
async function executeTool(name, input) {
  switch (name) {
    case 'query_despesas':
      return await queryDespesas(input);
    case 'query_receitas':
      return await queryReceitas(input);
    case 'get_metricas_mes':
      return await getMetricasMes(input);
    case 'get_vencimentos':
      return await getVencimentos(input);
    case 'get_comparativo':
      return await getComparativo(input);
    default:
      throw new Error(`Tool não reconhecida: ${name}`);
  }
}

// Handler principal
exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const { message, conversationHistory = [] } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Mensagem não fornecida' })
      };
    }

    // Inicializar cliente Anthropic
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Preparar mensagens
    const messages = [
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    // Primeira chamada ao Claude
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools,
      messages
    });

    // Loop agentico - processar tool calls
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
      const toolResults = [];

      for (const toolUse of toolUseBlocks) {
        console.log(`Executando tool: ${toolUse.name}`, toolUse.input);

        try {
          const result = await executeTool(toolUse.name, toolUse.input);
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: JSON.stringify(result)
          });
        } catch (error) {
          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolUse.id,
            content: `Erro: ${error.message}`,
            is_error: true
          });
        }
      }

      // Adicionar resposta do assistente e resultados das tools
      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });

      // Nova chamada ao Claude com os resultados
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools,
        messages
      });
    }

    // Extrair texto da resposta final
    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: textContent,
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      })
    };

  } catch (error) {
    console.error('Erro no agente:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  } finally {
    await prisma.$disconnect();
  }
};
