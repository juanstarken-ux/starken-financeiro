/**
 * Helper para carregar dados financeiros base
 * Centraliza os dados que antes estavam duplicados em agent.js e sync-data.js
 */

const dadosBase = require('../data/financeiro-base.json');

/**
 * Retorna dados financeiros base para um mês específico
 * @param {string} mes - Formato: "YYYY-MM" (ex: "2025-12")
 * @returns {object} { receitas: [], despesas: [] }
 */
function getDadosBase(mes) {
  const dados = dadosBase[mes];

  if (!dados) {
    console.warn(`Dados base não encontrados para o mês: ${mes}`);
    return { receitas: [], despesas: [] };
  }

  // Retorna cópia para evitar mutação acidental
  return {
    receitas: dados.receitas ? [...dados.receitas] : [],
    despesas: dados.despesas ? [...dados.despesas] : []
  };
}

/**
 * Retorna todos os meses disponíveis
 * @returns {string[]} Array de meses no formato "YYYY-MM"
 */
function getMesesDisponiveis() {
  return Object.keys(dadosBase).sort();
}

/**
 * Verifica se existem dados para um mês
 * @param {string} mes - Formato: "YYYY-MM"
 * @returns {boolean}
 */
function temDados(mes) {
  return !!dadosBase[mes];
}

module.exports = {
  getDadosBase,
  getMesesDisponiveis,
  temDados,
  // Exportar também os dados brutos para compatibilidade
  dadosBase
};
