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

// ============================================
// DADOS FINANCEIROS CONSOLIDADOS
// ============================================
const dadosFinanceiros = {
  "2025-10": {
    periodo: "Outubro 2025",
    receitas: { total: 46365.05, recebido: 41865.05, pendente: 4500.00 },
    despesas: { total: 43047.07, pago: 43047.07, pendente: 0 },
    lucro: 3317.98,
    margem: 7.2
  },
  "2025-11": {
    periodo: "Novembro 2025",
    receitas: { total: 35768.18, recebido: 10924.18, pendente: 24844.00 },
    despesas: { total: 28500.00, pago: 15000.00, pendente: 13500.00 },
    lucro: 7268.18,
    margem: 20.3
  },
  "2025-12": {
    periodo: "Dezembro 2025",
    receitas: {
      total: 54982.75,
      starken: 29833.00,
      alpha: 25149.75,
      clientes_starken: [
        { nome: "Bengers - App Festival", valor: 10000, status: "A Receber", tipo: "Projeto" },
        { nome: "Mortadella Blumenau", valor: 2000, status: "A Receber" },
        { nome: "Hamburgueria Feio", valor: 2000, status: "A Receber" },
        { nome: "Academia São Pedro", valor: 1080, status: "A Receber" },
        { nome: "Estilo Tulipa", valor: 659, status: "A Receber" },
        { nome: "JPR Móveis Rústicos", valor: 2000, status: "A Receber" },
        { nome: "Realizzati Móveis", valor: 2500, status: "A Receber" },
        { nome: "Suprema Pizza", valor: 2000, status: "A Receber" },
        { nome: "Shield Car Blumenau", valor: 297, status: "A Receber" },
        { nome: "Rosa Mexicano Blumenau", valor: 2000, status: "A Receber" },
        { nome: "Rosa Mexicano Brusque", valor: 2000, status: "A Receber" },
        { nome: "Divino Tempero", valor: 1000, status: "A Receber" },
        { nome: "Alexandria Burger", valor: 2000, status: "A Receber" },
        { nome: "Dommus Smart Home", valor: 297, status: "A Receber" }
      ],
      clientes_alpha_mrr: [
        { nome: "Oca Restaurante", valor: 2000, status: "A Receber", origem: "Outbound" },
        { nome: "Madrugão Lanches", valor: 2000, status: "A Receber", origem: "Outbound" },
        { nome: "Saporitto Pizzaria", valor: 1500, status: "A Receber", origem: "Outbound" },
        { nome: "Fratellis Pizzaria", valor: 2500, status: "A Receber", origem: "Outbound" },
        { nome: "Brazza Hamburgueria", valor: 3000, status: "A Receber" },
        { nome: "Fabinhus Restaurante", valor: 1000, status: "A Receber", novo: true },
        { nome: "Tempero Manero Grill", valor: 1000, status: "A Receber", novo: true },
        { nome: "Super Dupe Hamburgueria BC", valor: 2000, status: "A Receber", novo: true }
      ],
      clientes_alpha_tcv: [
        { nome: "Churrascaria Paiaguas", valor: 3149.75, status: "Recebido", tcv: 7500, novo: true }
      ]
    },
    despesas: {
      total: 31869.90,
      categorias: {
        pessoal: {
          total: 11100,
          itens: [
            { nome: "Ederson", valor: 3200, funcao: "Desenvolvedor" },
            { nome: "Victor", valor: 3000, funcao: "Desenvolvedor" },
            { nome: "Igor", valor: 2300, funcao: "Desenvolvedor" },
            { nome: "Kim", valor: 1300, funcao: "Design" },
            { nome: "Erick", valor: 1300, funcao: "Desenvolvedor" }
          ]
        },
        comercial: {
          total: 7500,
          itens: [
            { nome: "Dante - Closer", valor: 3500 },
            { nome: "Nathan - SDR", valor: 2000 },
            { nome: "João - SDR", valor: 2000 }
          ]
        },
        estrutura: {
          total: 3009,
          itens: [
            { nome: "Aluguel - Sala", valor: 2800 },
            { nome: "Celesc - Energia", valor: 100 },
            { nome: "Internet - Claro", valor: 109 }
          ]
        },
        alpha_franquia: { total: 7500 },
        ferramentas: {
          total: 2760.90,
          itens: [
            { nome: "Mac Ederson", valor: 1200 },
            { nome: "Claude Code", valor: 500 },
            { nome: "ClickUp", valor: 350 },
            { nome: "VPS Hostinger", valor: 200 },
            { nome: "Lovable", valor: 130 },
            { nome: "Adobe", valor: 110 },
            { nome: "Criativivo", valor: 100 },
            { nome: "CapCut", valor: 65.90 },
            { nome: "Canva Pro", valor: 35 },
            { nome: "Railway", valor: 35 },
            { nome: "Netlify", valor: 35 }
          ]
        }
      }
    },
    resultado: {
      lucro: 23112.85,
      margem: 42.0
    }
  },
  "2026-01": {
    periodo: "Janeiro 2026",
    projecao: true,
    receitas: { total: 62000, starken: 32000, alpha: 30000 },
    despesas: { total: 35000 },
    lucro: 27000,
    margem: 43.5
  }
};

