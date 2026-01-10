# 📜 CHANGELOG - Starken Performance Dashboard

Histórico completo de todas as mudanças realizadas no dashboard.

---

## 🚀 [2.0.0] - 2026-01-10 - CARDS COMPLETOS + DRAG AND DROP

### ✨ Novas Funcionalidades

#### 🎯 CARDS - Informações Completas
- **Data de Fechamento do Contrato**: Exibe quando o contrato foi fechado (📅 Fechamento)
- **Data de Início**: Mostra quando o contrato começou (🚀 Início: Mês/Ano)
- **Data de Pagamento TCV**: Para contratos TCV, mostra quando o pagamento foi/será recebido (💰 Pagamento)
- **Duração do Projeto**: Para TCV, mostra quantos meses de trabalho (⏱️ Duração)
- **Badge de Tipo**: Destaque visual para TCV (roxo) ou MRR (verde)
- **Badge de Origem**: Badge colorido mostrando o canal de prospecção:
  - 🔸 **Outbound** (laranja)
  - 🔸 **Growth Hub** (verde)
  - 🔸 **Repasse Matriz** (azul)
  - 🔸 **Inbound** (verde)
  - 🔸 **Outros** (cinza)
- **Indicador de Contrato Fechado**: Ícone ✅ verde para contratos assinados

#### 🖱️ DRAG AND DROP
- **Reorganizar Cards**: Arraste e solte cards para reorganizar a ordem
- **Persistência**: Ordem salva automaticamente no localStorage
- **Visual Feedback**: Card fica semi-transparente durante o arrasto
- **Funciona em ambas grids**: Starken e Alpha

### 🔧 Melhorias

#### 📊 TABELA
- **Coluna "Tipo"**: Badge TCV/MRR em cada linha
- **Coluna "Origem"**: Badge colorido do canal de prospecção
- **Valores Líquidos**: Cálculo correto com desconto Alpha (15%)
- **Filtros de Data**: TCV aparece apenas no mês de pagamento, MRR por 12 meses

#### 🎨 VISUAL
- **Layout Limpo**: Informações organizadas hierarquicamente
- **Cores Diferenciadas**: Cada tipo de informação tem sua cor
- **Fontes Redimensionadas**: Categoria em fonte menor e mais discreta
- **Formatação de Datas**: Padrão brasileiro (dd/mm/aaaa)

### 🐛 Correções

- ✅ **Campo de Origem**: Corrigido de `categoria` para `origem` nos badges
- ✅ **Valores Líquidos**: Usando `valorLiquido` ao invés de `valor` bruto
- ✅ **Lógica TCV**: Aparece apenas no mês de `dataPagamentoTCV`
- ✅ **Lógica MRR**: Aparece por 12 meses a partir de `mesInicio`
- ✅ **Badges Completos**: Mapeamento para todos os valores de origem

---

## 📝 [1.0.0] - 2026-01-08 - CHECKPOINT INICIAL

### ✨ Estado Inicial (21:58)

#### Funcionalidades Existentes
- Sistema de clientes manuais via localStorage
- Cards de clientes com informações básicas
- Tabela Alpha com clientes
- Sistema de renovação de contratos
- Cálculo de valores brutos e líquidos
- Badges de TCV/MRR (parcial)
- Filtros por mês

#### Dados Salvos
- 43 clientes totais no localStorage
- 28 clientes Alpha
- 15 clientes Starken
- Sistema de cards deletados

---

## 📌 Como Restaurar Versões Anteriores

Você pode voltar para qualquer versão usando os commits git:

### Ver histórico de commits:
```bash
git log --oneline
```

### Restaurar para um commit específico:
```bash
# Ver diferenças
git show COMMIT_HASH

# Restaurar arquivo específico
git checkout COMMIT_HASH -- index.html

# Restaurar tudo para um commit
git reset --hard COMMIT_HASH
```

### Commits Importantes:

