// Dados Mensais Consolidados - Starken Financeiro
// Atualizado: 17/01/2025

const dadosMensais = {
  // NOVEMBRO 2025
  "2025-11": {
    periodo: "Novembro 2025",
    receitas: {
      total: 34768.18,
      recebido: 12924.18,
      pendente: 21844.00,
      taxa_recebimento: 37.2,
      clientes: [
        {nome: "Mortadella Blumenau 1/2", valor: 3000.00, status: "Feito"},
        {nome: "Mortadella Blumenau 2/2", valor: 3000.00, status: "A Pagar"},
        {nome: "Hamburgueria Feio", valor: 2000.00, status: "Feito"},
        {nome: "Academia São Pedro", valor: 1080.00, status: "Feito"},
        {nome: "Renomaq", valor: 800.00, status: "A Pagar"},
        {nome: "Alexandria Burger 1/2", valor: 1000.00, status: "A Pagar"},
        {nome: "Estilo Tulipa", valor: 500.00, status: "Feito"},
        {nome: "JPR Móveis Rústicos", valor: 2000.00, status: "Feito"},
        {nome: "Brazza BNU 1/2", valor: 1500.00, status: "Feito"},
        {nome: "Brazza BNU 2/2", valor: 1500.00, status: "A Pagar"},
        {nome: "Pizzaria Don Chevico", valor: 2844.18, status: "Feito"},
        {nome: "Realizzati Móveis", valor: 2500.00, status: "A Pagar"},
        {nome: "Oca Restaurante (Alpha)", valor: 2000.00, status: "A Pagar"},
        {nome: "Madrugão Lanches (Alpha)", valor: 2000.00, status: "A Pagar"},
        {nome: "Suprema Pizza", valor: 2000.00, status: "A Pagar"},
        {nome: "Shield Car Blumenau", valor: 297.00, status: "A Pagar"},
        {nome: "Matriz 1", valor: 3373.50, status: "A Pagar"},
        {nome: "Matriz 2", valor: 3373.50, status: "A Pagar"}
      ]
    },
    despesas: {
      total: 27869.90,
      pago: 15360.90,
      pendente: 12509.00,
      categorias: {
        pessoal: {
          total: 11300.00,
          itens: [
            {nome: "Igor", valor: 2200.00, status: "Feito"},
            {nome: "Ederson", valor: 800.00, status: "Feito"},
            {nome: "Victor", valor: 3000.00, status: "Feito"},
            {nome: "Victor", valor: 3000.00, status: "A Pagar"},
            {nome: "Ederson", valor: 2300.00, status: "A Pagar"}
          ]
        },
        comercial: {
          total: 6000.00,
          itens: [
            {nome: "Dante - Closer", valor: 2500.00, status: "Feito"},
            {nome: "Nathan - SDR", valor: 750.00, status: "Feito"},
            {nome: "João - SDR", valor: 750.00, status: "Feito"},
            {nome: "Nathan", valor: 750.00, status: "A Pagar"},
            {nome: "João", valor: 750.00, status: "A Pagar"},
            {nome: "Dante", valor: 500.00, status: "A Pagar"}
          ]
        },
        estrutura: {
          total: 10509.00,
          itens: [
            {nome: "Aluguel - Sala", valor: 2800.00, status: "Feito"},
            {nome: "Celesc - Energia", valor: 100.00, status: "A Pagar"},
            {nome: "Internet - Claro", valor: 109.00, status: "A Pagar"},
            {nome: "Pagamento - Alpha", valor: 7500.00, status: "A Pagar"}
          ]
        },
        ferramentas: {
          total: 2560.90,
          itens: [
            {nome: "ClickUp", valor: 350.00, status: "Feito"},
            {nome: "Claude Code", valor: 500.00, status: "Feito"},
            {nome: "CapCut", valor: 65.90, status: "Feito"},
            {nome: "Canva Pro", valor: 35.00, status: "Feito"},
            {nome: "Criativivo", valor: 100.00, status: "Feito"},
            {nome: "Adobe", valor: 110.00, status: "Feito"},
            {nome: "Railway Backend", valor: 35.00, status: "Feito"},
            {nome: "Netlify - Hospedagem", valor: 35.00, status: "Feito"},
            {nome: "Lovable", valor: 130.00, status: "Feito"},
            {nome: "Mac Ederson", valor: 1200.00, status: "Feito"}
          ]
        }
      }
    }
  },

  // DEZEMBRO 2025
  "2025-12": {
    periodo: "Dezembro 2025",
    receitas: {
      total: 38030.00,
      recebido: 0.00,
      pendente: 38030.00,
      taxa_recebimento: 0.0,
      clientes: [
        {nome: "Mortadella Blumenau 1/2", valor: 3000.00, status: "A Pagar", vencimento: "10/12"},
        {nome: "Mortadella Blumenau 2/2", valor: 3000.00, status: "A Pagar", vencimento: "20/12"},
        {nome: "Hamburgueria Feio", valor: 2000.00, status: "A Pagar", vencimento: "15/12"},
        {nome: "Academia São Pedro", valor: 1080.00, status: "A Pagar", vencimento: "10/12"},
        {nome: "Estilo Tulipa", valor: 659.00, status: "A Pagar", vencimento: "10/12"},
        {nome: "JPR Móveis Rústicos", valor: 2000.00, status: "A Pagar", vencimento: "10/12"},
        {nome: "Brazza BNU 1/2", valor: 1500.00, status: "A Pagar", vencimento: "10/12"},
        {nome: "Brazza BNU 2/2", valor: 1500.00, status: "A Pagar", vencimento: "20/12"},
        {nome: "Matriz 1", valor: 3373.50, status: "A Pagar"},
        {nome: "Matriz 2", valor: 3373.50, status: "A Pagar"},
        {nome: "Matriz 3", valor: 3373.50, status: "A Pagar"},
        {nome: "Matriz 4", valor: 3373.50, status: "A Pagar"},
        {nome: "Realizzati Móveis", valor: 2500.00, status: "A Pagar", vencimento: "25/12"},
        {nome: "Oca Restaurante (Alpha)", valor: 2000.00, status: "A Pagar", liquido: 1700.00},
        {nome: "Madrugão Lanches (Alpha)", valor: 2000.00, status: "A Pagar", liquido: 1700.00},
        {nome: "Divino Tempero", valor: 1000.00, status: "A Pagar", vencimento: "20/12"},
        {nome: "Suprema Pizza", valor: 2000.00, status: "Pendente"},
        {nome: "Shield Car Blumenau", valor: 297.00, status: "Pendente"}
      ]
    },
    despesas: {
      total: 31869.90,
      pago: 0.00,
      pendente: 31869.90,
      categorias: {
        pessoal: {
          total: 14100.00,
          itens: [
            {nome: "Igor", valor: 2300.00, status: "A Pagar"},
            {nome: "Ederson", valor: 3200.00, status: "A Pagar"},
            {nome: "Victor", valor: 6000.00, status: "A Pagar"},
            {nome: "Kim", valor: 1300.00, status: "A Pagar"},
            {nome: "Erick", valor: 1300.00, status: "A Pagar"}
          ]
        },
        comercial: {
          total: 7500.00,
          itens: [
            {nome: "Dante - Closer", valor: 3500.00, status: "A Pagar"},
            {nome: "Nathan - SDR", valor: 2000.00, status: "A Pagar"},
            {nome: "João - SDR", valor: 2000.00, status: "A Pagar"}
          ]
        },
        estrutura: {
          total: 10509.00,
          itens: [
            {nome: "Aluguel - Sala", valor: 2800.00, status: "A Pagar"},
            {nome: "Celesc - Energia", valor: 100.00, status: "A Pagar"},
            {nome: "Internet - Claro", valor: 109.00, status: "A Pagar"},
            {nome: "Pagamento - Alpha", valor: 7500.00, status: "A Pagar"}
          ]
        },
        ferramentas: {
          total: 2760.90,
          itens: [
            {nome: "ClickUp", valor: 350.00, status: "A Pagar"},
            {nome: "Claude Code", valor: 500.00, status: "A Pagar"},
            {nome: "CapCut", valor: 65.90, status: "A Pagar"},
            {nome: "Canva Pro", valor: 35.00, status: "A Pagar"},
            {nome: "Criativivo", valor: 100.00, status: "A Pagar"},
            {nome: "Adobe", valor: 110.00, status: "A Pagar"},
            {nome: "Railway Backend", valor: 35.00, status: "A Pagar"},
            {nome: "Netlify - Hospedagem", valor: 35.00, status: "A Pagar"},
            {nome: "Lovable", valor: 130.00, status: "A Pagar"},
            {nome: "Mac Ederson", valor: 1200.00, status: "A Pagar"},
            {nome: "VPS HOSTINGER", valor: 200.00, status: "A Pagar"}
          ]
        }
      }
    }
  }
};

// Função para obter dados de um mês específico
function getDadosMes(ano, mes) {
  const chave = `${ano}-${mes.toString().padStart(2, '0')}`;
  return dadosMensais[chave] || null;
}

// Função para listar meses disponíveis
function getMesesDisponiveis() {
  return Object.keys(dadosMensais).map(chave => {
    const [ano, mes] = chave.split('-');
    return {
      chave: chave,
      ano: parseInt(ano),
      mes: parseInt(mes),
      nome: dadosMensais[chave].periodo
    };
  });
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.dadosMensais = dadosMensais;
  window.getDadosMes = getDadosMes;
  window.getMesesDisponiveis = getMesesDisponiveis;
}