// Equipe atual
const equipe = {
  desenvolvimento: ["Ederson (Sênior)", "Victor", "Igor", "Erick"],
  design: ["Kim"],
  comercial: ["Dante (Closer)", "Nathan (SDR)", "João (SDR)"],
  ceo: "Juan Fernando Minni"
};

// Clientes ativos
const clientesAtivos = {
  starken: 14,
  alpha_mrr: 8,
  alpha_tcv: 7,
  total: 29
};

// ============================================
// SYSTEM PROMPT - PERSONALIDADE DO STARK
// ============================================
const SYSTEM_PROMPT = `Você é o STARK, o CFO Virtual da Starken Tecnologia. Você foi criado pelo Juan para ser o braço direito dele na gestão financeira E também um consultor técnico do sistema.

## SUA PERSONALIDADE
Você fala como o Juan falaria - direto, prático, sem enrolação. Use um tom informal mas profissional. Você é parceiro do Juan, não um robô corporativo.

Exemplos de como você fala:
- "Cara, dezembro tá bem tranquilo" ao invés de "O mês de dezembro apresenta indicadores positivos"
- "Temos R$ 54.982 pra entrar" ao invés de "O total de receitas previstas é de R$ 54.982,00"
- "A Alpha tá crescendo bem, já são 15 clientes" ao invés de "O segmento Alpha apresenta crescimento com 15 clientes ativos"

## CONTEXTO DA STARKEN
A Starken Tecnologia é uma empresa de tecnologia e marketing digital de Blumenau/SC, fundada pelo Juan. Temos duas linhas de negócio:

1. **STARKEN TECNOLOGIA** (100% nossa)
   - Desenvolvimento web, apps, marketing digital
   - 14 clientes ativos
   - MRR atual: ~R$ 30k
   - Principais: Bengers, Mortadella, Rosa Mexicano, Hamburgueria Feio

2. **ALPHA PROJECT** (Franquia - 15% royalties)
   - Marketing para restaurantes
   - Modelo: fechamos clientes, Alpha cobra 15% de royalties
   - Clientes Outbound (MRR): Oca, Madrugão, Saporitto, Fratellis
   - Clientes TCV (projetos): Don Chevico, World Burger, Pizzaria Madrid
   - Crescendo rápido: de 8 para 15 clientes em 2 meses

## EQUIPE ATUAL
- **Desenvolvimento**: Ederson (sênior, R$ 3.200), Victor (R$ 3.000), Igor (R$ 2.300), Erick (R$ 1.300)
- **Design**: Kim (R$ 1.300)
- **Comercial**: Dante (Closer, R$ 3.500), Nathan (SDR, R$ 2.000), João (SDR, R$ 2.000)
- **CEO**: Juan Fernando Minni

## DESPESAS FIXAS MENSAIS
- Salários equipe: ~R$ 18.600
- Aluguel sala: R$ 2.800
- Ferramentas (Claude, ClickUp, Adobe, etc): ~R$ 2.700
- Repasse Alpha (royalties): ~R$ 7.500
- **Total fixo: ~R$ 32k/mês**

## ARQUITETURA TÉCNICA DO SISTEMA

### Stack Tecnológica
- **Frontend**: HTML5, CSS3, JavaScript ES6+, Chart.js 4.4.0
- **Backend**: Netlify Functions (Serverless Node.js)
- **Banco de Dados**: PostgreSQL (Railway)
- **ORM**: Prisma 5.7.0
- **IA**: Claude API (Anthropic SDK)
- **Deploy**: Netlify (https://starkentecnologia-performance.netlify.app)

### Estrutura do Projeto
\`\`\`
starken-financeiro/
├── index.html                 # Dashboard principal financeiro
├── login.html                 # Autenticação por senha
├── auth.js                    # Controle de acesso (CEO, sócio, funcionário)
├── theme.js                   # Tema claro/escuro + menu expansível
├── dados-mensais.js           # Dados financeiros por mês
├── gestao-financeira.js       # Lógica de contas pagar/receber
├── notifications.js           # Sistema de alertas
├── pages/
│   ├── stark.html             # Interface do CFO Virtual (eu!)
│   ├── contas-pagar.html      # Gestão de despesas + Kanban
│   ├── contas-receber.html    # Gestão de receitas + Kanban
│   ├── fluxo-caixa.html       # Projeção de caixa
│   ├── dre.html               # Demonstração de Resultado
│   ├── analiticos.html        # KPIs e métricas
│   ├── relatorios.html        # Relatórios automáticos
│   └── dashboard-comercial.html # Pipeline comercial
├── netlify/functions/
│   ├── agent.js               # Eu (STARK) - CFO Virtual
│   ├── alerts.js              # API de alertas
│   ├── reports.js             # API de relatórios
│   └── sync-data.js           # Sincronização com banco
└── prisma/schema.prisma       # Schema do banco
\`\`\`

### Schema do Banco de Dados (PostgreSQL)
\`\`\`prisma
model PaymentStatus {
  id, mes, tipo, itemNome, status, dataPagamento
  // Rastreia status de cada pagamento (Pago/A Pagar/Recebido/A Receber)
}

model CustomItem {
  id, mes, tipo, nome, valor, categoria, status, vencimento
  // Itens adicionados manualmente pelo usuário
}

model DeletedItem {
  id, mes, tipo, itemNome
  // Itens removidos da visualização
}

model EditedItem {
  id, mes, tipo, itemNome, novoNome, novoValor
  // Itens editados pelo usuário
}
\`\`\`

### APIs Disponíveis
- **POST /agent** - Conversar comigo (STARK)
- **GET /alerts** - Buscar alertas ativos
- **GET /reports?tipo=** - Gerar relatórios (executivo, dre, projecao, segmento)
- **POST /api/sync-data** - Sincronizar dados com banco

### Funcionalidades do Sistema
1. **Dashboard Financeiro** - KPIs, gráficos, evolução mensal
2. **Gestão de Contas** - Kanban drag-and-drop, status de pagamentos
3. **STARK (CFO Virtual)** - Consultas em linguagem natural
4. **Alertas Proativos** - Vencimentos, anomalias, fluxo de caixa
5. **Relatórios Automáticos** - DRE, Executivo, Projeções
6. **Controle de Acesso** - Níveis CEO/Sócio/Funcionário
7. **Tema Claro/Escuro** - Preferência salva no localStorage

### Design System
- Cores: Verde Starken (#4A6B54), Secundário (#7A9B84)
- Tipografia: -apple-system, BlinkMacSystemFont, 'Segoe UI'
- Cards com sombra suave e cantos arredondados (12px)
- Responsivo para mobile

## DADOS FINANCEIROS ATUAIS (Dezembro 2025)
${JSON.stringify(dadosFinanceiros["2025-12"], null, 2)}

## COMO RESPONDER
1. Seja direto e prático como o Juan
2. Use números reais - você tem acesso aos dados
3. Dê insights, não só números
4. Se algo tá bom, fala que tá bom. Se tá ruim, avisa
5. Sugira ações quando fizer sentido
6. Use R$ e formato brasileiro (1.234,56)
7. Se perguntarem sobre o sistema técnico, você conhece a arquitetura completa

## FERRAMENTAS DISPONÍVEIS
Você tem acesso a tools para consultar dados. Use-as quando precisar de dados específicos.

## REGRAS
- Sempre responda em português brasileiro
- Seja conciso mas completo
- Arredonde valores para facilitar (R$ 54.982,75 → "quase R$ 55k")
- Identifique tendências e padrões
- Você conhece tanto finanças quanto a arquitetura técnica do sistema`;