1. **e5adf95** - ✨ CHECKPOINT - Correções parciais de badges e filtros
   - Estado antes das mudanças completas
   - Badges básicos adicionados
   - Filtros corrigidos

2. **03ab704** - ✨ FEAT COMPLETO - Cards com todas informações + Drag and Drop
   - Versão atual (completa)
   - Todas as informações nos cards
   - Drag and drop funcionando

---

## 🔄 Histórico de Deploy

### Deploy #3 - 2026-01-10 23:XX
- **URL**: https://starkentecnologia-performance.netlify.app
- **Unique URL**: https://6962560519401d221468cc38--starkentecnologia-performance.netlify.app
- **Features**: Cards completos + Drag and Drop
- **Status**: ✅ Sucesso

### Deploy #2 - 2026-01-10 23:XX
- **Features**: Correções de badges e valores líquidos
- **Status**: ✅ Sucesso

### Deploy #1 - 2026-01-10 23:XX
- **Features**: Primeira tentativa de correção
- **Status**: ⚠️ Parcial (faltavam informações)

---

## 📋 Estrutura de Dados do Cliente

Campos salvos no localStorage (`starken_manual_clients`):

```javascript
{
  id: Number,                    // ID único do cliente
  nome: String,                  // Nome do cliente
  empresa: String,               // "starken" ou "alpha"
  categoria: String,             // Tipo de negócio (Pizzaria, Hamburgueria, etc)
  valor: Number,                 // Valor bruto do contrato
  valorLiquido: Number,          // Valor líquido (com descontos)
  tipoValor: String,             // "tcv" ou "mrr"
  origem: String,                // Canal: outbound, growth-hub, repasse-matriz, inbound, outros
  mesInicio: String,             // "YYYY-MM" - Mês de início do contrato
  dataFechamento: String,        // "YYYY-MM-DD" - Data de fechamento do contrato
  dataPagamentoTCV: String,      // "YYYY-MM-DD" - Data de pagamento (TCV)
  dataPagamentoMRR: String,      // "YYYY-MM-DD" - Data de pagamento mensal (MRR)
  mesesTrabalho: Number,         // Duração do projeto (TCV)
  tcvTotal: Number,              // Valor total do TCV
  parcelas: Number,              // Número de parcelas
  parcelasCartao: Number,        // Parcelas no cartão
  taxaJuros: Number,             // Taxa de juros (%)
  isContratoFechado: Boolean,    // Contrato assinado?
  isProjecao: Boolean,           // É projeção?
  statusRenovacao: String,       // Status de renovação
  mesRenovacao: String,          // Mês de renovação
  criadoEm: String,              // Data de criação (ISO)
  atualizadoEm: String           // Data de atualização (ISO)
}
```

---

## 🛠️ Manutenção

### Backup do localStorage

Para fazer backup dos dados:

1. Abra o Console (F12)
2. Execute:
```javascript
const backup = {
  clientes: localStorage.getItem('starken_manual_clients'),
  deletados: localStorage.getItem('starken_deleted_cards'),
  ordemStarken: localStorage.getItem('starken_cards_order'),
  ordemAlpha: localStorage.getItem('alpha_cards_order')
};
copy(JSON.stringify(backup, null, 2));
```

3. Cole em um arquivo `.json` para guardar

### Restaurar do Backup

```javascript
const backup = {
  // Cole aqui o conteúdo do backup
};

Object.entries(backup).forEach(([key, value]) => {
  if (value) localStorage.setItem(key, value);
});

location.reload();
```

---

## 📞 Suporte

Para reverter mudanças ou restaurar versões anteriores:

1. Use `git log` para ver histórico
2. Use `git show COMMIT_HASH` para ver mudanças
3. Use `git checkout COMMIT_HASH -- arquivo` para restaurar arquivo específico
4. Faça novo deploy com `netlify deploy --prod`

---

**Última atualização**: 2026-01-10 23:XX
**Versão**: 2.0.0
**Autor**: Claude Sonnet 4.5 via Claude Code
