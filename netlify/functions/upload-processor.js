const Busboy = require('busboy');

// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Parse multipart form data
function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type']
      }
    });

    const result = {
      files: [],
      fields: {}
    };

    busboy.on('file', (fieldname, file, info) => {
      const { filename, encoding, mimeType } = info;
      const chunks = [];

      file.on('data', (data) => {
        chunks.push(data);
      });

      file.on('end', () => {
        result.files.push({
          fieldname,
          filename,
          encoding,
          mimeType,
          content: Buffer.concat(chunks)
        });
      });
    });

    busboy.on('field', (fieldname, val) => {
      result.fields[fieldname] = val;
    });

    busboy.on('finish', () => {
      resolve(result);
    });

    busboy.on('error', reject);

    const encoding = event.isBase64Encoded ? 'base64' : 'binary';
    busboy.write(Buffer.from(event.body, encoding));
    busboy.end();
  });
}

// Parse OFX file (extrato bancário)
function parseOFX(content) {
  const text = content.toString('utf-8');
  const transactions = [];

  // Extract transactions
  const stmtTrnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
  let match;

  while ((match = stmtTrnRegex.exec(text)) !== null) {
    const trn = match[1];

    const getTag = (tag) => {
      const tagRegex = new RegExp(`<${tag}>([^<\\n]+)`, 'i');
      const m = trn.match(tagRegex);
      return m ? m[1].trim() : null;
    };

    const trnType = getTag('TRNTYPE');
    const dtPosted = getTag('DTPOSTED');
    const trnAmt = getTag('TRNAMT');
    const memo = getTag('MEMO') || getTag('NAME');

    if (trnAmt) {
      const amount = parseFloat(trnAmt);
      const date = dtPosted ? formatOFXDate(dtPosted) : null;

      transactions.push({
        tipo: amount >= 0 ? 'receita' : 'despesa',
        valor: Math.abs(amount),
        descricao: memo || (amount >= 0 ? 'Crédito' : 'Débito'),
        data: date,
        trnType
      });
    }
  }

  // Get account info
  const bankId = text.match(/<BANKID>([^<\n]+)/i)?.[1]?.trim();
  const acctId = text.match(/<ACCTID>([^<\n]+)/i)?.[1]?.trim();
  const balAmt = text.match(/<BALAMT>([^<\n]+)/i)?.[1]?.trim();

  const totalReceitas = transactions.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
  const totalDespesas = transactions.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);

  return {
    type: 'ofx',
    banco: bankId,
    conta: acctId,
    saldo: balAmt ? parseFloat(balAmt) : null,
    transacoes: transactions.length,
    receitas: totalReceitas,
    despesas: totalDespesas,
    items: transactions.slice(0, 50), // Limit to 50 items
    summary: `🏦 Extrato OFX: ${transactions.length} transações | Entradas: R$ ${totalReceitas.toFixed(2)} | Saídas: R$ ${totalDespesas.toFixed(2)}`
  };
}

// Format OFX date (YYYYMMDD or YYYYMMDDHHMMSS)
function formatOFXDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return null;
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(4, 6);
  const day = dateStr.substring(6, 8);
  return `${year}-${month}-${day}`;
}