// ============================================
// TOOLS DISPONÍVEIS
// ============================================
const tools = [
  {
    name: 'get_resumo_mes',
    description: 'Retorna o resumo financeiro completo de um mês específico',
    input_schema: {
      type: 'object',
      properties: {
        mes: {
          type: 'string',
          description: 'Mês no formato YYYY-MM (ex: 2025-12). Se não informado, usa dezembro 2025.'
        }
      }
    }
  },
  {
    name: 'get_receitas_detalhadas',
    description: 'Lista todas as receitas de um mês com detalhes por cliente',
    input_schema: {
      type: 'object',
      properties: {
        mes: { type: 'string' },
        empresa: { type: 'string', enum: ['starken', 'alpha', 'todas'] }
      }
    }
  },
  {
    name: 'get_despesas_detalhadas',
    description: 'Lista todas as despesas de um mês por categoria',
    input_schema: {
      type: 'object',
      properties: {
        mes: { type: 'string' }
      }
    }
  },
  {
    name: 'get_comparativo',
    description: 'Compara dois meses ou compara Starken vs Alpha',
    input_schema: {
      type: 'object',
      properties: {
        tipo: { type: 'string', enum: ['meses', 'empresas'] },
        mes1: { type: 'string' },
        mes2: { type: 'string' }
      }
    }
  },
  {
    name: 'get_clientes_status',
    description: 'Retorna status dos clientes (ativos, novos, inativos)',
    input_schema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_projecao',
    description: 'Retorna projeção financeira para os próximos meses',
    input_schema: {
      type: 'object',
      properties: {
        meses: { type: 'number', description: 'Quantidade de meses para projetar (1-6)' }
      }
    }
  },
  {
    name: 'get_alertas',
    description: 'Retorna alertas ativos do sistema (vencimentos, contas atrasadas, anomalias)',
    input_schema: {
      type: 'object',
      properties: {
        prioridade: { type: 'string', enum: ['alta', 'media', 'todas'], description: 'Filtrar por prioridade' }
      }
    }
  }
];

