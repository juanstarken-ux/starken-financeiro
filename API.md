# 📚 Documentação da API - Starken Performance Financeiro

**Versão:** 2.0.0
**Última atualização:** 30 de Dezembro de 2025

---

## 🔐 Segurança

### CORS
Apenas os seguintes domínios têm acesso à API:
- `https://starkentecnologia-performance.netlify.app`
- `http://localhost:3000`
- `http://localhost:3001`

### Rate Limiting
- **Agent API:** 10 requisições/minuto por IP
- **Sync Data API:** 30 requisições/minuto por IP

Headers de resposta:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 45
```

---

## 📡 Endpoints

### 1. STARK Agent (IA Financeira)

**Endpoint:** `POST /.netlify/functions/agent`

**Descrição:** Conversa com o agente de IA STARK para consultas e operações financeiras.

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "message": "Adicione uma despesa de R$ 500 para aluguel",
  "conversationHistory": [],
  "importedFile": null
}
```

**Response (200 OK):**
```json
{
  "response": "Despesa adicionada com sucesso! ...",
  "conversationHistory": [...]
}
```

**Ferramentas Disponíveis:**
- `adicionar_conta_pagar` - Adiciona despesa
- `adicionar_conta_receber` - Adiciona receita
- `marcar_como_pago` - Marca despesa como paga
- `marcar_como_recebido` - Marca receita como recebida
- `editar_item` - Edita despesa/receita
- `remover_item` - Remove despesa/receita
- `buscar_dados_mes` - Busca dados financeiros do mês
- `listar_contas_pendentes` - Lista contas pendentes

---

### 2. Sincronização de Dados

**Endpoint:** `POST /.netlify/functions/sync-data`

**Descrição:** API RESTful para operações CRUD diretas nos dados financeiros.

---

#### 2.1 Buscar Todos os Dados

**Request:**
```json
{
  "acao": "buscar-tudo",
  "mes": "2025-12"
}
```

**Response:**
```json
{
  "success": true,
  "dados": {
    "receitas": [...],
    "despesas": [...],
    "resumo": {
      "receitaTotal": 54982.75,
      "despesaTotal": 31869.90,
      "lucro": 23112.85,
      "margem": 42.03,
      "receitasCount": 23,
      "despesasCount": 20
    },
    "alertas": [...]
  }
}
```

---

#### 2.2 Adicionar Receita

**Request:**
```json
{
  "acao": "adicionar-receita",
  "dados": {
    "nome": "Cliente XYZ",
    "valor": 5000,
    "empresa": "starken",
    "tipo": "mrr",
    "vencimento": "2025-12-31",
    "mes": "2025-12"
  }
}
```

**Validações:**
- `nome`: string, 1-200 caracteres (obrigatório)
- `valor`: número positivo, máx 10.000.000 (obrigatório)
- `empresa`: enum ["starken", "alpha"] (obrigatório)
- `tipo`: enum ["mrr", "tcv", "projeto"] (opcional)
- `vencimento`: data formato YYYY-MM-DD (opcional)
- `mes`: formato YYYY-MM (opcional, padrão: mês atual)

**Response (200 OK):**
```json
{
  "success": true,
  "item": {
    "id": "clxxx...",
    "nome": "Cliente XYZ",
    "valor": 5000,
    ...
  }
}
```

**Response (400 Bad Request):**
```json
{
  "sucesso": false,
  "erro": "Dados inválidos",
  "detalhes": [
    {
      "campo": "valor",
      "mensagem": "Valor deve ser positivo"
    }
  ]
}
```

---

#### 2.3 Adicionar Despesa

**Request:**
```json
{
  "acao": "adicionar-despesa",
  "dados": {
    "nome": "Aluguel Escritório",
    "valor": 3500,
    "categoria": "estrutura",
    "vencimento": "2025-12-10",
    "mes": "2025-12"
  }
}
```

**Validações:**
- `nome`: string, 1-200 caracteres (obrigatório)
- `valor`: número positivo, máx 10.000.000 (obrigatório)
- `categoria`: enum ["pessoal", "comercial", "estrutura", "ferramentas", "alpha", "outros"] (obrigatório)
- `vencimento`: data formato YYYY-MM-DD (opcional)
- `mes`: formato YYYY-MM (opcional)

---

#### 2.4 Marcar como Pago

