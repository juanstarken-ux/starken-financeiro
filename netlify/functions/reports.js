const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

// ============================================
// DADOS FINANCEIROS HISTÓRICOS
// ============================================
const dadosMensais = {
  "2025-10": {
    periodo: "Outubro 2025",
    receitas: {
      total: 46365.05,
      starken: 28000,
      alpha: 18365.05,
      recebido: 41865.05,
      pendente: 4500.00
    },
    despesas: {
      total: 43047.07,
      pessoal: 18600,
      comercial: 7500,
      estrutura: 3000,
      ferramentas: 2800,
      alpha: 7000,
      outros: 4147.07
    },
    lucro: 3317.98,
    margem: 7.2,
    clientes: { starken: 12, alpha: 5 }
  },
  "2025-11": {
    periodo: "Novembro 2025",
    receitas: {
      total: 35768.18,
      starken: 22000,
      alpha: 13768.18,
      recebido: 10924.18,
      pendente: 24844.00
    },
    despesas: {
      total: 28500.00,
      pessoal: 11100,
      comercial: 7500,
      estrutura: 3000,
      ferramentas: 2700,
      alpha: 4200
    },
    lucro: 7268.18,
    margem: 20.3,
    clientes: { starken: 13, alpha: 8 }
  },
  "2025-12": {
    periodo: "Dezembro 2025",
    receitas: {
      total: 54982.75,
      starken: 29833.00,
      alpha: 25149.75,
      recebido: 3149.75,
      pendente: 51833.00
    },
    despesas: {
      total: 31869.90,
      pessoal: 11100,
      comercial: 7500,
      estrutura: 3009,
      ferramentas: 2760.90,
      alpha: 7500
    },
    lucro: 23112.85,
    margem: 42.0,
    clientes: { starken: 14, alpha: 15 }
  }
};

// ============================================
// GERADOR DE DRE
// ============================================
function gerarDRE(mes) {
  const dados = dadosMensais[mes];
  if (!dados) return { erro: 'Mês não encontrado' };

  const royaltiesAlpha = dados.receitas.alpha * 0.15;
  const receitaLiquida = dados.receitas.total - royaltiesAlpha;
  const custoServicos = dados.despesas.pessoal; // Dev + Design
  const lucroBruto = receitaLiquida - custoServicos;
  const despesasOperacionais = dados.despesas.comercial + dados.despesas.estrutura + dados.despesas.ferramentas;
  const lucroOperacional = lucroBruto - despesasOperacionais;

  return {
    tipo: 'DRE',
    periodo: dados.periodo,

    receitaBruta: {
      starken: dados.receitas.starken,
      alpha: dados.receitas.alpha,
      total: dados.receitas.total
    },

    deducoes: {
      royaltiesAlpha: royaltiesAlpha,
      impostos: 0 // Simples Nacional - incluído depois
    },

    receitaLiquida: receitaLiquida,

    custoServicos: {
      pessoal: dados.despesas.pessoal,
      total: custoServicos
    },

    lucroBruto: {
      valor: lucroBruto,
      margem: ((lucroBruto / receitaLiquida) * 100).toFixed(1) + '%'
    },

    despesasOperacionais: {
      comercial: dados.despesas.comercial,
      estrutura: dados.despesas.estrutura,
      ferramentas: dados.despesas.ferramentas,
      total: despesasOperacionais
    },

    lucroOperacional: {
      valor: lucroOperacional,
      margem: ((lucroOperacional / receitaLiquida) * 100).toFixed(1) + '%'
    },

    resultadoLiquido: {
      valor: dados.lucro,
      margem: dados.margem + '%'
    }
  };
}