// ============================================
// IMPLEMENTAÇÃO DAS TOOLS
// ============================================
async function getResumoMes({ mes = '2025-12' }) {
  const dados = dadosFinanceiros[mes];
  if (!dados) {
    return { erro: `Não tenho dados para ${mes}. Meses disponíveis: ${Object.keys(dadosFinanceiros).join(', ')}` };
  }

  // Buscar dados atualizados do banco
  const statusData = await prisma.paymentStatus.findMany({ where: { mes } });
  const customItems = await prisma.customItem.findMany({ where: { mes } });

  // Calcular recebido/pago baseado no banco
  let recebido = 0;
  let pago = 0;
  statusData.forEach(item => {
    if (item.tipo === 'receita' && item.status === 'Recebido') recebido++;
    if (item.tipo === 'despesa' && item.status === 'Pago') pago++;
  });

  return {
    mes,
    periodo: dados.periodo,
    projecao: dados.projecao || false,
    receitas: dados.receitas,
    despesas: dados.despesas,
    resultado: dados.resultado || { lucro: dados.lucro, margem: dados.margem },
    status_banco: {
      itens_atualizados: statusData.length,
      itens_customizados: customItems.length
    }
  };
}

async function getReceitasDetalhadas({ mes = '2025-12', empresa = 'todas' }) {
  const dados = dadosFinanceiros[mes];
  if (!dados) return { erro: 'Mês não encontrado' };

  const receitas = dados.receitas;
  let resultado = {
    mes,
    total: receitas.total,
    starken: receitas.starken || 0,
    alpha: receitas.alpha || 0
  };

  if (empresa === 'starken' || empresa === 'todas') {
    resultado.clientes_starken = receitas.clientes_starken || [];
  }
  if (empresa === 'alpha' || empresa === 'todas') {
    resultado.clientes_alpha_mrr = receitas.clientes_alpha_mrr || [];
    resultado.clientes_alpha_tcv = receitas.clientes_alpha_tcv || [];
  }

  return resultado;
}

async function getDespesasDetalhadas({ mes = '2025-12' }) {
  const dados = dadosFinanceiros[mes];
  if (!dados) return { erro: 'Mês não encontrado' };

  return {
    mes,
    total: dados.despesas.total,
    categorias: dados.despesas.categorias
  };
}

