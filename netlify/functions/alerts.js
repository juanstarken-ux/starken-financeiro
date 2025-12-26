const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json'
};

// ============================================
// DADOS FINANCEIROS (mesmo do agent.js)
// ============================================
const dadosFinanceiros = {
  "2025-12": {
    periodo: "Dezembro 2025",
    receitas: {
      total: 54982.75,
      starken: 29833.00,
      alpha: 25149.75,
      clientes_starken: [
        { nome: "Bengers - App Festival", valor: 10000, status: "A Receber", vencimento: "2025-12-15" },
        { nome: "Mortadella Blumenau", valor: 2000, status: "A Receber", vencimento: "2025-12-10" },
        { nome: "Hamburgueria Feio", valor: 2000, status: "A Receber", vencimento: "2025-12-10" },
        { nome: "Academia São Pedro", valor: 1080, status: "A Receber", vencimento: "2025-12-15" },
        { nome: "Estilo Tulipa", valor: 659, status: "A Receber", vencimento: "2025-12-10" },
        { nome: "JPR Móveis Rústicos", valor: 2000, status: "A Receber", vencimento: "2025-12-20" },
        { nome: "Realizzati Móveis", valor: 2500, status: "A Receber", vencimento: "2025-12-20" },
        { nome: "Suprema Pizza", valor: 2000, status: "A Receber", vencimento: "2025-12-15" },
        { nome: "Shield Car Blumenau", valor: 297, status: "A Receber", vencimento: "2025-12-10" },
        { nome: "Rosa Mexicano Blumenau", valor: 2000, status: "A Receber", vencimento: "2025-12-10" },
        { nome: "Rosa Mexicano Brusque", valor: 2000, status: "A Receber", vencimento: "2025-12-10" },
        { nome: "Divino Tempero", valor: 1000, status: "A Receber", vencimento: "2025-12-15" },
        { nome: "Alexandria Burger", valor: 2000, status: "A Receber", vencimento: "2025-12-20" },
        { nome: "Dommus Smart Home", valor: 297, status: "A Receber", vencimento: "2025-12-10" }
      ],
      clientes_alpha_mrr: [
        { nome: "Oca Restaurante", valor: 2000, status: "A Receber", vencimento: "2025-12-10" },
        { nome: "Madrugão Lanches", valor: 2000, status: "A Receber", vencimento: "2025-12-10" },
        { nome: "Saporitto Pizzaria", valor: 1500, status: "A Receber", vencimento: "2025-12-15" },
        { nome: "Fratellis Pizzaria", valor: 2500, status: "A Receber", vencimento: "2025-12-15" },
        { nome: "Brazza Hamburgueria", valor: 3000, status: "A Receber", vencimento: "2025-12-10" },
        { nome: "Fabinhus Restaurante", valor: 1000, status: "A Receber", vencimento: "2025-12-20" },
        { nome: "Tempero Manero Grill", valor: 1000, status: "A Receber", vencimento: "2025-12-20" },
        { nome: "Super Dupe Hamburgueria BC", valor: 2000, status: "A Receber", vencimento: "2025-12-20" }
      ]
    },
    despesas: {
      total: 31869.90,
      itens: [
        { nome: "Ederson", valor: 3200, categoria: "Pessoal", vencimento: "2025-12-05" },
        { nome: "Victor", valor: 3000, categoria: "Pessoal", vencimento: "2025-12-05" },
        { nome: "Igor", valor: 2300, categoria: "Pessoal", vencimento: "2025-12-05" },
        { nome: "Kim", valor: 1300, categoria: "Pessoal", vencimento: "2025-12-05" },
        { nome: "Erick", valor: 1300, categoria: "Pessoal", vencimento: "2025-12-05" },
        { nome: "Dante - Closer", valor: 3500, categoria: "Comercial", vencimento: "2025-12-05" },
        { nome: "Nathan - SDR", valor: 2000, categoria: "Comercial", vencimento: "2025-12-05" },
        { nome: "João - SDR", valor: 2000, categoria: "Comercial", vencimento: "2025-12-05" },
        { nome: "Aluguel - Sala", valor: 2800, categoria: "Estrutura", vencimento: "2025-12-10" },
        { nome: "Celesc - Energia", valor: 100, categoria: "Estrutura", vencimento: "2025-12-15" },
        { nome: "Internet - Claro", valor: 109, categoria: "Estrutura", vencimento: "2025-12-15" },
        { nome: "Royalties Alpha", valor: 7500, categoria: "Alpha", vencimento: "2025-12-30" },
        { nome: "Mac Ederson", valor: 1200, categoria: "Ferramentas", vencimento: "2025-12-10" },
        { nome: "Claude Code", valor: 500, categoria: "Ferramentas", vencimento: "2025-12-01" },
        { nome: "ClickUp", valor: 350, categoria: "Ferramentas", vencimento: "2025-12-01" },
        { nome: "VPS Hostinger", valor: 200, categoria: "Ferramentas", vencimento: "2025-12-05" },
        { nome: "Lovable", valor: 130, categoria: "Ferramentas", vencimento: "2025-12-01" },
        { nome: "Adobe", valor: 110, categoria: "Ferramentas", vencimento: "2025-12-15" },
        { nome: "Criativivo", valor: 100, categoria: "Ferramentas", vencimento: "2025-12-01" },
        { nome: "CapCut", valor: 65.90, categoria: "Ferramentas", vencimento: "2025-12-01" },
        { nome: "Canva Pro", valor: 35, categoria: "Ferramentas", vencimento: "2025-12-01" },
        { nome: "Railway", valor: 35, categoria: "Ferramentas", vencimento: "2025-12-01" },
        { nome: "Netlify", valor: 35, categoria: "Ferramentas", vencimento: "2025-12-01" }
      ]
    }
  }
};

