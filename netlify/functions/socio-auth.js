const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Método não permitido' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { acao } = body;

    switch (acao) {
      case 'login':
        return await handleLogin(body);

      case 'verificar':
        return await handleVerificar(body);

      case 'alterar-senha':
        return await handleAlterarSenha(body);

      case 'listar-socios':
        return await handleListarSocios();

      default:
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ success: false, error: `Ação desconhecida: ${acao}` })
        };
    }
  } catch (error) {
    console.error('Erro:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};

// Login do sócio
async function handleLogin({ username, senha }) {
  if (!username || !senha) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Username e senha são obrigatórios' })
    };
  }

  const socio = await prisma.socio.findUnique({
    where: { username: username.toLowerCase() }
  });

  if (!socio) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, error: 'Usuário não encontrado' })
    };
  }

  const senhaValida = await bcrypt.compare(senha, socio.senhaHash);

  if (!senhaValida) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, error: 'Senha incorreta' })
    };
  }

  // Retorna dados do sócio (sem a senha)
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      socio: {
        id: socio.id,
        username: socio.username,
        nome: socio.nome,
        email: socio.email
      }
    })
  };
}

// Verificar se sócio existe
async function handleVerificar({ socioId }) {
  if (!socioId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'socioId é obrigatório' })
    };
  }

  const socio = await prisma.socio.findUnique({
    where: { id: socioId }
  });

  if (!socio) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Sócio não encontrado' })
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      socio: {
        id: socio.id,
        username: socio.username,
        nome: socio.nome
      }
    })
  };
}

// Alterar senha
async function handleAlterarSenha({ socioId, senhaAtual, novaSenha }) {
  if (!socioId || !senhaAtual || !novaSenha) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, error: 'Dados incompletos' })
    };
  }

  const socio = await prisma.socio.findUnique({
    where: { id: socioId }
  });

  if (!socio) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ success: false, error: 'Sócio não encontrado' })
    };
  }

  const senhaValida = await bcrypt.compare(senhaAtual, socio.senhaHash);

  if (!senhaValida) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ success: false, error: 'Senha atual incorreta' })
    };
  }

  // Atualizar com nova senha
  const novoHash = await bcrypt.hash(novaSenha, 10);

  await prisma.socio.update({
    where: { id: socioId },
    data: { senhaHash: novoHash }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, message: 'Senha alterada com sucesso' })
  };
}

// Listar sócios (apenas nomes e usernames, para o seletor)
async function handleListarSocios() {
  const socios = await prisma.socio.findMany({
    select: {
      id: true,
      username: true,
      nome: true
    },
    orderBy: { nome: 'asc' }
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ success: true, socios })
  };
}
