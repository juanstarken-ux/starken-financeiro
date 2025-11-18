// Dados Mensais Consolidados - Starken Financeiro
// Atualizado: 17/01/2025

const dadosMensais = {
  // OUTUBRO 2025
  "2025-10": {
    periodo: "Outubro 2025",
    receitas: {
      total: 46365.05,
      recebido: 41865.05,
      pendente: 4500.00,
      taxa_recebimento: 90.3,
      clientes: [
        // FRANQUIAS - REPASSES MATRIZ ALPHA
        {nome: "Baruki Beer (Alpha)", valor: 6126.43, status: "Feito", vencimento: "01/10", origem: "Matriz"},
        {nome: "World Burger (Alpha)", valor: 3281.75, status: "Feito", vencimento: "14/10", origem: "Prospecção"},
        {nome: "Pizzaria Madrid (Alpha)", valor: 3149.75, status: "Feito", vencimento: "01/10", origem: "Matriz"},
        {nome: "Oficina da Massa (Alpha)", valor: 2897.77, status: "Feito", vencimento: "31/10", origem: "Matriz"},
        {nome: "Esfiha Rio (Alpha)", valor: 2807.91, status: "Feito", vencimento: "27/10", origem: "Prospecção"},
        {nome: "Bigu's Burger (Alpha)", valor: 2679.40, status: "Feito", vencimento: "31/10", origem: "Matriz"},
        {nome: "Jun Yu Restaurante (Alpha)", valor: 2546.02, status: "Feito", vencimento: "14/10", origem: "Prospecção"},
        {nome: "Oca Restaurante (Alpha)", valor: 1698.01, status: "Feito", vencimento: "27/10", origem: "Matriz"},
        {nome: "Madrugão Lanches (Alpha)", valor: 1698.01, status: "Feito", vencimento: "27/10", origem: "Matriz"},
        // CLIENTES DIRETOS BLUMENAU
        {nome: "Mortadella Blumenau 1/2", valor: 3000.00, status: "Feito", responsavel: "Juan"},
        {nome: "Mortadella Blumenau 2/2", valor: 3000.00, status: "Feito", responsavel: "Juan"},
        {nome: "Brazza BNU 1/2", valor: 1500.00, status: "Feito", responsavel: "Juan"},
        {nome: "Brazza BNU 2/2", valor: 1500.00, status: "Feito", responsavel: "Juan"},
        {nome: "Hamburgueria Feio", valor: 2000.00, status: "Feito", responsavel: "Juan"},
        {nome: "JPR Móveis Rústicos", valor: 2000.00, status: "Feito", responsavel: "Juan"},
        {nome: "Academia São Pedro", valor: 1080.00, status: "Feito", responsavel: "Juan"},
        {nome: "Estilo Tulipa", valor: 500.00, status: "Feito", responsavel: "Juan"},
        {nome: "Shield Car Blumenau", valor: 400.00, status: "Feito", responsavel: "Juan"},
        // A RECEBER
        {nome: "Realizzati Móveis", valor: 2500.00, status: "A Receber", vencimento: "25/11", responsavel: "Juan"},
        {nome: "Alexandria Burger 1/2", valor: 1000.00, status: "A Receber", vencimento: "10/11", responsavel: "Juan"},
        {nome: "Alexandria Burger 2/2", valor: 1000.00, status: "A Receber", vencimento: "20/11", responsavel: "Juan"}
      ]
    },
    despesas: {
      total: 43047.07,
      pago: 43047.07,
      pendente: 0.00,
      categorias: {
        pessoal: {
          total: 16018.70,
          itens: [
            {nome: "Igor - Salário", valor: 2300.00, status: "Feito"},
            {nome: "Eloize - Salário", valor: 3255.00, status: "Feito"},
            {nome: "Ederson - Salário", valor: 3000.00, status: "Feito"},
            {nome: "Victor - Salário", valor: 2700.00, status: "Feito"},
            {nome: "Dante - Closer", valor: 3170.00, status: "Feito"},
            {nome: "Natali - Serviços", valor: 475.00, status: "Feito"},
            {nome: "Equipamento (Mac)", valor: 1118.70, status: "Feito"}
          ]
        },
        locacao_aluguel: {
          total: 11200.00,
          itens: [
            {nome: "Monica - Caução Sala Nova", valor: 8400.00, status: "Feito"},
            {nome: "Monica - Aluguel Novembro", valor: 2800.00, status: "Feito"}
          ]
        },
        adiantamentos: {
          total: 3573.49,
          itens: [
            {nome: "Juan Fernando (sócio)", valor: 3573.49, status: "Feito"}
          ]
        },
        alpha_franquia: {
          total: 5065.00,
          itens: [
            {nome: "Taxas e Repasses Alpha", valor: 5065.00, status: "Feito"}
          ]
        },
        outros: {
          total: 3285.10,
          itens: [
            {nome: "Despesas Diversas", valor: 3285.10, status: "Feito"}
          ]
        },
        ferramentas: {
          total: 1163.79,
          itens: [
            {nome: "ClickUp", valor: 350.00, status: "Feito"},
            {nome: "Claude Code", valor: 500.00, status: "Feito"},
            {nome: "Canva Pro", valor: 35.00, status: "Feito"},
            {nome: "Outros Softwares", valor: 278.79, status: "Feito"}
          ]
        },
        alimentacao: {
          total: 1017.68,
          itens: [
            {nome: "Alimentação Equipe", valor: 1017.68, status: "Feito"}
          ]
        },
        operacionais: {
          total: 1013.74,
          itens: [
            {nome: "Despesas Operacionais", valor: 1013.74, status: "Feito"}
          ]
        },
        combustivel: {
          total: 709.57,
          itens: [
            {nome: "Combustível", valor: 709.57, status: "Feito"}
          ]
        }
      }
    }
  },

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
      total: 28869.90,
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
          total: 11509.00,
          itens: [
            {nome: "Aluguel - Sala", valor: 2800.00, status: "Feito"},
            {nome: "Celesc - Energia", valor: 100.00, status: "A Pagar"},
            {nome: "Internet - Claro", valor: 109.00, status: "A Pagar"},
            {nome: "Pagamento - Alpha", valor: 8500.00, status: "A Pagar"}
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
      total: 32869.90,
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
          total: 11509.00,
          itens: [
            {nome: "Aluguel - Sala", valor: 2800.00, status: "A Pagar"},
            {nome: "Celesc - Energia", valor: 100.00, status: "A Pagar"},
            {nome: "Internet - Claro", valor: 109.00, status: "A Pagar"},
            {nome: "Pagamento - Alpha", valor: 8500.00, status: "A Pagar"}
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