// ============================================
// FUNÇÕES DE ALERTA
// ============================================

function calcularDiasAteVencimento(dataVencimento) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);
  const diffTime = vencimento - hoje;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

async function getAlertasVencimento(dados) {
  const alertas = [];
  const hoje = new Date().toISOString().split('T')[0];

  // Buscar status do banco
  const statusData = await prisma.paymentStatus.findMany({
    where: { mes: '2025-12' }
  });

  const statusMap = {};
  statusData.forEach(item => {
    statusMap[`${item.tipo}-${item.itemId}`] = item.status;
  });

  // Verificar receitas
  const todasReceitas = [
    ...dados.receitas.clientes_starken.map(c => ({ ...c, empresa: 'Starken' })),
    ...dados.receitas.clientes_alpha_mrr.map(c => ({ ...c, empresa: 'Alpha' }))
  ];

  todasReceitas.forEach((cliente, idx) => {
    const statusBanco = statusMap[`receita-${idx}`];
    const statusFinal = statusBanco || cliente.status;

    if (statusFinal === 'Recebido') return;

    const dias = calcularDiasAteVencimento(cliente.vencimento);

    if (dias < 0) {
      alertas.push({
        tipo: 'vencido',
        categoria: 'receita',
        prioridade: 'alta',
        titulo: `Pagamento atrasado: ${cliente.nome}`,
        descricao: `R$ ${cliente.valor.toLocaleString('pt-BR')} venceu há ${Math.abs(dias)} dias`,
        valor: cliente.valor,
        empresa: cliente.empresa,
        diasAtraso: Math.abs(dias),
        icone: '🔴'
      });
    } else if (dias === 0) {
      alertas.push({
        tipo: 'hoje',
        categoria: 'receita',
        prioridade: 'alta',
        titulo: `Vence HOJE: ${cliente.nome}`,
        descricao: `R$ ${cliente.valor.toLocaleString('pt-BR')} a receber`,
        valor: cliente.valor,
        empresa: cliente.empresa,
        icone: '🟠'
      });
    } else if (dias <= 3) {
      alertas.push({
        tipo: 'proximo',
        categoria: 'receita',
        prioridade: 'media',
        titulo: `Vence em ${dias} dias: ${cliente.nome}`,
        descricao: `R$ ${cliente.valor.toLocaleString('pt-BR')} a receber`,
        valor: cliente.valor,
        empresa: cliente.empresa,
        diasRestantes: dias,
        icone: '🟡'
      });
    }
  });

  // Verificar despesas
  dados.despesas.itens.forEach((despesa, idx) => {
    const statusBanco = statusMap[`despesa-${idx}`];
    const statusFinal = statusBanco || 'Pendente';

    if (statusFinal === 'Pago') return;

    const dias = calcularDiasAteVencimento(despesa.vencimento);

    if (dias < 0) {
      alertas.push({
        tipo: 'vencido',
        categoria: 'despesa',
        prioridade: 'alta',
        titulo: `Conta atrasada: ${despesa.nome}`,
        descricao: `R$ ${despesa.valor.toLocaleString('pt-BR')} venceu há ${Math.abs(dias)} dias`,
        valor: despesa.valor,
        categoriaItem: despesa.categoria,
        diasAtraso: Math.abs(dias),
        icone: '🔴'
      });
    } else if (dias === 0) {
      alertas.push({
        tipo: 'hoje',
        categoria: 'despesa',
        prioridade: 'alta',
        titulo: `Pagar HOJE: ${despesa.nome}`,
        descricao: `R$ ${despesa.valor.toLocaleString('pt-BR')}`,
        valor: despesa.valor,
        categoriaItem: despesa.categoria,
        icone: '🟠'
      });
    } else if (dias <= 3) {
      alertas.push({
        tipo: 'proximo',
        categoria: 'despesa',
        prioridade: 'media',
        titulo: `Pagar em ${dias} dias: ${despesa.nome}`,
        descricao: `R$ ${despesa.valor.toLocaleString('pt-BR')}`,
        valor: despesa.valor,
        categoriaItem: despesa.categoria,
        diasRestantes: dias,
        icone: '🟡'
      });
    }
  });

  return alertas;
}

