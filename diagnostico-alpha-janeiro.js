// Script de Diagnóstico - Clientes Alpha em Janeiro/2026
// Cole este código no console do dashboard (F12 ou Cmd+Option+J)

(function diagnosticarAlphaJaneiro() {
    console.log('\n========================================');
    console.log('🔍 DIAGNÓSTICO - CLIENTES ALPHA - JANEIRO/2026');
    console.log('========================================\n');

    const mesChave = '2026-01';
    const todosClientes = JSON.parse(localStorage.getItem('starken_manual_clients') || '[]');
    const deletedIds = JSON.parse(localStorage.getItem('starken_deleted_cards') || '[]');

    console.log('📊 Total de clientes no localStorage:', todosClientes.length);
    console.log('🗑️  Clientes deletados:', deletedIds.length);

    // Filtrar apenas Alpha
    const clientesAlpha = todosClientes.filter(c => c.empresa === 'alpha');
    console.log('⭐ Clientes Alpha (total):', clientesAlpha.length);

    // Aplicar filtros da tabela
    const naoRenovacao = clientesAlpha.filter(c => !c.statusRenovacao);
    const naoProjecao = naoRenovacao.filter(c => !c.isProjecao);
    const naoDeletados = naoProjecao.filter(c => !deletedIds.includes(c.id));

    console.log('\n📋 FILTROS APLICADOS:');
    console.log(`  Sem renovação: ${naoRenovacao.length} (removidos ${clientesAlpha.length - naoRenovacao.length})`);
    console.log(`  Sem projeção: ${naoProjecao.length} (removidos ${naoRenovacao.length - naoProjecao.length})`);
    console.log(`  Não deletados: ${naoDeletados.length} (removidos ${naoProjecao.length - naoDeletados.length})`);

    // Verificar quais aparecem no mês
    const clientesNoMes = naoDeletados.filter(c => {
        // 🎯 PRIORIDADE: Se tem MESES PERSONALIZADOS, usar eles!
        if (c.mesesPersonalizados && c.mesesPersonalizados.length > 0) {
            return c.mesesPersonalizados.includes(mesChave);
        }

        // Senão, usar lógica automática
        // TCV: apenas no mês de pagamento
        if (c.tipoValor === 'tcv') {
            const mesPagamento = (c.dataPagamentoTCV || c.mesInicio || '').substring(0, 7);
            return mesPagamento === mesChave;
        }

        // MRR: aparece de mesInicio até 12 meses depois
        if (c.tipoValor === 'mrr') {
            if (!c.mesInicio) return false;

            const [anoInicio, mesInicio] = c.mesInicio.split('-').map(Number);
            const dataInicio = new Date(anoInicio, mesInicio - 1, 1);
            const dataFim = new Date(dataInicio);
            dataFim.setMonth(dataFim.getMonth() + 12);

            const [anoMes, mesMes] = mesChave.split('-').map(Number);
            const dataMes = new Date(anoMes, mesMes - 1, 1);

            return dataMes >= dataInicio && dataMes < dataFim;
        }

        return false;
    });

    console.log(`\n✅ Clientes que DEVEM aparecer em Jan/2026: ${clientesNoMes.length}`);

    // Separar por tipo
    const tcvClientes = clientesNoMes.filter(c => c.tipoValor === 'tcv');
    const mrrClientes = clientesNoMes.filter(c => c.tipoValor === 'mrr');

    console.log('\n📊 SEPARAÇÃO POR TIPO:');
    console.log(`  TCV: ${tcvClientes.length} clientes`);
    console.log(`  MRR: ${mrrClientes.length} clientes`);

    // Listar todos os clientes que devem aparecer
    console.log('\n📋 LISTA COMPLETA (devem aparecer na tabela):');
    console.log('═══════════════════════════════════════════════════\n');

    console.log('💰 TCV:');
    tcvClientes.forEach((c, i) => {
        const valorBruto = c.valor || 0;
        const valorLiquido = c.valorLiquido || 0;
        console.log(`  ${i + 1}. ${c.nome}`);
        console.log(`     Valor BRUTO: R$ ${valorBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log(`     Valor LÍQUIDO: R$ ${valorLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log(`     Data Pagamento: ${c.dataPagamentoTCV || 'N/A'}`);
        console.log(`     Meses Personalizados: ${c.mesesPersonalizados ? c.mesesPersonalizados.join(', ') : 'Não'}`);
        console.log('');
    });

    console.log('\n💚 MRR:');
    mrrClientes.forEach((c, i) => {
        const valorBruto = c.valor || 0;
        const valorLiquido = c.valorLiquido || 0;
        console.log(`  ${i + 1}. ${c.nome}`);
        console.log(`     Valor BRUTO: R$ ${valorBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log(`     Valor LÍQUIDO: R$ ${valorLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        console.log(`     Mês Início: ${c.mesInicio || 'N/A'}`);
        console.log(`     Meses Personalizados: ${c.mesesPersonalizados ? c.mesesPersonalizados.join(', ') : 'Não'}`);
        console.log('');
    });

    // Identificar clientes Alpha que NÃO aparecem no mês
    const clientesForaDoMes = naoDeletados.filter(c => !clientesNoMes.includes(c));

    if (clientesForaDoMes.length > 0) {
        console.log('\n❌ CLIENTES ALPHA QUE NÃO APARECEM (mas não estão deletados):');
        console.log('═══════════════════════════════════════════════════\n');
        clientesForaDoMes.forEach((c, i) => {
            console.log(`  ${i + 1}. ${c.nome} (${c.tipoValor.toUpperCase()})`);
            console.log(`     Início: ${c.mesInicio || 'N/A'}`);
            console.log(`     Pagamento TCV: ${c.dataPagamentoTCV || 'N/A'}`);
            console.log(`     Meses Personalizados: ${c.mesesPersonalizados ? c.mesesPersonalizados.join(', ') : 'Não'}`);
            console.log('');
        });
    }

    // Calcular totais
    let totalTCVBruto = 0;
    let totalTCVLiquido = 0;
    let totalMRRBruto = 0;
    let totalMRRLiquido = 0;

    tcvClientes.forEach(c => {
        // Para TCV com meses personalizados, verificar se é mês de receita
        if (c.tcvMesesReceita && c.tcvMesesReceita.length > 0) {
            if (c.tcvMesesReceita.includes(mesChave)) {
                totalTCVBruto += (c.valor || 0);
                totalTCVLiquido += (c.valorLiquido || 0);
            }
        } else {
            totalTCVBruto += (c.valor || 0);
            totalTCVLiquido += (c.valorLiquido || 0);
        }
    });

    mrrClientes.forEach(c => {
        totalMRRBruto += (c.valor || 0);
        totalMRRLiquido += (c.valorLiquido || 0);
    });

    console.log('\n💰 TOTAIS CALCULADOS:');
    console.log('═══════════════════════════════════════════════════');
    console.log(`  MRR BRUTO: R$ ${totalMRRBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log(`  MRR LÍQUIDO: R$ ${totalMRRLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log(`  TCV BRUTO: R$ ${totalTCVBruto.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log(`  TCV LÍQUIDO: R$ ${totalTCVLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log(`  TOTAL BRUTO: R$ ${(totalMRRLiquido + totalTCVBruto).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log(`  TOTAL LÍQUIDO: R$ ${(totalMRRLiquido + totalTCVLiquido).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
    console.log('');
    console.log('⚠️  NOTA: Tabela usa MRR LÍQUIDO + TCV BRUTO');
    console.log('═══════════════════════════════════════════════════\n');

    return {
        totalClientes: clientesNoMes.length,
        tcv: tcvClientes.length,
        mrr: mrrClientes.length,
        totalTCVBruto,
        totalMRRLiquido,
        totalTabela: totalMRRLiquido + totalTCVBruto,
        clientesTCV: tcvClientes.map(c => c.nome),
        clientesMRR: mrrClientes.map(c => c.nome),
        clientesForaDoMes: clientesForaDoMes.map(c => ({nome: c.nome, tipo: c.tipoValor, mesInicio: c.mesInicio, dataPagamentoTCV: c.dataPagamentoTCV}))
    };
})();