async function getComparativo({ tipo = 'meses', mes1 = '2025-11', mes2 = '2025-12' }) {
  if (tipo === 'meses') {
    const d1 = dadosFinanceiros[mes1];
    const d2 = dadosFinanceiros[mes2];
    if (!d1 || !d2) return { erro: 'Um dos meses não foi encontrado' };

    const varReceita = ((d2.receitas.total - d1.receitas.total) / d1.receitas.total * 100).toFixed(1);
    const varDespesa = ((d2.despesas.total - d1.despesas.total) / d1.despesas.total * 100).toFixed(1);

    return {
      tipo: 'comparativo_meses',
      [mes1]: { receitas: d1.receitas.total, despesas: d1.despesas.total, lucro: d1.lucro || d1.resultado?.lucro },
      [mes2]: { receitas: d2.receitas.total, despesas: d2.despesas.total, lucro: d2.lucro || d2.resultado?.lucro },
      variacao: {
        receitas: `${varReceita}%`,
        despesas: `${varDespesa}%`
      }
    };
  } else {
    // Comparativo Starken vs Alpha
    const dados = dadosFinanceiros['2025-12'];
    const totalGeral = dados.receitas.total;

    return {
      tipo: 'comparativo_empresas',
      mes: '2025-12',
      starken: {
        receita: dados.receitas.starken,
        participacao: ((dados.receitas.starken / totalGeral) * 100).toFixed(1) + '%',
        clientes: 14,
        margem: '100% (sem repasse)'
      },
      alpha: {
        receita_bruta: dados.receitas.alpha,
        royalties: dados.receitas.alpha * 0.15,
        receita_liquida: dados.receitas.alpha * 0.85,
        participacao: ((dados.receitas.alpha / totalGeral) * 100).toFixed(1) + '%',
        clientes: 15,
        margem: '85% (após royalties)'
      },
      total_geral: totalGeral
    };
  }
}

async function getClientesStatus() {
  return {
    total_clientes: 29,
    starken: {
      ativos: 14,
      principais: ['Bengers', 'Mortadella', 'Rosa Mexicano', 'Hamburgueria Feio', 'JPR Móveis']
    },
    alpha: {
      mrr: 8,
      tcv: 7,
      novos_dezembro: ['Fabinhus', 'Tempero Manero', 'Super Dupe', 'Churrascaria Paiaguas'],
      crescimento: '+7 clientes nos últimos 2 meses'
    }
  };
}

async function getProjecao({ meses = 3 }) {
  const projecoes = [];
  const mesesFuturos = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'];

  for (let i = 0; i < Math.min(meses, 6); i++) {
    const mes = mesesFuturos[i];
    const dados = dadosFinanceiros[mes];
    if (dados) {
      projecoes.push({
        mes,
        periodo: dados.periodo,
        receitas: dados.receitas.total,
        despesas: dados.despesas.total,
        lucro: dados.lucro,
        margem: dados.margem + '%'
      });
    } else {
      // Projeção baseada em crescimento
      const baseReceitaStarken = 32000;
      const baseReceitaAlpha = 30000 + (i * 5000); // Crescimento Alpha
      const baseDespesa = 35000 + (i * 1000);
      const receita = baseReceitaStarken + baseReceitaAlpha;
      projecoes.push({
        mes,
        projecao_estimada: true,
        receitas: receita,
        despesas: baseDespesa,
        lucro: receita - baseDespesa,
        margem: (((receita - baseDespesa) / receita) * 100).toFixed(1) + '%'
      });
    }
  }

  return {
    projecoes,
    observacao: 'A Alpha está crescendo ~5 clientes/mês, o que projeta aumento significativo no MRR'
  };
}

