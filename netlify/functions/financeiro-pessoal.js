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
    const method = event.httpMethod;

    // GET - Listar dados
    if (method === 'GET') {
      return await handleGet(event.queryStringParameters);
    }

    // POST - Criar ou ações específicas
    if (method === 'POST') {
      const body = JSON.parse(event.body);
      return await handlePost(body);
    }

    // PUT - Atualizar
    if (method === 'PUT') {
      const body = JSON.parse(event.body);
      return await handlePut(body);
    }

    // DELETE - Remover
    if (method === 'DELETE') {
      const body = JSON.parse(event.body);
      return await handleDelete(body);
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Método não permitido' })
    };
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

// GET - Listar dados de um sócio
async function handleGet(params) {
  const { socioId, tipo, mes } = params || {};

  if (!socioId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'socioId é obrigatório' })
    };
  }

  // Verificar se sócio existe
  const socio = await prisma.socio.findUnique({ where: { id: socioId } });
  if (!socio) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ success: false, error: 'Acesso negado' })
    };
  }

  const whereClause = { socioId };
  if (mes) whereClause.mes = mes;

  let dados = {};

  // Buscar todos os tipos se não especificado
  if (!tipo || tipo === 'despesas' || tipo === 'todos') {
    dados.despesas = await prisma.despesaPessoal.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
  }

  if (!tipo || tipo === 'emprestimos' || tipo === 'todos') {
    dados.emprestimos = await prisma.emprestimo.findMany({
      where: { socioId },
      orderBy: { createdAt: 'desc' }
    });
  }

  if (!tipo || tipo === 'investimentos' || tipo === 'todos') {
    const invWhereClause = { socioId };
    if (mes) invWhereClause.mes = mes;
    dados.investimentos = await prisma.investimento.findMany({
      where: invWhereClause,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Calcular resumo
  const resumo = {
    totalDespesas: (dados.despesas || []).reduce((sum, d) => sum + d.valor, 0),
    totalPago: (dados.despesas || []).filter(d => d.status === 'Pago').reduce((sum, d) => sum + d.valor, 0),
    totalPendente: (dados.despesas || []).filter(d => d.status === 'A Pagar').reduce((sum, d) => sum + d.valor, 0),
    totalEmprestimosAtivos: (dados.emprestimos || []).filter(e => e.status === 'Ativo').reduce((sum, e) => sum + e.valorRestante, 0),
    totalInvestimentos: (dados.investimentos || []).reduce((sum, i) => sum + i.valor, 0)
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, dados, resumo })
  };
}

// POST - Criar novos itens
async function handlePost(body) {
  const { acao, socioId, dados } = body;

  if (!socioId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'socioId é obrigatório' })
    };
  }

  // Verificar se sócio existe
  const socio = await prisma.socio.findUnique({ where: { id: socioId } });
  if (!socio) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ success: false, error: 'Acesso negado' })
    };
  }

  switch (acao) {
    case 'criar-despesa':
      return await criarDespesa(socioId, dados);

    case 'criar-emprestimo':
      return await criarEmprestimo(socioId, dados);

    case 'criar-investimento':
      return await criarInvestimento(socioId, dados);

    default:
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: `Ação desconhecida: ${acao}` })
      };
  }
}

// PUT - Atualizar itens
async function handlePut(body) {
  const { tipo, id, socioId, dados } = body;

  if (!socioId || !id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'socioId e id são obrigatórios' })
    };
  }

  switch (tipo) {
    case 'despesa':
      return await atualizarDespesa(id, socioId, dados);

    case 'emprestimo':
      return await atualizarEmprestimo(id, socioId, dados);

    case 'investimento':
      return await atualizarInvestimento(id, socioId, dados);

    default:
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: `Tipo desconhecido: ${tipo}` })
      };
  }
}

// DELETE - Remover itens
async function handleDelete(body) {
  const { tipo, id, socioId } = body;

  if (!socioId || !id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'socioId e id são obrigatórios' })
    };
  }

  switch (tipo) {
    case 'despesa':
      return await removerDespesa(id, socioId);

    case 'emprestimo':
      return await removerEmprestimo(id, socioId);

    case 'investimento':
      return await removerInvestimento(id, socioId);

    default:
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: `Tipo desconhecido: ${tipo}` })
      };
  }
}

// =====================================================
// DESPESAS
// =====================================================

async function criarDespesa(socioId, dados) {
  const despesa = await prisma.despesaPessoal.create({
    data: {
      socioId,
      mes: dados.mes || getMesAtual(),
      nome: dados.nome,
      valor: parseFloat(dados.valor),
      categoria: dados.categoria || 'outros',
      status: dados.status || 'A Pagar',
      vencimento: dados.vencimento ? new Date(dados.vencimento) : null,
      dataPagamento: dados.dataPagamento ? new Date(dados.dataPagamento) : null,
      observacao: dados.observacao || null,
      recorrente: dados.recorrente || false
    }
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ success: true, despesa })
  };
}

