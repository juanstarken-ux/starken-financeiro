const Busboy = require('busboy');
const pdf = require('pdf-parse');

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

// Parse PDF (usando pdf-parse)
async function parsePDF(content) {
  try {
    const data = await pdf(content);
    const text = data.text;

    console.log('PDF Text extracted, length:', text.length);

    // Try to find monetary values (Brazilian format)
    const moneyRegex = /R\$\s*[\d.,]+|(?<!\d)[\d]{1,3}(?:\.[\d]{3})*,[\d]{2}(?!\d)/g;
    const allValues = text.match(moneyRegex) || [];

    // Try to find dates
    const dateRegex = /\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{2}|\d{4}-\d{2}-\d{2}/g;
    const dates = text.match(dateRegex) || [];

    // Parse lines to find transactions
    const lines = text.split('\n').filter(l => l.trim());
    const transactions = [];

    // Keywords for credits and debits
    const creditKeywords = ['credito', 'crédito', 'deposito', 'depósito', 'ted recebid', 'pix recebid', 'transferencia recebid', 'transferência recebid', 'resgate', 'estorno'];
    const debitKeywords = ['debito', 'débito', 'pagamento', 'pix enviad', 'ted enviad', 'transferencia enviad', 'transferência enviad', 'saque', 'tarifa', 'taxa', 'iof', 'compra'];

    for (const line of lines) {
      const lineLower = line.toLowerCase();

      // Find value in line
      const valueMatch = line.match(/(?<!\d)([\d]{1,3}(?:\.[\d]{3})*,[\d]{2})(?!\d)/);
      if (!valueMatch) continue;

      const valor = parseFloat(valueMatch[1].replace(/\./g, '').replace(',', '.'));
      if (isNaN(valor) || valor <= 0 || valor > 10000000) continue;

      // Find date in line
      const dateMatch = line.match(/(\d{2}\/\d{2}\/\d{4}|\d{2}\/\d{2}\/\d{2})/);
      const data = dateMatch ? dateMatch[1] : null;

      // Determine type
      let tipo = 'indefinido';
      if (creditKeywords.some(k => lineLower.includes(k))) {
        tipo = 'receita';
      } else if (debitKeywords.some(k => lineLower.includes(k))) {
        tipo = 'despesa';
      } else if (lineLower.includes(' c ') || lineLower.includes(' c\t') || line.includes('+')) {
        tipo = 'receita';
      } else if (lineLower.includes(' d ') || lineLower.includes(' d\t') || line.includes('-')) {
        tipo = 'despesa';
      }

      // Get description (first 50 chars, cleaned)
      const descricao = line.replace(valueMatch[0], '').replace(dateMatch?.[0] || '', '').trim().substring(0, 50);

      if (descricao.length > 3) {
        transactions.push({ tipo, valor, descricao, data });
      }
    }

    // Calculate totals
    const receitas = transactions.filter(t => t.tipo === 'receita');
    const despesas = transactions.filter(t => t.tipo === 'despesa');
    const indefinidos = transactions.filter(t => t.tipo === 'indefinido');

    const totalReceitas = receitas.reduce((s, t) => s + t.valor, 0);
    const totalDespesas = despesas.reduce((s, t) => s + t.valor, 0);
    const totalIndefinido = indefinidos.reduce((s, t) => s + t.valor, 0);

    // Parse unique values for fallback
    const parsedValues = [...new Set(allValues)].map(v => {
      const num = parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }).filter(v => v > 0 && v < 10000000);

    // Get saldo if found
    const saldoMatch = text.match(/saldo[:\s]*([\d.,]+)/i);
    const saldo = saldoMatch ? parseFloat(saldoMatch[1].replace(/\./g, '').replace(',', '.')) : null;

    return {
      type: 'pdf',
      paginas: data.numpages,
      transacoes_detectadas: transactions.length,
      receitas: { count: receitas.length, total: totalReceitas },
      despesas: { count: despesas.length, total: totalDespesas },
      indefinidos: { count: indefinidos.length, total: totalIndefinido },
      saldo_encontrado: saldo,
      valores_encontrados: parsedValues.length,
      datas_encontradas: [...new Set(dates)].length,
      items: transactions.slice(0, 100),
      summary: `📕 PDF (${data.numpages} pág): ${transactions.length} transações detectadas | Entradas: R$ ${totalReceitas.toFixed(2)} (${receitas.length}) | Saídas: R$ ${totalDespesas.toFixed(2)} (${despesas.length})${indefinidos.length > 0 ? ` | Indefinidos: ${indefinidos.length}` : ''}`,
      texto_extraido: text.substring(0, 500) + '...'
    };
  } catch (error) {
    console.error('Erro ao parsear PDF:', error);

    // Fallback to basic extraction
    const text = content.toString('latin1');
    const moneyRegex = /R\$\s*[\d.,]+|\d{1,3}(?:\.\d{3})*,\d{2}/g;
    const values = text.match(moneyRegex) || [];

    const parsedValues = [...new Set(values)].map(v => {
      const num = parseFloat(v.replace(/[R$\s.]/g, '').replace(',', '.'));
      return isNaN(num) ? 0 : num;
    }).filter(v => v > 0);

    return {
      type: 'pdf',
      error: 'Não foi possível extrair texto estruturado do PDF',
      valores_encontrados: parsedValues.length,
      valores: parsedValues.slice(0, 20),
      summary: `📕 PDF: Extração parcial - ${parsedValues.length} valores encontrados`,
      nota: 'Este PDF pode estar protegido ou em formato de imagem. Tente exportar o extrato em OFX ou CSV do seu banco.'
    };
  }
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
      result = await parsePDF(file.content);
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
