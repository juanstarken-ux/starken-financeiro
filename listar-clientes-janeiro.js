// Script para listar todos os clientes que aparecem em Janeiro/2026
// Cole este código no console do dashboard (F12 ou Cmd+Option+J)

(function analisarClientesJaneiro() {
    console.log('\n========================================');
    console.log('📊 ANÁLISE DE CLIENTES - JANEIRO/2026');
    console.log('========================================\n');

    const clientes = JSON.parse(localStorage.getItem('starken_manual_clients') || '[]');
    const mesAnalise = '2026-01';

    function verificarSeAparece(cliente, mes) {
        // Não mostrar projeções
        if (cliente.isProjecao) return false;

        // Cards de renovação
        if (cliente.statusRenovacao && cliente.mesRenovacao === mes) {
            return true;
        }

        // TCV: aparece apenas no mês de pagamento
        if (cliente.tipoValor === 'tcv') {
            const mesPagamento = cliente.dataPagamentoTCV || cliente.mesInicio;
            if (!mesPagamento) return false;

            let mesPagamentoFormatado;
            if (mesPagamento.includes('-') && mesPagamento.split('-').length === 3) {
                const [ano, mesNum] = mesPagamento.split('-');
                mesPagamentoFormatado = `${ano}-${mesNum}`;
            } else {
                mesPagamentoFormatado = mesPagamento;
            }

            return mesPagamentoFormatado === mes;
        }

        // MRR: aparece de mesInicio até 12 meses depois
        if (cliente.tipoValor === 'mrr') {
            if (!cliente.mesInicio) return false;

            const [anoInicio, mesInicio] = cliente.mesInicio.split('-').map(Number);
            const dataInicio = new Date(anoInicio, mesInicio - 1, 1);
            const dataFim = new Date(dataInicio);
            dataFim.setMonth(dataFim.getMonth() + 12);

            const [anoMes, mesMes] = mes.split('-').map(Number);
            const dataMes = new Date(anoMes, mesMes - 1, 1);

            return dataMes >= dataInicio && dataMes < dataFim;
        }

        return false;
    }

    const clientesJaneiro = clientes.filter(c => verificarSeAparece(c, mesAnalise));

    // Separar por empresa
    const starken = clientesJaneiro.filter(c => c.empresa === 'starken');
    const alpha = clientesJaneiro.filter(c => c.empresa === 'alpha');

    // Separar Alpha por tipo
    const alphaMRR = alpha.filter(c => c.tipoValor === 'mrr');
    const alphaTCV = alpha.filter(c => c.tipoValor === 'tcv');

    console.log(`🚀 STARKEN: ${starken.length} clientes`);
    console.log('─────────────────────────────────────\n');
    starken.forEach((c, i) => {
        console.log(`${i + 1}. ${c.nome} - ${c.tipoValor.toUpperCase()} - R$ ${(c.valorLiquido || c.valor || 0).toLocaleString('pt-BR')}`);
        console.log(`   Início: ${c.mesInicio || 'N/A'}`);
        if (c.tipoValor === 'tcv') {
            console.log(`   Pagamento: ${c.dataPagamentoTCV || 'N/A'}`);
        }
        console.log('');
    });

    console.log('\n⭐ ALPHA: ' + alpha.length + ' clientes');
    console.log('─────────────────────────────────────\n');

    console.log(`   📗 MRR: ${alphaMRR.length} clientes\n`);
    alphaMRR.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.nome} - R$ ${(c.valorLiquido || c.valor || 0).toLocaleString('pt-BR')}/mês`);
        console.log(`      Início: ${c.mesInicio || 'N/A'} | Origem: ${c.origem || 'N/A'}`);
        console.log('');
    });

    console.log(`\n   📘 TCV: ${alphaTCV.length} clientes\n`);
    alphaTCV.forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.nome} - R$ ${(c.valorLiquido || c.valor || 0).toLocaleString('pt-BR')}`);
        console.log(`      Início: ${c.mesInicio || 'N/A'} | Pagamento: ${c.dataPagamentoTCV || 'N/A'}`);
        console.log(`      Origem: ${c.origem || 'N/A'} | Meses de trabalho: ${c.mesesTrabalho || 'N/A'}`);
        console.log('');
    });

    console.log('\n========================================');
    console.log('📊 RESUMO');
    console.log('========================================');
    console.log(`Total de clientes em Janeiro/2026: ${clientesJaneiro.length}`);
    console.log(`  - Starken: ${starken.length}`);
    console.log(`  - Alpha: ${alpha.length} (${alphaMRR.length} MRR + ${alphaTCV.length} TCV)`);
    console.log('========================================\n');

    // Calcular totais
    let totalLiquido = 0;
    let totalAlpha = 0;
    let totalStarken = 0;

    clientesJaneiro.forEach(c => {
        const valor = c.valorLiquido || c.valor || 0;
        totalLiquido += valor;
        if (c.empresa === 'alpha') {
            totalAlpha += valor;
        } else {
            totalStarken += valor;
        }
    });

    console.log('💰 VALORES LÍQUIDOS:');
    console.log(`  - Total: R$ ${totalLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
    console.log(`  - Starken: R$ ${totalStarken.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
    console.log(`  - Alpha: R$ ${totalAlpha.toLocaleString('pt-BR', {minimumFractionDigits: 2})}`);
    console.log('========================================\n');

    // Retornar lista para análise
    return {
        total: clientesJaneiro.length,
        starken: starken.length,
        alpha: alpha.length,
        alphaMRR: alphaMRR.length,
        alphaTCV: alphaTCV.length,
        clientes: clientesJaneiro,
        porEmpresa: {
            starken: starken,
            alpha: alpha
        }
    };
})();