function getAlertasFluxoCaixa(dados) {
  const alertas = [];

  const receitasPendentes = dados.receitas.total;
  const despesasPendentes = dados.despesas.total;
  const saldoProjetado = receitasPendentes - despesasPendentes;

  // Alerta se margem for menor que 20%
  const margem = (saldoProjetado / receitasPendentes) * 100;

  if (margem < 20) {
    alertas.push({
      tipo: 'fluxo',
      categoria: 'caixa',
      prioridade: margem < 10 ? 'alta' : 'media',
      titulo: 'Margem apertada este mês',
      descricao: `Margem de ${margem.toFixed(1)}% - abaixo do ideal de 30%`,
      valor: saldoProjetado,
      icone: margem < 10 ? '🔴' : '🟡'
    });
  }

  // Alerta positivo se tiver boa margem
  if (margem >= 40) {
    alertas.push({
      tipo: 'positivo',
      categoria: 'caixa',
      prioridade: 'info',
      titulo: 'Margem excelente!',
      descricao: `Margem de ${margem.toFixed(1)}% - acima da meta de 30%`,
      valor: saldoProjetado,
      icone: '🟢'
    });
  }

  return alertas;
}

function getAlertasCrescimento(dados) {
  const alertas = [];

  // Alertas sobre Alpha crescendo
  const clientesAlpha = dados.receitas.clientes_alpha_mrr.length;

  if (clientesAlpha >= 8) {
    alertas.push({
      tipo: 'crescimento',
      categoria: 'alpha',
      prioridade: 'info',
      titulo: 'Alpha em crescimento acelerado',
      descricao: `${clientesAlpha} clientes MRR ativos - crescendo ~5/mês`,
      icone: '📈'
    });
  }

  return alertas;
}

function gerarResumoSemanal(dados) {
  const totalReceitas = dados.receitas.total;
  const totalDespesas = dados.despesas.total;
  const lucro = totalReceitas - totalDespesas;
  const margem = (lucro / totalReceitas) * 100;

  return {
    tipo: 'resumo',
    periodo: 'Dezembro 2025',
    receitas: {
      total: totalReceitas,
      starken: dados.receitas.starken,
      alpha: dados.receitas.alpha
    },
    despesas: {
      total: totalDespesas
    },
    resultado: {
      lucro,
      margem: margem.toFixed(1) + '%'
    },
    clientes: {
      starken: dados.receitas.clientes_starken.length,
      alpha: dados.receitas.clientes_alpha_mrr.length
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
    const dados = dadosFinanceiros['2025-12'];

    // Buscar todos os alertas
    const alertasVencimento = await getAlertasVencimento(dados);
    const alertasFluxo = getAlertasFluxoCaixa(dados);
    const alertasCrescimento = getAlertasCrescimento(dados);

    const todosAlertas = [...alertasVencimento, ...alertasFluxo, ...alertasCrescimento];

    // Ordenar por prioridade
    const prioridadeOrdem = { alta: 0, media: 1, info: 2 };
    todosAlertas.sort((a, b) => prioridadeOrdem[a.prioridade] - prioridadeOrdem[b.prioridade]);

    // Gerar resumo
    const resumo = gerarResumoSemanal(dados);

    // Contar por tipo
    const contagem = {
      total: todosAlertas.length,
      alta: todosAlertas.filter(a => a.prioridade === 'alta').length,
      media: todosAlertas.filter(a => a.prioridade === 'media').length,
      info: todosAlertas.filter(a => a.prioridade === 'info').length,
      vencidos: todosAlertas.filter(a => a.tipo === 'vencido').length,
      hoje: todosAlertas.filter(a => a.tipo === 'hoje').length,
      proximos: todosAlertas.filter(a => a.tipo === 'proximo').length
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        dataConsulta: new Date().toISOString(),
        contagem,
        alertas: todosAlertas,
        resumo
      })
    };

  } catch (error) {
    console.error('Erro ao gerar alertas:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await prisma.$disconnect();
  }
};