// Função para calcular dias até vencimento
function calcularDiasAteVencimento(dataVencimento) {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const vencimento = new Date(dataVencimento);
  vencimento.setHours(0, 0, 0, 0);
  const diffTime = vencimento - hoje;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

async function getAlertas({ prioridade = 'todas' }) {
  const alertas = [];
  const dados = dadosFinanceiros['2025-12'];

  // Simular vencimentos (na prática viriam de dados reais)
  const vencimentos = [
    { tipo: 'despesa', nome: 'Salários Equipe', valor: 11100, vencimento: '2025-12-05' },
    { tipo: 'despesa', nome: 'Dante - Closer', valor: 3500, vencimento: '2025-12-05' },
    { tipo: 'despesa', nome: 'Aluguel Sala', valor: 2800, vencimento: '2025-12-10' },
    { tipo: 'receita', nome: 'Bengers - App Festival', valor: 10000, vencimento: '2025-12-15' },
    { tipo: 'receita', nome: 'Mortadella Blumenau', valor: 2000, vencimento: '2025-12-10' }
  ];

  vencimentos.forEach(item => {
    const dias = calcularDiasAteVencimento(item.vencimento);

    if (dias < 0) {
      alertas.push({
        prioridade: 'alta',
        tipo: 'vencido',
        categoria: item.tipo,
        titulo: `${item.tipo === 'despesa' ? 'Conta atrasada' : 'Pagamento atrasado'}: ${item.nome}`,
        descricao: `R$ ${item.valor.toLocaleString('pt-BR')} venceu há ${Math.abs(dias)} dias`,
        valor: item.valor,
        diasAtraso: Math.abs(dias)
      });
    } else if (dias === 0) {
      alertas.push({
        prioridade: 'alta',
        tipo: 'hoje',
        categoria: item.tipo,
        titulo: `Vence HOJE: ${item.nome}`,
        descricao: `R$ ${item.valor.toLocaleString('pt-BR')} ${item.tipo === 'despesa' ? 'a pagar' : 'a receber'}`,
        valor: item.valor
      });
    } else if (dias <= 3) {
      alertas.push({
        prioridade: 'media',
        tipo: 'proximo',
        categoria: item.tipo,
        titulo: `Vence em ${dias} dias: ${item.nome}`,
        descricao: `R$ ${item.valor.toLocaleString('pt-BR')} ${item.tipo === 'despesa' ? 'a pagar' : 'a receber'}`,
        valor: item.valor,
        diasRestantes: dias
      });
    }
  });

  // Alertas sobre saúde financeira
  const margem = dados.resultado.margem;
  if (margem >= 40) {
    alertas.push({
      prioridade: 'info',
      tipo: 'positivo',
      categoria: 'saude',
      titulo: 'Margem excelente!',
      descricao: `Margem de ${margem}% - acima da meta de 30%`
    });
  }

  // Alerta de crescimento Alpha
  alertas.push({
    prioridade: 'info',
    tipo: 'crescimento',
    categoria: 'alpha',
    titulo: 'Alpha em crescimento acelerado',
    descricao: '15 clientes ativos - crescendo ~5/mês'
  });

  // Filtrar por prioridade se necessário
  if (prioridade !== 'todas') {
    return {
      alertas: alertas.filter(a => a.prioridade === prioridade),
      total: alertas.length,
      filtro: prioridade
    };
  }

  return {
    alertas,
    total: alertas.length,
    resumo: {
      alta: alertas.filter(a => a.prioridade === 'alta').length,
      media: alertas.filter(a => a.prioridade === 'media').length,
      info: alertas.filter(a => a.prioridade === 'info').length
    }
  };
}

// Executar tool
async function executeTool(name, input) {
  switch (name) {
    case 'get_resumo_mes': return await getResumoMes(input);
    case 'get_receitas_detalhadas': return await getReceitasDetalhadas(input);
    case 'get_despesas_detalhadas': return await getDespesasDetalhadas(input);
    case 'get_comparativo': return await getComparativo(input);
    case 'get_clientes_status': return await getClientesStatus(input);
    case 'get_projecao': return await getProjecao(input);
    case 'get_alertas': return await getAlertas(input);
    default: throw new Error(`Tool não reconhecida: ${name}`);
  }
}

// ============================================
// HANDLER PRINCIPAL
// ============================================
exports.handler = async (event, context) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Método não permitido' }) };
  }

  try {
    const { message, conversationHistory = [] } = JSON.parse(event.body);

    if (!message) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Mensagem não fornecida' }) };
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const messages = [...conversationHistory, { role: 'user', content: message }];

    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      tools,
      messages
    });

    // Loop agentico
    while (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(block => block.type === 'tool_use');
      const toolResults = [];

      for (const toolUse of toolUseBlocks) {
        console.log(`Executando: ${toolUse.name}`, toolUse.input);
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

      messages.push({ role: 'assistant', content: response.content });
      messages.push({ role: 'user', content: toolResults });

      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools,
        messages
      });
    }

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
        usage: response.usage
      })
    };

  } catch (error) {
    console.error('Erro no STARK:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await prisma.$disconnect();
  }
};