// ============================================
// COMPARATIVO MENSAL
// ============================================
function gerarComparativo(meses) {
  const resultado = {
    tipo: 'Comparativo',
    meses: [],
    evolucao: {}
  };

  meses.forEach(mes => {
    const dados = dadosMensais[mes];
    if (dados) {
      resultado.meses.push({
        mes,
        periodo: dados.periodo,
        receitas: dados.receitas.total,
        despesas: dados.despesas.total,
        lucro: dados.lucro,
        margem: dados.margem + '%',
        clientes: dados.clientes.starken + dados.clientes.alpha
      });
    }
  });

  // Calcular evolução
  if (resultado.meses.length >= 2) {
    const primeiro = resultado.meses[0];
    const ultimo = resultado.meses[resultado.meses.length - 1];

    resultado.evolucao = {
      receitas: {
        valor: ultimo.receitas - primeiro.receitas,
        percentual: (((ultimo.receitas - primeiro.receitas) / primeiro.receitas) * 100).toFixed(1) + '%'
      },
      despesas: {
        valor: ultimo.despesas - primeiro.despesas,
        percentual: (((ultimo.despesas - primeiro.despesas) / primeiro.despesas) * 100).toFixed(1) + '%'
      },
      lucro: {
        valor: ultimo.lucro - primeiro.lucro,
        percentual: (((ultimo.lucro - primeiro.lucro) / primeiro.lucro) * 100).toFixed(1) + '%'
      },
      clientes: {
        valor: ultimo.clientes - primeiro.clientes
      }
    };
  }

  return resultado;
}

// ============================================
// ANÁLISE POR SEGMENTO
// ============================================
function gerarAnaliseSegmento(mes) {
  const dados = dadosMensais[mes];
  if (!dados) return { erro: 'Mês não encontrado' };

  const royaltiesAlpha = dados.receitas.alpha * 0.15;

  return {
    tipo: 'Análise por Segmento',
    periodo: dados.periodo,

    starken: {
      receita: dados.receitas.starken,
      participacao: ((dados.receitas.starken / dados.receitas.total) * 100).toFixed(1) + '%',
      clientes: dados.clientes.starken,
      ticketMedio: Math.round(dados.receitas.starken / dados.clientes.starken),
      margem: '100%',
      observacao: 'Receita própria, sem repasse'
    },

    alpha: {
      receitaBruta: dados.receitas.alpha,
      royalties: royaltiesAlpha,
      receitaLiquida: dados.receitas.alpha - royaltiesAlpha,
      participacao: ((dados.receitas.alpha / dados.receitas.total) * 100).toFixed(1) + '%',
      clientes: dados.clientes.alpha,
      ticketMedio: Math.round(dados.receitas.alpha / dados.clientes.alpha),
      margem: '85%',
      observacao: '15% de royalties para a franquia'
    },

    resumo: {
      receitaTotal: dados.receitas.total,
      clientesTotal: dados.clientes.starken + dados.clientes.alpha,
      ticketMedioGeral: Math.round(dados.receitas.total / (dados.clientes.starken + dados.clientes.alpha))
    }
  };
}

// ============================================
// PROJEÇÃO FINANCEIRA
// ============================================
function gerarProjecao(mesesFuturos = 3) {
  // Taxas de crescimento baseadas em histórico
  const taxaCrescimentoAlpha = 0.25; // 25% ao mês (crescimento acelerado)
  const taxaCrescimentoStarken = 0.05; // 5% ao mês (crescimento orgânico)
  const taxaCrescimentoDespesas = 0.08; // 8% ao mês (novos colaboradores)

  const ultimoMes = dadosMensais['2025-12'];
  const projecoes = [];

  let receitaStarken = ultimoMes.receitas.starken;
  let receitaAlpha = ultimoMes.receitas.alpha;
  let despesas = ultimoMes.despesas.total;
  let clientesStarken = ultimoMes.clientes.starken;
  let clientesAlpha = ultimoMes.clientes.alpha;

  const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];

  for (let i = 0; i < mesesFuturos; i++) {
    receitaStarken = receitaStarken * (1 + taxaCrescimentoStarken);
    receitaAlpha = receitaAlpha * (1 + taxaCrescimentoAlpha);
    despesas = despesas * (1 + taxaCrescimentoDespesas);
    clientesAlpha = Math.round(clientesAlpha * 1.3); // +30% clientes Alpha

    const receitaTotal = receitaStarken + receitaAlpha;
    const lucro = receitaTotal - despesas;
    const margem = (lucro / receitaTotal) * 100;

    projecoes.push({
      mes: `2026-${String(i + 1).padStart(2, '0')}`,
      periodo: `${mesesNomes[i]} 2026`,
      receitas: {
        starken: Math.round(receitaStarken),
        alpha: Math.round(receitaAlpha),
        total: Math.round(receitaTotal)
      },
      despesas: Math.round(despesas),
      lucro: Math.round(lucro),
      margem: margem.toFixed(1) + '%',
      clientes: {
        starken: clientesStarken,
        alpha: clientesAlpha,
        total: clientesStarken + clientesAlpha
      }
    });
  }

  return {
    tipo: 'Projeção Financeira',
    baseCalculo: 'Dezembro 2025',
    premissas: {
      crescimentoStarken: '5% ao mês',
      crescimentoAlpha: '25% ao mês',
      crescimentoDespesas: '8% ao mês',
      crescimentoClientesAlpha: '30% ao mês'
    },
    projecoes,
    alertas: projecoes.filter(p => parseFloat(p.margem) < 20).length > 0
      ? ['Atenção: Despesas crescendo mais rápido que receitas em alguns meses']
      : ['Projeção saudável: Margem se mantém acima de 20%']
  };
}

