// Dados Mensais Consolidados - Starken Financeiro
// Atualizado: 29/11/2025

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
        {nome: "Baruki Beer (Alpha)", valor: 6126.43, status: "Feito", origem: "Matriz"},
        {nome: "World Burger (Alpha)", valor: 3281.75, status: "Feito", origem: "TCV", dataContrato: "27/10"},
        {nome: "Pizzaria Madrid (Alpha)", valor: 3149.75, status: "Feito", origem: "TCV"},
        {nome: "Oficina da Massa (Alpha)", valor: 2897.77, status: "Feito", origem: "TCV", dataContrato: "24/10"},
        {nome: "Esfiha Rio (Alpha)", valor: 2807.91, status: "Feito", origem: "Prospecção"},
        {nome: "Bigu's Burger (Alpha)", valor: 2679.40, status: "Feito", origem: "TCV", dataContrato: "27/10"},
        {nome: "Jun Yu Restaurante (Alpha)", valor: 2546.02, status: "Feito", origem: "Prospecção"},
        {nome: "Oca Restaurante (Alpha)", valor: 1698.01, status: "Feito", origem: "Outbound"},
        {nome: "Madrugão Lanches (Alpha)", valor: 1698.01, status: "Feito", origem: "Outbound"},
        {nome: "Mortadella Blumenau 1/2", valor: 3000.00, status: "Feito", empresa: "Starken"},
        {nome: "Mortadella Blumenau 2/2", valor: 3000.00, status: "Feito", empresa: "Starken"},
        {nome: "Brazza BNU 1/2", valor: 1500.00, status: "Feito", empresa: "Starken"},
        {nome: "Brazza BNU 2/2", valor: 1500.00, status: "Feito", empresa: "Starken"},
        {nome: "Hamburgueria Feio", valor: 2000.00, status: "Feito", empresa: "Starken"},
        {nome: "JPR Móveis Rústicos", valor: 2000.00, status: "Feito", empresa: "Starken"},
        {nome: "Academia São Pedro", valor: 1080.00, status: "Feito", empresa: "Starken"},
        {nome: "Estilo Tulipa", valor: 500.00, status: "Feito", empresa: "Starken"},
        {nome: "Shield Car Blumenau", valor: 400.00, status: "Feito", empresa: "Starken"},
        {nome: "Realizzati Móveis", valor: 2500.00, status: "A Receber", empresa: "Starken"},
        {nome: "Alexandria Burger", valor: 2000.00, status: "A Receber", empresa: "Starken"}
      ]
    },
    despesas: {
      total: 43047.07,
      pago: 43047.07,
      pendente: 0.00,
      categorias: {
        pessoal: {
          total: 11155.00,
          itens: [
            {nome: "Igor", valor: 2300.00, status: "Feito", tipo: "Salário"},
            {nome: "Eloize", valor: 3255.00, status: "Feito", tipo: "Salário"},
            {nome: "Ederson", valor: 3000.00, status: "Feito", tipo: "Salário"},
            {nome: "Victor", valor: 2600.00, status: "Feito", tipo: "Salário"}
          ]
        },
        comercial: {
          total: 3170.00,
          itens: [
            {nome: "Dante - Closer", valor: 3170.00, status: "Feito", tipo: "Salário"}
          ]
        },
        servicos: {
          total: 475.00,
          itens: [
            {nome: "Natali", valor: 475.00, status: "Feito", tipo: "Serviço"}
          ]
        },
        locacao_aluguel: {
          total: 11200.00,
          itens: [
            {nome: "Monica - Sala nova (Caução)", valor: 8400.00, status: "Feito", categoria: "Locação"},
            {nome: "Monica - Aluguel Novembro", valor: 2800.00, status: "Feito", categoria: "Locação"}
          ]
        },
        adiantamentos: {
          total: 3573.49,
          itens: [
            {nome: "Juan Fernando (sócio)", valor: 3573.49, status: "Feito", tipo: "Adiantamento"}
          ]
        },
        alpha_franquia: {
          total: 5065.00,
          itens: [
            {nome: "Pagamento - Alpha", valor: 5065.00, status: "Feito", categoria: "Franquia"}
          ]
        },
        outros: {
          total: 3285.10,
          itens: [
            {nome: "Despesas Diversas", valor: 3285.10, status: "Feito", categoria: "Outros"}
          ]
        },
        ferramentas: {
          total: 1163.79,
          itens: [
            {nome: "Softwares e Ferramentas", valor: 1163.79, status: "Feito", categoria: "Ferramentas"}
          ]
        },
        alimentacao: {
          total: 1017.68,
          itens: [
            {nome: "Refeições e Alimentação", valor: 1017.68, status: "Feito", categoria: "Alimentação"}
          ]
        },
        operacionais: {
          total: 1013.74,
          itens: [
            {nome: "Despesas Operacionais", valor: 1013.74, status: "Feito", categoria: "Operacional"}
          ]
        },
        combustivel: {
          total: 709.57,
          itens: [
            {nome: "Combustível e Transporte", valor: 709.57, status: "Feito", categoria: "Combustível"}
          ]
        },
        equipamentos: {
          total: 1118.70,
          itens: [
            {nome: "Investimento Equipamento", valor: 1118.70, status: "Feito", categoria: "Equipamentos"}
          ]
        }
      }
    }
  },

  // NOVEMBRO 2025
  "2025-11": {
    periodo: "Novembro 2025",
    receitas: {
      total: 35768.18,
      recebido: 10924.18,
      pendente: 24844.00,
      taxa_recebimento: 30.5,
      clientes: [
        {nome: "Mortadella Blumenau 1/2", valor: 3000.00, status: "Feito", empresa: "Starken"},
        {nome: "Mortadella Blumenau 2/2", valor: 3000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Hamburgueria Feio", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Academia São Pedro", valor: 1080.00, status: "Feito", empresa: "Starken"},
        {nome: "Estilo Tulipa", valor: 500.00, status: "Feito", empresa: "Starken"},
        {nome: "JPR Móveis Rústicos", valor: 2000.00, status: "Feito", empresa: "Starken"},
        {nome: "Brazza BNU 1/2", valor: 1500.00, status: "Feito", empresa: "Starken"},
        {nome: "Brazza BNU 2/2", valor: 1500.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Realizzati Móveis", valor: 2500.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Suprema Pizza", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Shield Car Blumenau", valor: 297.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Oca Restaurante (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Madrugão Lanches (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Pizzaria Don Chevico (Alpha)", valor: 2844.18, status: "Feito", origem: "TCV", dataContrato: "04/11", empresa: "Alpha"},
        {nome: "Cazza Pizzaria (Alpha)", valor: 2547.00, status: "Feito", origem: "TCV", dataContrato: "12/11", empresa: "Alpha"},
        {nome: "Renomaq", valor: 800.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Alexandria Burger 1/2", valor: 1000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Divino Tempero", valor: 1000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Matriz 1 (Alpha)", valor: 3373.50, status: "A Pagar", empresa: "Alpha"},
        {nome: "Matriz 2 (Alpha)", valor: 3373.50, status: "A Pagar", empresa: "Alpha"}
      ]
    },
    despesas: {
      total: 21360.90,
      pago: 10300.00,
      pendente: 11060.90,
      categorias: {
        pessoal: {
          total: 11100.00,
          itens: [
            {nome: "Igor", valor: 2300.00, status: "Feito", tipo: "Salário"},
            {nome: "Eloize", valor: 3000.00, status: "Feito", tipo: "Salário"},
            {nome: "Ederson", valor: 3000.00, status: "Feito", tipo: "Salário"},
            {nome: "Victor", valor: 2800.00, status: "Feito", tipo: "Salário"}
          ]
        },
        comercial: {
          total: 6000.00,
          itens: [
            {nome: "Dante - Closer", valor: 2500.00, status: "Feito", tipo: "Salário"},
            {nome: "Nathan - SDR", valor: 750.00, status: "A Pagar", tipo: "Comissão"},
            {nome: "João - SDR", valor: 750.00, status: "A Pagar", tipo: "Comissão"},
            {nome: "Nathan", valor: 750.00, status: "Feito", tipo: "Comissão"},
            {nome: "João", valor: 750.00, status: "Feito", tipo: "Comissão"},
            {nome: "Dante - Bonificação", valor: 500.00, status: "A Pagar", tipo: "Bonificação"}
          ]
        },
        estrutura: {
          total: 3009.00,
          itens: [
            {nome: "Aluguel - Sala", valor: 2800.00, status: "Feito", categoria: "Locação"},
            {nome: "Celesc - Energia", valor: 100.00, status: "A Pagar", categoria: "Utilidades"},
            {nome: "Internet - Claro", valor: 109.00, status: "A Pagar", categoria: "Comunicação"}
          ]
        },
        alpha_franquia: {
          total: 7500.00,
          itens: [
            {nome: "Pagamento - Alpha", valor: 7500.00, status: "A Pagar", categoria: "Franquia"}
          ]
        },
        ferramentas: {
          total: 1251.90,
          itens: [
            {nome: "ClickUp", valor: 350.00, status: "A Pagar", categoria: "Gestão"},
            {nome: "Claude Code", valor: 500.00, status: "A Pagar", categoria: "IA/Desenvolvimento"},
            {nome: "Lovable", valor: 130.00, status: "A Pagar", categoria: "Desenvolvimento"},
            {nome: "Adobe", valor: 110.00, status: "A Pagar", categoria: "Design"},
            {nome: "CapCut", valor: 65.90, status: "A Pagar", categoria: "Vídeo"},
            {nome: "Canva Pro", valor: 35.00, status: "A Pagar", categoria: "Design"},
            {nome: "Railway Backend", valor: 35.00, status: "A Pagar", categoria: "Infraestrutura"},
            {nome: "Netlify", valor: 26.00, status: "A Pagar", categoria: "Hospedagem"}
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
        // STARKEN TECNOLOGIA (14 clientes)
        {nome: "Mortadella Blumenau", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Mortadella Tabajara", valor: 0.00, status: "Bônus", empresa: "Starken"},
        {nome: "Hamburgueria Feio", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Academia São Pedro", valor: 1080.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Estilo Tulipa", valor: 659.00, status: "A Pagar", empresa: "Starken"},
        {nome: "JPR Móveis Rústicos", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Realizzati Móveis", valor: 2500.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Suprema Pizza", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Shield Car Blumenau", valor: 297.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Rosa Mexicano Blumenau", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Rosa Mexicano Brusque", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Divino Tempero", valor: 1000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Alexandria Burger", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Dommus Smart Home", valor: 297.00, status: "A Pagar", empresa: "Starken"},
        // ALPHA - MRR
        {nome: "Oca Restaurante (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Outbound", empresa: "Alpha"},
        {nome: "Madrugão Lanches (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Outbound", empresa: "Alpha"},
        {nome: "Saporitto Pizzaria (Alpha)", valor: 1500.00, status: "A Pagar", origem: "Outbound", empresa: "Alpha"},
        {nome: "Fratellis Pizzaria (Alpha)", valor: 2500.00, status: "A Pagar", origem: "Outbound", empresa: "Alpha"},
        {nome: "Brazza Hamburgueria (Alpha)", valor: 3000.00, status: "A Pagar", empresa: "Alpha"},
        // ALPHA - TCV (sem valor mensal)
        {nome: "World Burger (Alpha)", valor: 0.00, status: "TCV", origem: "Matriz TCV", empresa: "Alpha"},
        {nome: "Pizzaria Don Chevico (Alpha)", valor: 0.00, status: "TCV", origem: "Matriz TCV", empresa: "Alpha"},
        {nome: "Oficina da Massa (Alpha)", valor: 0.00, status: "TCV", origem: "Matriz TCV", empresa: "Alpha"},
        {nome: "Bigu's Burger (Alpha)", valor: 0.00, status: "TCV", origem: "Matriz TCV", empresa: "Alpha"},
        {nome: "Pizzaria Madrid (Alpha)", valor: 0.00, status: "TCV", origem: "Matriz TCV", empresa: "Alpha"},
        {nome: "Cazza Pizzaria (Alpha)", valor: 0.00, status: "TCV", origem: "Matriz TCV", empresa: "Alpha"},
        {nome: "Maki Toro Sushi (Alpha)", valor: 0.00, status: "TCV", origem: "Growth Hub", empresa: "Alpha"},
        // NOVOS DEZEMBRO - MRR
        {nome: "Fabinhus Restaurante (Alpha)", valor: 1000.00, status: "A Pagar", origem: "Growth Hub", empresa: "Alpha", novo: true},
        {nome: "Tempero Manero Grill (Alpha)", valor: 1000.00, status: "A Pagar", origem: "Growth Hub", empresa: "Alpha", novo: true},
        {nome: "Super Dupe Hamburgueria BC (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha", novo: true},
        // NOVOS DEZEMBRO - TCV Matriz (3k cada - renovação Março)
        {nome: "Cliente Matriz 1 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true},
        {nome: "Cliente Matriz 2 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true},
        {nome: "Cliente Matriz 3 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true},
        {nome: "Cliente Matriz 4 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true}
      ]
    },
    despesas: {
      total: 21360.90,
      pago: 0.00,
      pendente: 21360.90,
      categorias: {
        pessoal: {
          total: 11100.00,
          itens: [
            {nome: "Ederson", valor: 3200.00, status: "A Pagar", tipo: "Salário", funcao: "Desenvolvedor"},
            {nome: "Victor", valor: 3000.00, status: "A Pagar", tipo: "Salário", funcao: "Desenvolvedor"},
            {nome: "Igor", valor: 2300.00, status: "A Pagar", tipo: "Salário", funcao: "Desenvolvedor"},
            {nome: "Kim", valor: 1300.00, status: "A Pagar", tipo: "Salário", funcao: "Design"},
            {nome: "Erick", valor: 1300.00, status: "A Pagar", tipo: "Salário", funcao: "Desenvolvedor"}
          ]
        },
        comercial: {
          total: 7500.00,
          itens: [
            {nome: "Dante - Closer", valor: 3500.00, status: "A Pagar", tipo: "Salário"},
            {nome: "Nathan - SDR", valor: 2000.00, status: "A Pagar", tipo: "Comissão"},
            {nome: "João - SDR", valor: 2000.00, status: "A Pagar", tipo: "Comissão"}
          ]
        },
        estrutura: {
          total: 3009.00,
          itens: [
            {nome: "Aluguel - Sala", valor: 2800.00, status: "A Pagar", categoria: "Locação"},
            {nome: "Celesc - Energia", valor: 100.00, status: "A Pagar", categoria: "Utilidades"},
            {nome: "Internet - Claro", valor: 109.00, status: "A Pagar", categoria: "Comunicação"}
          ]
        },
        alpha_franquia: {
          total: 7500.00,
          itens: [
            {nome: "Pagamento - Alpha", valor: 7500.00, status: "A Pagar", categoria: "Franquia"}
          ]
        },
        ferramentas: {
          total: 2760.90,
          itens: [
            {nome: "Mac Ederson", valor: 1200.00, status: "A Pagar", categoria: "Equipamento"},
            {nome: "Claude Code", valor: 500.00, status: "A Pagar", categoria: "IA/Desenvolvimento"},
            {nome: "ClickUp", valor: 350.00, status: "A Pagar", categoria: "Gestão"},
            {nome: "VPS Hostinger", valor: 200.00, status: "A Pagar", categoria: "Infraestrutura"},
            {nome: "Lovable", valor: 130.00, status: "A Pagar", categoria: "Desenvolvimento"},
            {nome: "Adobe", valor: 110.00, status: "A Pagar", categoria: "Design"},
            {nome: "Criativivo", valor: 100.00, status: "A Pagar", categoria: "Design"},
            {nome: "CapCut", valor: 65.90, status: "A Pagar", categoria: "Vídeo"},
            {nome: "Canva Pro", valor: 35.00, status: "A Pagar", categoria: "Design"},
            {nome: "Railway Backend", valor: 35.00, status: "A Pagar", categoria: "Infraestrutura"},
            {nome: "Netlify", valor: 35.00, status: "A Pagar", categoria: "Hospedagem"}
          ]
        }
      }
    }
  },

  // JANEIRO 2026
  // Renovações: Bigu's (27/01), Oficina (24/01), Madrid, World Burger → 2k/mês cada
  // Novos TCV: Matriz 5-7 (3k cada) → renovação Abril
  "2026-01": {
    periodo: "Janeiro 2026",
    receitas: {
      total: 53833.00,
      recebido: 0.00,
      pendente: 53833.00,
      taxa_recebimento: 0.0,
      clientes: [
        // STARKEN (14 clientes) - Base: 19.833
        {nome: "Mortadella Blumenau", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Mortadella Tabajara", valor: 0.00, status: "Bônus", empresa: "Starken"},
        {nome: "Hamburgueria Feio", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Academia São Pedro", valor: 1080.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Estilo Tulipa", valor: 659.00, status: "A Pagar", empresa: "Starken"},
        {nome: "JPR Móveis Rústicos", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Realizzati Móveis", valor: 2500.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Suprema Pizza", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Shield Car Blumenau", valor: 297.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Rosa Mexicano Blumenau", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Rosa Mexicano Brusque", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Divino Tempero", valor: 1000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Alexandria Burger", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Dommus Smart Home", valor: 297.00, status: "A Pagar", empresa: "Starken"},
        // ALPHA - MRR Base
        {nome: "Oca Restaurante (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Outbound", empresa: "Alpha"},
        {nome: "Madrugão Lanches (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Outbound", empresa: "Alpha"},
        {nome: "Saporitto Pizzaria (Alpha)", valor: 1500.00, status: "A Pagar", origem: "Outbound", empresa: "Alpha"},
        {nome: "Fratellis Pizzaria (Alpha)", valor: 2500.00, status: "A Pagar", origem: "Outbound", empresa: "Alpha"},
        {nome: "Brazza Hamburgueria (Alpha)", valor: 3000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Fabinhus Restaurante (Alpha)", valor: 1000.00, status: "A Pagar", origem: "Growth Hub", empresa: "Alpha"},
        {nome: "Tempero Manero Grill (Alpha)", valor: 1000.00, status: "A Pagar", origem: "Growth Hub", empresa: "Alpha"},
        {nome: "Super Dupe Hamburgueria BC (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Majo Sushi (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha", novo: true},
        // RENOVAÇÕES JANEIRO (contratos Out → 2k/mês)
        {nome: "Bigu's Burger (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Oficina da Massa (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Pizzaria Madrid (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "World Burger (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        // TCV SEM VALOR (aguardando renovação)
        {nome: "Pizzaria Don Chevico (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Fev", empresa: "Alpha"},
        {nome: "Cazza Pizzaria (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Fev", empresa: "Alpha"},
        {nome: "Maki Toro Sushi (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Mar", empresa: "Alpha"},
        {nome: "Cliente Matriz 1 (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Mar", empresa: "Alpha"},
        {nome: "Cliente Matriz 2 (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Mar", empresa: "Alpha"},
        {nome: "Cliente Matriz 3 (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Mar", empresa: "Alpha"},
        {nome: "Cliente Matriz 4 (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Mar", empresa: "Alpha"},
        // NOVOS TCV JANEIRO (Matriz 5-7) - 3k cada
        {nome: "Cliente Matriz 5 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true},
        {nome: "Cliente Matriz 6 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true},
        {nome: "Cliente Matriz 7 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true}
      ]
    },
    despesas: {
      total: 31869.90,
      pago: 0.00,
      pendente: 31869.90,
      categorias: {
        pessoal: {
          total: 11100.00,
          itens: [
            {nome: "Ederson", valor: 3200.00, status: "A Pagar", tipo: "Salário", funcao: "Desenvolvedor"},
            {nome: "Victor", valor: 3000.00, status: "A Pagar", tipo: "Salário", funcao: "Desenvolvedor"},
            {nome: "Igor", valor: 2300.00, status: "A Pagar", tipo: "Salário", funcao: "Desenvolvedor"},
            {nome: "Kim", valor: 1300.00, status: "A Pagar", tipo: "Salário", funcao: "Design"},
            {nome: "Erick", valor: 1300.00, status: "A Pagar", tipo: "Salário", funcao: "Desenvolvedor"}
          ]
        },
        comercial: {
          total: 7500.00,
          itens: [
            {nome: "Dante - Closer", valor: 3500.00, status: "A Pagar", tipo: "Salário"},
            {nome: "Nathan - SDR", valor: 2000.00, status: "A Pagar", tipo: "Comissão"},
            {nome: "João - SDR", valor: 2000.00, status: "A Pagar", tipo: "Comissão"}
          ]
        },
        estrutura: {
          total: 3009.00,
          itens: [
            {nome: "Aluguel - Sala", valor: 2800.00, status: "A Pagar", categoria: "Locação"},
            {nome: "Celesc - Energia", valor: 100.00, status: "A Pagar", categoria: "Utilidades"},
            {nome: "Internet - Claro", valor: 109.00, status: "A Pagar", categoria: "Comunicação"}
          ]
        },
        alpha_franquia: {
          total: 7500.00,
          itens: [
            {nome: "Pagamento - Alpha", valor: 7500.00, status: "A Pagar", categoria: "Franquia"}
          ]
        },
        ferramentas: {
          total: 2760.90,
          itens: [
            {nome: "Claude Code", valor: 500.00, status: "A Pagar", categoria: "IA/Desenvolvimento"},
            {nome: "ClickUp", valor: 350.00, status: "A Pagar", categoria: "Gestão"},
            {nome: "VPS Hostinger", valor: 200.00, status: "A Pagar", categoria: "Infraestrutura"},
            {nome: "Lovable", valor: 130.00, status: "A Pagar", categoria: "Desenvolvimento"},
            {nome: "Adobe", valor: 110.00, status: "A Pagar", categoria: "Design"},
            {nome: "Criativivo", valor: 100.00, status: "A Pagar", categoria: "Design"},
            {nome: "CapCut", valor: 65.90, status: "A Pagar", categoria: "Vídeo"},
            {nome: "Canva Pro", valor: 35.00, status: "A Pagar", categoria: "Design"},
            {nome: "Railway Backend", valor: 35.00, status: "A Pagar", categoria: "Infraestrutura"},
            {nome: "Netlify", valor: 35.00, status: "A Pagar", categoria: "Hospedagem"}
          ]
        }
      }
    }
  },

  // FEVEREIRO 2026
  // Renovações: Don Chevico (04/02), Cazza (12/02) → 2k/mês cada
  // Novos TCV: Matriz 8-10 (3k cada) → renovação Maio
  "2026-02": {
    periodo: "Fevereiro 2026",
    receitas: {
      total: 56833.00,
      recebido: 0.00,
      pendente: 56833.00,
      taxa_recebimento: 0.0,
      clientes: [
        // STARKEN (14) - 19.833
        {nome: "Mortadella Blumenau", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Mortadella Tabajara", valor: 0.00, status: "Bônus", empresa: "Starken"},
        {nome: "Hamburgueria Feio", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Academia São Pedro", valor: 1080.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Estilo Tulipa", valor: 659.00, status: "A Pagar", empresa: "Starken"},
        {nome: "JPR Móveis Rústicos", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Realizzati Móveis", valor: 2500.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Suprema Pizza", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Shield Car Blumenau", valor: 297.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Rosa Mexicano Blumenau", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Rosa Mexicano Brusque", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Divino Tempero", valor: 1000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Alexandria Burger", valor: 2000.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Dommus Smart Home", valor: 297.00, status: "A Pagar", empresa: "Starken"},
        // ALPHA MRR Base + Renovações anteriores
        {nome: "Oca Restaurante (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Madrugão Lanches (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Saporitto Pizzaria (Alpha)", valor: 1500.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Fratellis Pizzaria (Alpha)", valor: 2500.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Brazza Hamburgueria (Alpha)", valor: 3000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Fabinhus Restaurante (Alpha)", valor: 1000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Tempero Manero Grill (Alpha)", valor: 1000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Super Dupe Hamburgueria BC (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Majo Sushi (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Bigu's Burger (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Oficina da Massa (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Pizzaria Madrid (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "World Burger (Alpha)", valor: 2000.00, status: "A Pagar", empresa: "Alpha"},
        // RENOVAÇÕES FEVEREIRO
        {nome: "Pizzaria Don Chevico (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cazza Pizzaria (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        // TCV aguardando
        {nome: "Maki Toro Sushi (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Mar", empresa: "Alpha"},
        {nome: "Cliente Matriz 1-4 (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Mar", empresa: "Alpha"},
        {nome: "Cliente Matriz 5-7 (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Abr", empresa: "Alpha"},
        // NOVOS TCV FEVEREIRO (Matriz 8-10)
        {nome: "Cliente Matriz 8 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true},
        {nome: "Cliente Matriz 9 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true},
        {nome: "Cliente Matriz 10 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true}
      ]
    },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },

  // MARÇO 2026
  // Renovações: Maki Toro, Matriz 1-4 → 2k/mês cada (5 clientes = 10k)
  // Novos TCV: Matriz 11-13 (3k cada) → renovação Junho
  "2026-03": {
    periodo: "Março 2026",
    receitas: {
      total: 72833.00,
      recebido: 0.00,
      pendente: 72833.00,
      taxa_recebimento: 0.0,
      clientes: [
        // STARKEN (14) - 19.833
        {nome: "Starken Base (14 clientes)", valor: 19833.00, status: "A Pagar", empresa: "Starken"},
        // ALPHA MRR Acumulado
        {nome: "Alpha MRR Base (13 clientes)", valor: 25000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Alpha Renovações Jan (4)", valor: 8000.00, status: "A Pagar", empresa: "Alpha"},
        {nome: "Alpha Renovações Fev (2)", valor: 4000.00, status: "A Pagar", empresa: "Alpha"},
        // RENOVAÇÕES MARÇO (Maki Toro + Matriz 1-4)
        {nome: "Maki Toro Sushi (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 1 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 2 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 3 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 4 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        // TCV aguardando
        {nome: "Cliente Matriz 5-7 (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Abr", empresa: "Alpha"},
        {nome: "Cliente Matriz 8-10 (Alpha)", valor: 0.00, status: "TCV", origem: "Aguardando Mai", empresa: "Alpha"},
        // NOVOS TCV MARÇO (Matriz 11-13)
        {nome: "Cliente Matriz 11 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true},
        {nome: "Cliente Matriz 12 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true},
        {nome: "Cliente Matriz 13 (Alpha)", valor: 3000.00, status: "A Pagar", origem: "Matriz TCV", empresa: "Alpha", novo: true}
      ]
    },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },

  // ABRIL 2026
  // Renovações: Matriz 5-7 → 2k/mês cada (3 clientes = 6k)
  "2026-04": {
    periodo: "Abril 2026",
    receitas: {
      total: 78833.00,
      recebido: 0.00,
      pendente: 78833.00,
      taxa_recebimento: 0.0,
      clientes: [
        {nome: "Starken Base (14 clientes)", valor: 19833.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Alpha MRR Acumulado", valor: 53000.00, status: "A Pagar", empresa: "Alpha"},
        // RENOVAÇÕES ABRIL (Matriz 5-7)
        {nome: "Cliente Matriz 5 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 6 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 7 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true}
      ]
    },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },

  // MAIO 2026
  // Renovações: Matriz 8-10 → 2k/mês cada (3 clientes = 6k)
  "2026-05": {
    periodo: "Maio 2026",
    receitas: {
      total: 84833.00,
      recebido: 0.00,
      pendente: 84833.00,
      taxa_recebimento: 0.0,
      clientes: [
        {nome: "Starken Base (14 clientes)", valor: 19833.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Alpha MRR Acumulado", valor: 59000.00, status: "A Pagar", empresa: "Alpha"},
        // RENOVAÇÕES MAIO (Matriz 8-10)
        {nome: "Cliente Matriz 8 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 9 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 10 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true}
      ]
    },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },

  // JUNHO 2026
  // Renovações: Matriz 11-13 → 2k/mês cada (3 clientes = 6k)
  "2026-06": {
    periodo: "Junho 2026",
    receitas: {
      total: 90833.00,
      recebido: 0.00,
      pendente: 90833.00,
      taxa_recebimento: 0.0,
      clientes: [
        {nome: "Starken Base (14 clientes)", valor: 19833.00, status: "A Pagar", empresa: "Starken"},
        {nome: "Alpha MRR Acumulado", valor: 65000.00, status: "A Pagar", empresa: "Alpha"},
        // RENOVAÇÕES JUNHO (Matriz 11-13)
        {nome: "Cliente Matriz 11 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 12 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true},
        {nome: "Cliente Matriz 13 (Alpha)", valor: 2000.00, status: "A Pagar", origem: "Renovação MRR", empresa: "Alpha", renovacao: true}
      ]
    },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },

  // JULHO - DEZEMBRO 2026 (MRR estabilizado)
  "2026-07": {
    periodo: "Julho 2026",
    receitas: { total: 90833.00, recebido: 0.00, pendente: 90833.00, taxa_recebimento: 0.0, clientes: [] },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },
  "2026-08": {
    periodo: "Agosto 2026",
    receitas: { total: 90833.00, recebido: 0.00, pendente: 90833.00, taxa_recebimento: 0.0, clientes: [] },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },
  "2026-09": {
    periodo: "Setembro 2026",
    receitas: { total: 90833.00, recebido: 0.00, pendente: 90833.00, taxa_recebimento: 0.0, clientes: [] },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },
  "2026-10": {
    periodo: "Outubro 2026",
    receitas: { total: 90833.00, recebido: 0.00, pendente: 90833.00, taxa_recebimento: 0.0, clientes: [] },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },
  "2026-11": {
    periodo: "Novembro 2026",
    receitas: { total: 90833.00, recebido: 0.00, pendente: 90833.00, taxa_recebimento: 0.0, clientes: [] },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
  },
  "2026-12": {
    periodo: "Dezembro 2026",
    receitas: { total: 90833.00, recebido: 0.00, pendente: 90833.00, taxa_recebimento: 0.0, clientes: [] },
    despesas: { total: 35869.90, pago: 0.00, pendente: 35869.90, categorias: {} }
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