// Parse CSV file
function parseCSV(content) {
  const text = content.toString('utf-8');
  const lines = text.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    return { type: 'csv', error: 'Arquivo vazio', items: [] };
  }

  // Detect delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';

  // Parse header
  const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/["']/g, ''));

  // Find relevant columns
  const findColumn = (keywords) => {
    return headers.findIndex(h =>
      keywords.some(k => h.includes(k))
    );
  };

  const descCol = findColumn(['descricao', 'descrição', 'historico', 'histórico', 'nome', 'memo', 'description']);
  const valorCol = findColumn(['valor', 'value', 'amount', 'quantia']);
  const dataCol = findColumn(['data', 'date', 'vencimento', 'emissao']);
  const tipoCol = findColumn(['tipo', 'type', 'natureza', 'categoria']);

  const items = [];
  let totalReceitas = 0;
  let totalDespesas = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/["']/g, ''));

    if (values.length < 2) continue;

    let valor = valorCol >= 0 ? parseFloat(values[valorCol]?.replace(/[^\d.,-]/g, '').replace(',', '.')) : 0;
    const descricao = descCol >= 0 ? values[descCol] : values[0];
    const data = dataCol >= 0 ? values[dataCol] : null;
    const tipoRaw = tipoCol >= 0 ? values[tipoCol]?.toLowerCase() : '';

    // Determine tipo
    let tipo = 'despesa';
    if (tipoRaw.includes('credit') || tipoRaw.includes('receita') || tipoRaw.includes('entrada') || valor > 0) {
      tipo = 'receita';
    }
    if (tipoRaw.includes('debit') || tipoRaw.includes('despesa') || tipoRaw.includes('saida') || tipoRaw.includes('saída')) {
      tipo = 'despesa';
    }

    valor = Math.abs(valor);

    if (valor > 0) {
      items.push({ tipo, valor, descricao, data });

      if (tipo === 'receita') totalReceitas += valor;
      else totalDespesas += valor;
    }
  }

  return {
    type: 'csv',
    linhas: lines.length - 1,
    colunas: headers,
    transacoes: items.length,
    receitas: totalReceitas,
    despesas: totalDespesas,
    items: items.slice(0, 50),
    summary: `📊 CSV: ${items.length} itens | Receitas: R$ ${totalReceitas.toFixed(2)} | Despesas: R$ ${totalDespesas.toFixed(2)}`
  };
}

// Parse PDF (basic text extraction)
function parsePDF(content) {
  // Simple PDF text extraction - looks for text between stream/endstream
  const text = content.toString('latin1');

  // Try to find monetary values
  const moneyRegex = /R\$\s*[\d.,]+|\d{1,3}(?:\.\d{3})*,\d{2}/g;
  const values = text.match(moneyRegex) || [];

  // Try to find dates
  const dateRegex = /\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}/g;
  const dates = text.match(dateRegex) || [];

  // Parse unique values
  const parsedValues = [...new Set(values)].map(v => {
    const num = parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }).filter(v => v > 0);

  const total = parsedValues.reduce((s, v) => s + v, 0);

  return {
    type: 'pdf',
    valores_encontrados: parsedValues.length,
    datas_encontradas: dates.length,
    valores: parsedValues.slice(0, 20),
    datas: [...new Set(dates)].slice(0, 10),
    total_estimado: total,
    summary: `📕 PDF: ${parsedValues.length} valores encontrados | Total estimado: R$ ${total.toFixed(2)}`,
    nota: 'PDFs complexos podem requerer análise manual. Considere usar OFX ou CSV para melhor precisão.'
  };
}

// Main handler
exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const { files, fields } = await parseMultipartForm(event);

    if (files.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nenhum arquivo enviado' })
      };
    }

    const file = files[0];
    const filename = file.filename.toLowerCase();
    let result;

    if (filename.endsWith('.ofx')) {
      result = parseOFX(file.content);
    } else if (filename.endsWith('.csv')) {
      result = parseCSV(file.content);
    } else if (filename.endsWith('.pdf')) {
      result = parsePDF(file.content);
    } else if (filename.endsWith('.xls') || filename.endsWith('.xlsx')) {
      result = {
        type: 'excel',
        summary: '📗 Excel: Processamento de arquivos Excel em desenvolvimento. Por favor, exporte como CSV.',
        nota: 'Converta o arquivo para CSV no Excel (Salvar Como > CSV) para melhor compatibilidade.'
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Formato não suportado' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        filename: file.filename,
        ...result
      })
    };

  } catch (error) {
    console.error('Erro ao processar arquivo:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