**Request:**
```json
{
  "acao": "marcar-pago",
  "dados": {
    "nome": "Aluguel Escritório",
    "mes": "2025-12",
    "data_pagamento": "2025-12-10"
  }
}
```

**Response:**
```json
{
  "success": true,
  "mensagem": "Aluguel Escritório marcado como PAGO"
}
```

---

#### 2.5 Marcar como Recebido

**Request:**
```json
{
  "acao": "marcar-recebido",
  "dados": {
    "nome": "Cliente XYZ",
    "mes": "2025-12",
    "data_recebimento": "2025-12-15"
  }
}
```

---

#### 2.6 Editar Item

**Request:**
```json
{
  "acao": "editar-item",
  "dados": {
    "tipo": "despesa",
    "nome_atual": "Aluguel Escritório",
    "novo_nome": "Aluguel Novo Escritório",
    "novo_valor": 4000,
    "nova_categoria": "estrutura",
    "mes": "2025-12"
  }
}
```

**Validações:**
- `tipo`: enum ["despesa", "receita"] (obrigatório)
- `nome_atual`: string (obrigatório)
- Pelo menos um dos campos novos deve ser fornecido

---

#### 2.7 Remover Item

**Request:**
```json
{
  "acao": "remover-item",
  "dados": {
    "tipo": "despesa",
    "nome": "Aluguel Escritório",
    "mes": "2025-12"
  }
}
```

---

## 📊 Estrutura de Dados

### Receita
```typescript
{
  id?: string;
  nome: string;
  valor: number;
  categoria: "starken" | "alpha";
  tipo?: "mrr" | "tcv" | "projeto";
  status: "A Receber" | "Recebido";
  vencimento?: string; // YYYY-MM-DD
  dataPagamento?: string; // YYYY-MM-DD
  empresa?: string;
  isCustom?: boolean;
}
```

### Despesa
```typescript
{
  id?: string;
  nome: string;
  valor: number;
  categoria: "pessoal" | "comercial" | "estrutura" | "ferramentas" | "alpha" | "outros";
  status: "A Pagar" | "Pago";
  vencimento?: string; // YYYY-MM-DD
  dataPagamento?: string; // YYYY-MM-DD
  funcao?: string;
  isCustom?: boolean;
}
```

### Resumo
```typescript
{
  receitaTotal: number;
  despesaTotal: number;
  lucro: number;
  margem: number; // percentual
  receitasCount: number;
  despesasCount: number;
}
```

---

## ⚠️ Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 200 | OK - Operação bem-sucedida |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Não autenticado |
| 405 | Method Not Allowed - Método HTTP incorreto |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro no servidor |

---

## 🔍 Exemplos de Uso

### JavaScript (Fetch API)

```javascript
// Adicionar receita
const response = await fetch('/.netlify/functions/sync-data', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    acao: 'adicionar-receita',
    dados: {
      nome: 'Cliente ABC',
      valor: 5000,
      empresa: 'starken',
      tipo: 'mrr'
    }
  })
});

const result = await response.json();
console.log(result);
```

### cURL

```bash
# Buscar dados do mês
curl -X POST https://starkentecnologia-performance.netlify.app/.netlify/functions/sync-data \
  -H "Content-Type: application/json" \
  -d '{
    "acao": "buscar-tudo",
    "mes": "2025-12"
  }'
```

---

## 📝 Notas Importantes

1. **Datas:** Sempre use formato ISO 8601 (YYYY-MM-DD)
2. **Mês:** Formato YYYY-MM (ex: "2025-12")
3. **Valores:** Sempre números, não strings
4. **Rate Limiting:** Respeite os limites para evitar bloqueio temporário
5. **CORS:** Requisições devem vir dos domínios autorizados

---

## 🚀 Changelog

### v2.0.0 (30/12/2025)
- ✅ Adicionada validação de inputs com Zod
- ✅ Implementado rate limiting
- ✅ CORS restrito a domínios específicos
- ✅ Dados centralizados em arquivo JSON
- ✅ Sistema de logs estruturado

### v1.0.0 (Inicial)
- Implementação inicial da API
- Agent STARK com Anthropic Claude
- CRUD básico de receitas/despesas

---

## 💡 Suporte

Para problemas ou dúvidas:
- Criar issue no repositório
- Contato: juan@starkentecnologia.com.br
