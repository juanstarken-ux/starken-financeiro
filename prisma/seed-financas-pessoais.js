const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Populando finanças pessoais dos sócios...\n');

  // Buscar IDs dos sócios
  const juan = await prisma.socio.findUnique({ where: { username: 'juan' } });
  const dante = await prisma.socio.findUnique({ where: { username: 'dante' } });
  const gabriel = await prisma.socio.findUnique({ where: { username: 'gabriel' } });
  const victor = await prisma.socio.findUnique({ where: { username: 'victor' } });

  if (!juan || !dante || !gabriel || !victor) {
    console.error('❌ Sócios não encontrados! Execute o seed-socios.js primeiro.');
    process.exit(1);
  }

  const meses = ['2025-10', '2025-11', '2025-12', '2026-01'];

  // =====================================================
  // JUAN MINNI - CEO
  // =====================================================
  console.log('💼 Criando finanças de Juan Minni...');

  for (const mes of meses) {
    // Receitas - Pro-labore
    await prisma.investimento.create({
      data: {
        socioId: juan.id,
        tipo: 'distribuicao',
        valor: 8000.00,
        descricao: 'Pro-labore mensal - CEO',
        dataOperacao: new Date(`${mes}-05`),
        mes: mes
      }
    });

    // Despesas pessoais
    await prisma.despesaPessoal.createMany({
      data: [
        {
          socioId: juan.id,
          mes: mes,
          nome: 'Aluguel Apartamento',
          valor: 3500.00,
          categoria: 'moradia',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-10`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-10`) : null,
          recorrente: true
        },
        {
          socioId: juan.id,
          mes: mes,
          nome: 'Cartão Nubank',
          valor: 2100.00,
          categoria: 'outros',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-15`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-15`) : null,
          recorrente: true
        },
        {
          socioId: juan.id,
          mes: mes,
          nome: 'Combustível',
          valor: 600.00,
          categoria: 'transporte',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-20`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-20`) : null,
          recorrente: true
        },
        {
          socioId: juan.id,
          mes: mes,
          nome: 'Plano de Saúde Unimed',
          valor: 850.00,
          categoria: 'saude',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-05`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-05`) : null,
          recorrente: true
        },
        {
          socioId: juan.id,
          mes: mes,
          nome: 'Academia SmartFit',
          valor: 120.00,
          categoria: 'saude',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-01`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-01`) : null,
          recorrente: true
        },
        {
          socioId: juan.id,
          mes: mes,
          nome: 'Internet Vivo Fibra',
          valor: 150.00,
          categoria: 'moradia',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-12`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-12`) : null,
          recorrente: true
        }
      ]
    });
  }

  // =====================================================
  // DANTE MARTINS - CTO
  // =====================================================
  console.log('💼 Criando finanças de Dante Martins...');

  for (const mes of meses) {
    // Receitas - Pro-labore
    await prisma.investimento.create({
      data: {
        socioId: dante.id,
        tipo: 'distribuicao',
        valor: 7500.00,
        descricao: 'Pro-labore mensal - CTO',
        dataOperacao: new Date(`${mes}-05`),
        mes: mes
      }
    });

    // Despesas pessoais
    await prisma.despesaPessoal.createMany({
      data: [
        {
          socioId: dante.id,
          mes: mes,
          nome: 'Aluguel Casa',
          valor: 2800.00,
          categoria: 'moradia',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-10`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-10`) : null,
          recorrente: true
        },
        {
          socioId: dante.id,
          mes: mes,
          nome: 'Cartão Inter',
          valor: 1800.00,
          categoria: 'outros',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-18`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-18`) : null,
          recorrente: true
        },
        {
          socioId: dante.id,
          mes: mes,
          nome: 'Uber/99',
          valor: 450.00,
          categoria: 'transporte',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-25`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-25`) : null,
          recorrente: true
        },
        {
          socioId: dante.id,
          mes: mes,
          nome: 'Plano de Saúde Bradesco',
          valor: 780.00,
          categoria: 'saude',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-08`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-08`) : null,
          recorrente: true
        },
        {
          socioId: dante.id,
          mes: mes,
          nome: 'Spotify Premium',
          valor: 34.90,
          categoria: 'lazer',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-15`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-15`) : null,
          recorrente: true
        },
        {
          socioId: dante.id,
          mes: mes,
          nome: 'Netflix',
          valor: 55.90,
          categoria: 'lazer',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-20`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-20`) : null,
          recorrente: true
        },
        {
          socioId: dante.id,
          mes: mes,
          nome: 'Mercado',
          valor: 1200.00,
          categoria: 'alimentacao',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-28`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-28`) : null,
          recorrente: true
        }
      ]
    });
  }

  // =====================================================
  // GABRIEL ANIBELLI - CFO
  // =====================================================
  console.log('💼 Criando finanças de Gabriel Anibelli...');

  for (const mes of meses) {
    // Receitas - Pro-labore
    await prisma.investimento.create({
      data: {
        socioId: gabriel.id,
        tipo: 'distribuicao',
        valor: 7000.00,
        descricao: 'Pro-labore mensal - CFO',
        dataOperacao: new Date(`${mes}-05`),
        mes: mes
      }
    });

    // Despesas pessoais
    await prisma.despesaPessoal.createMany({
      data: [
        {
          socioId: gabriel.id,
          mes: mes,
          nome: 'Aluguel Apartamento',
          valor: 2500.00,
          categoria: 'moradia',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-10`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-10`) : null,
          recorrente: true
        },
        {
          socioId: gabriel.id,
          mes: mes,
          nome: 'Cartão C6 Bank',
          valor: 1500.00,
          categoria: 'outros',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-12`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-12`) : null,
          recorrente: true
        },
        {
          socioId: gabriel.id,
          mes: mes,
          nome: 'Gasolina',
          valor: 550.00,
          categoria: 'transporte',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-22`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-22`) : null,
          recorrente: true
        },
        {
          socioId: gabriel.id,
          mes: mes,
          nome: 'Plano de Saúde SulAmérica',
          valor: 720.00,
          categoria: 'saude',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-05`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-05`) : null,
          recorrente: true
        },
        {
          socioId: gabriel.id,
          mes: mes,
          nome: 'Condomínio',
          valor: 450.00,
          categoria: 'moradia',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-08`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-08`) : null,
          recorrente: true
        },
        {
          socioId: gabriel.id,
          mes: mes,
          nome: 'IPTU',
          valor: 280.00,
          categoria: 'moradia',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-15`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-15`) : null,
          recorrente: true
        },
        {
          socioId: gabriel.id,
          mes: mes,
          nome: 'Alimentação/Restaurantes',
          valor: 900.00,
          categoria: 'alimentacao',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-30`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-30`) : null,
          recorrente: true
        }
      ]
    });
  }

  // =====================================================
  // VICTOR LAPEGNA - COO
  // =====================================================
  console.log('💼 Criando finanças de Victor Lapegna...');

  for (const mes of meses) {
    // Receitas - Pro-labore
    await prisma.investimento.create({
      data: {
        socioId: victor.id,
        tipo: 'distribuicao',
        valor: 6500.00,
        descricao: 'Pro-labore mensal - COO',
        dataOperacao: new Date(`${mes}-05`),
        mes: mes
      }
    });

    // Despesas pessoais
    await prisma.despesaPessoal.createMany({
      data: [
        {
          socioId: victor.id,
          mes: mes,
          nome: 'Aluguel Kitnet',
          valor: 1800.00,
          categoria: 'moradia',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-10`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-10`) : null,
          recorrente: true
        },
        {
          socioId: victor.id,
          mes: mes,
          nome: 'Cartão Itaú',
          valor: 1200.00,
          categoria: 'outros',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-20`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-20`) : null,
          recorrente: true
        },
        {
          socioId: victor.id,
          mes: mes,
          nome: 'Uber/Transporte',
          valor: 400.00,
          categoria: 'transporte',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-25`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-25`) : null,
          recorrente: true
        },
        {
          socioId: victor.id,
          mes: mes,
          nome: 'Plano de Saúde',
          valor: 650.00,
          categoria: 'saude',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-07`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-07`) : null,
          recorrente: true
        },
        {
          socioId: victor.id,
          mes: mes,
          nome: 'Internet + TV',
          valor: 180.00,
          categoria: 'moradia',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-15`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-15`) : null,
          recorrente: true
        },
        {
          socioId: victor.id,
          mes: mes,
          nome: 'Mercado/Supermercado',
          valor: 800.00,
          categoria: 'alimentacao',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-28`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-28`) : null,
          recorrente: true
        },
        {
          socioId: victor.id,
          mes: mes,
          nome: 'Lazer/Entretenimento',
          valor: 350.00,
          categoria: 'lazer',
          status: mes <= '2025-12' ? 'Pago' : 'A Pagar',
          vencimento: new Date(`${mes}-30`),
          dataPagamento: mes <= '2025-12' ? new Date(`${mes}-30`) : null,
          recorrente: true
        }
      ]
    });
  }

  // =====================================================
  // EMPRÉSTIMOS E APORTES ESPECIAIS
  // =====================================================
  console.log('\n💰 Criando empréstimos e aportes...');

  // Juan - Aporte de capital inicial
  await prisma.investimento.create({
    data: {
      socioId: juan.id,
      tipo: 'aporte_capital',
      valor: 50000.00,
      descricao: 'Aporte inicial de capital - Abertura da empresa',
      dataOperacao: new Date('2025-01-15'),
      mes: '2025-01'
    }
  });

  // Dante - Empréstimo para empresa
  await prisma.emprestimo.create({
    data: {
      socioId: dante.id,
      tipo: 'emprestimo_para_empresa',
      valor: 15000.00,
      valorRestante: 8000.00,
      descricao: 'Empréstimo para capital de giro',
      dataInicio: new Date('2025-08-10'),
      dataPrevisao: new Date('2026-02-10'),
      status: 'Ativo'
    }
  });

  // Gabriel - Adiantamento
  await prisma.emprestimo.create({
    data: {
      socioId: gabriel.id,
      tipo: 'adiantamento_do_socio',
      valor: 5000.00,
      valorRestante: 2500.00,
      descricao: 'Adiantamento pro-labore - Dezembro',
      dataInicio: new Date('2025-12-01'),
      dataPrevisao: new Date('2026-03-01'),
      status: 'Ativo'
    }
  });

  console.log('\n✅ Finanças pessoais criadas com sucesso!\n');
  console.log('📊 Resumo:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Juan Minni (CEO)     - Pro-labore: R$ 8.000/mês');
  console.log('Dante Martins (CTO)  - Pro-labore: R$ 7.500/mês');
  console.log('Gabriel Anibelli (CFO) - Pro-labore: R$ 7.000/mês');
  console.log('Victor Lapegna (COO) - Pro-labore: R$ 6.500/mês');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Total mensal: R$ 29.000,00\n');
}

main()
  .catch(e => {
    console.error('❌ Erro ao popular finanças:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