// ============================================
// RELATÓRIO EXECUTIVO
// ============================================
function gerarRelatorioExecutivo(mes) {
  const dados = dadosMensais[mes];
  if (!dados) return { erro: 'Mês não encontrado' };

  const mesAnterior = mes === '2025-12' ? '2025-11' : '2025-10';
  const dadosAnterior = dadosMensais[mesAnterior];

  const variacaoReceita = ((dados.receitas.total - dadosAnterior.receitas.total) / dadosAnterior.receitas.total * 100).toFixed(1);
  const variacaoLucro = ((dados.lucro - dadosAnterior.lucro) / dadosAnterior.lucro * 100).toFixed(1);

  return {
    tipo: 'Relatório Executivo',
    periodo: dados.periodo,
    geradoEm: new Date().toISOString(),

    resumo: {
      receitaTotal: dados.receitas.total,
      despesaTotal: dados.despesas.total,
      lucroLiquido: dados.lucro,
      margemLiquida: dados.margem + '%'
    },

    comparativoMesAnterior: {
      receitas: `${variacaoReceita > 0 ? '+' : ''}${variacaoReceita}%`,
      lucro: `${variacaoLucro > 0 ? '+' : ''}${variacaoLucro}%`
    },

    destaques: [
      dados.margem >= 40 ? '✅ Margem excelente (acima de 40%)' : dados.margem >= 25 ? '✅ Margem saudável' : '⚠️ Margem baixa',
      variacaoReceita > 20 ? '✅ Crescimento acelerado de receita' : variacaoReceita > 0 ? '✅ Receita em crescimento' : '⚠️ Receita em queda',
      dados.clientes.alpha > 10 ? '✅ Alpha expandindo rapidamente' : '📈 Alpha em crescimento'
    ],

    acoes: [
      dados.margem < 25 ? 'Revisar estrutura de custos' : null,
      variacaoReceita < 10 ? 'Intensificar prospecção comercial' : null,
      dados.clientes.alpha > dados.clientes.starken ? 'Diversificar base Starken' : null
    ].filter(Boolean),

    segmentos: {
      starken: {
        receita: dados.receitas.starken,
        clientes: dados.clientes.starken,
        participacao: ((dados.receitas.starken / dados.receitas.total) * 100).toFixed(1) + '%'
      },
      alpha: {
        receita: dados.receitas.alpha,
        clientes: dados.clientes.alpha,
        participacao: ((dados.receitas.alpha / dados.receitas.total) * 100).toFixed(1) + '%'
      }
    }
  };
}

// ============================================
// HANDLER
// ============================================
exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const params = event.queryStringParameters || {};
    const tipo = params.tipo || 'executivo';
    const mes = params.mes || '2025-12';

    let relatorio;

    switch (tipo) {
      case 'dre':
        relatorio = gerarDRE(mes);
        break;

      case 'comparativo':
        const meses = params.meses ? params.meses.split(',') : ['2025-10', '2025-11', '2025-12'];
        relatorio = gerarComparativo(meses);
        break;

      case 'segmento':
        relatorio = gerarAnaliseSegmento(mes);
        break;

      case 'projecao':
        const qtdMeses = parseInt(params.meses) || 3;
        relatorio = gerarProjecao(qtdMeses);
        break;

      case 'executivo':
      default:
        relatorio = gerarRelatorioExecutivo(mes);
        break;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        dataGeracao: new Date().toISOString(),
        relatorio
      })
    };

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await prisma.$disconnect();
  }
};
