const { z } = require('zod');

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

// Validação de mês (formato YYYY-MM)
const mesSchema = z.string()
  .regex(/^\d{4}-\d{2}$/, 'Formato de mês inválido. Use YYYY-MM')
  .refine(mes => {
    const [ano, mesNum] = mes.split('-').map(Number);
    return ano >= 2020 && ano <= 2030 && mesNum >= 1 && mesNum <= 12;
  }, 'Mês fora do intervalo válido (2020-2030)');

// Validação de data (formato YYYY-MM-DD)
const dataSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido. Use YYYY-MM-DD')
  .refine(data => {
    const date = new Date(data);
    return !isNaN(date.getTime());
  }, 'Data inválida');

// Validação de categoria de despesa
const categoriaDespesaSchema = z.enum([
  'pessoal',
  'comercial',
  'estrutura',
  'ferramentas',
  'alpha',
  'outros'
], {
  errorMap: () => ({ message: 'Categoria inválida. Use: pessoal, comercial, estrutura, ferramentas, alpha ou outros' })
});

// Validação de categoria de receita (empresa)
const categoriaReceitaSchema = z.enum(['starken', 'alpha'], {
  errorMap: () => ({ message: 'Empresa inválida. Use: starken ou alpha' })
});

// Validação de tipo de receita
const tipoReceitaSchema = z.enum(['mrr', 'tcv', 'projeto'], {
  errorMap: () => ({ message: 'Tipo inválido. Use: mrr, tcv ou projeto' })
});

// Validação de status
const statusSchema = z.enum(['A Pagar', 'Pago', 'A Receber', 'Recebido'], {
  errorMap: () => ({ message: 'Status inválido' })
});

// ============================================
// SCHEMAS DE DADOS COMPLETOS
// ============================================

// Schema para adicionar conta a pagar
const contaPagarSchema = z.object({
  nome: z.string()
    .min(1, 'Nome obrigatório')
    .max(200, 'Nome muito longo (máximo 200 caracteres)')
    .trim(),
  valor: z.number()
    .positive('Valor deve ser positivo')
    .max(10000000, 'Valor muito alto (máximo R$ 10.000.000)')
    .finite('Valor deve ser um número finito'),
  categoria: categoriaDespesaSchema,
  vencimento: dataSchema.optional(),
  mes: mesSchema.optional()
});

// Schema para adicionar conta a receber
const contaReceberSchema = z.object({
  nome: z.string()
    .min(1, 'Nome do cliente obrigatório')
    .max(200, 'Nome muito longo (máximo 200 caracteres)')
    .trim(),
  valor: z.number()
    .positive('Valor deve ser positivo')
    .max(10000000, 'Valor muito alto (máximo R$ 10.000.000)')
    .finite('Valor deve ser um número finito'),
  empresa: categoriaReceitaSchema,
  tipo: tipoReceitaSchema.optional(),
  vencimento: dataSchema.optional(),
  mes: mesSchema.optional()
});

// Schema para marcar como pago/recebido
const marcarPagoSchema = z.object({
  nome: z.string()
    .min(1, 'Nome obrigatório')
    .max(200, 'Nome muito longo')
    .trim(),
  mes: mesSchema.optional(),
  data_pagamento: dataSchema.optional()
});

// Schema para editar item
const editarItemSchema = z.object({
  tipo: z.enum(['despesa', 'receita'], {
    errorMap: () => ({ message: 'Tipo deve ser "despesa" ou "receita"' })
  }),
  nome_atual: z.string()
    .min(1, 'Nome atual obrigatório')
    .trim(),
  novo_nome: z.string()
    .min(1)
    .max(200)
    .trim()
    .optional(),
  novo_valor: z.number()
    .positive()
    .max(10000000)
    .finite()
    .optional(),
  nova_categoria: z.string().optional(),
  mes: mesSchema.optional()
}).refine(data => data.novo_nome || data.novo_valor, {
  message: 'Deve fornecer novo_nome ou novo_valor'
});

// Schema para remover item
const removerItemSchema = z.object({
  tipo: z.enum(['despesa', 'receita']),
  nome: z.string()
    .min(1, 'Nome obrigatório')
    .trim(),
  mes: mesSchema.optional()
});

// ============================================
// FUNÇÕES DE VALIDAÇÃO
// ============================================

/**
 * Valida dados e retorna resultado com sucesso/erro
 */
function validar(schema, dados) {
  try {
    const validado = schema.parse(dados);
    return { sucesso: true, dados: validado };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const erros = error.errors.map(err => ({
        campo: err.path.join('.'),
        mensagem: err.message
      }));
      return {
        sucesso: false,
        erro: 'Dados inválidos',
        detalhes: erros
      };
    }
    return {
      sucesso: false,
      erro: 'Erro de validação desconhecido'
    };
  }
}

// ============================================
// EXPORTAR
// ============================================

module.exports = {
  // Schemas individuais
  mesSchema,
  dataSchema,
  categoriaDespesaSchema,
  categoriaReceitaSchema,
  tipoReceitaSchema,
  statusSchema,

  // Schemas completos
  contaPagarSchema,
  contaReceberSchema,
  marcarPagoSchema,
  editarItemSchema,
  removerItemSchema,

  // Função helper
  validar
};