async function atualizarDespesa(id, socioId, dados) {
  // Verificar se pertence ao sócio
  const existing = await prisma.despesaPessoal.findFirst({
    where: { id, socioId }
  });

  if (!existing) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Despesa não encontrada ou acesso negado' })
    };
  }

  const despesa = await prisma.despesaPessoal.update({
    where: { id },
    data: {
      nome: dados.nome !== undefined ? dados.nome : undefined,
      valor: dados.valor !== undefined ? parseFloat(dados.valor) : undefined,
      categoria: dados.categoria !== undefined ? dados.categoria : undefined,
      status: dados.status !== undefined ? dados.status : undefined,
      vencimento: dados.vencimento !== undefined ? (dados.vencimento ? new Date(dados.vencimento) : null) : undefined,
      dataPagamento: dados.dataPagamento !== undefined ? (dados.dataPagamento ? new Date(dados.dataPagamento) : null) : undefined,
      observacao: dados.observacao !== undefined ? dados.observacao : undefined,
      recorrente: dados.recorrente !== undefined ? dados.recorrente : undefined
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, despesa })
  };
}

async function removerDespesa(id, socioId) {
  // Verificar se pertence ao sócio
  const existing = await prisma.despesaPessoal.findFirst({
    where: { id, socioId }
  });

  if (!existing) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Despesa não encontrada ou acesso negado' })
    };
  }

  await prisma.despesaPessoal.delete({ where: { id } });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, message: 'Despesa removida' })
  };
}

// =====================================================
// EMPRÉSTIMOS
// =====================================================

async function criarEmprestimo(socioId, dados) {
  const emprestimo = await prisma.emprestimo.create({
    data: {
      socioId,
      tipo: dados.tipo,
      valor: parseFloat(dados.valor),
      valorRestante: parseFloat(dados.valorRestante || dados.valor),
      descricao: dados.descricao,
      dataInicio: new Date(dados.dataInicio || new Date()),
      dataPrevisao: dados.dataPrevisao ? new Date(dados.dataPrevisao) : null,
      status: dados.status || 'Ativo',
      socioDestinoId: dados.socioDestinoId || null
    }
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ success: true, emprestimo })
  };
}

async function atualizarEmprestimo(id, socioId, dados) {
  const existing = await prisma.emprestimo.findFirst({
    where: { id, socioId }
  });

  if (!existing) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Empréstimo não encontrado ou acesso negado' })
    };
  }

  const emprestimo = await prisma.emprestimo.update({
    where: { id },
    data: {
      valorRestante: dados.valorRestante !== undefined ? parseFloat(dados.valorRestante) : undefined,
      status: dados.status !== undefined ? dados.status : undefined,
      descricao: dados.descricao !== undefined ? dados.descricao : undefined,
      dataPrevisao: dados.dataPrevisao !== undefined ? (dados.dataPrevisao ? new Date(dados.dataPrevisao) : null) : undefined
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, emprestimo })
  };
}

async function removerEmprestimo(id, socioId) {
  const existing = await prisma.emprestimo.findFirst({
    where: { id, socioId }
  });

  if (!existing) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Empréstimo não encontrado ou acesso negado' })
    };
  }

  await prisma.emprestimo.delete({ where: { id } });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, message: 'Empréstimo removido' })
  };
}

// =====================================================
// INVESTIMENTOS
// =====================================================

async function criarInvestimento(socioId, dados) {
  const investimento = await prisma.investimento.create({
    data: {
      socioId,
      tipo: dados.tipo,
      valor: parseFloat(dados.valor),
      descricao: dados.descricao,
      dataOperacao: new Date(dados.dataOperacao || new Date()),
      mes: dados.mes || getMesAtual()
    }
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ success: true, investimento })
  };
}

async function atualizarInvestimento(id, socioId, dados) {
  const existing = await prisma.investimento.findFirst({
    where: { id, socioId }
  });

  if (!existing) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Investimento não encontrado ou acesso negado' })
    };
  }

  const investimento = await prisma.investimento.update({
    where: { id },
    data: {
      tipo: dados.tipo !== undefined ? dados.tipo : undefined,
      valor: dados.valor !== undefined ? parseFloat(dados.valor) : undefined,
      descricao: dados.descricao !== undefined ? dados.descricao : undefined
    }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, investimento })
  };
}

async function removerInvestimento(id, socioId) {
  const existing = await prisma.investimento.findFirst({
    where: { id, socioId }
  });

  if (!existing) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Investimento não encontrado ou acesso negado' })
    };
  }

  await prisma.investimento.delete({ where: { id } });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, message: 'Investimento removido' })
  };
}

// Helper
function getMesAtual() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
