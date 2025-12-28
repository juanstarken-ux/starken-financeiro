// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Parse multipart form data manually
function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    try {
      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
      const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

      if (!boundaryMatch) {
        reject(new Error('No boundary found in content-type'));
        return;
      }

      const boundary = boundaryMatch[1] || boundaryMatch[2];
      const body = event.isBase64Encoded
        ? Buffer.from(event.body, 'base64')
        : Buffer.from(event.body, 'binary');

      const bodyStr = body.toString('binary');
      const parts = bodyStr.split('--' + boundary);

      const result = { files: [], fields: {} };

      for (const part of parts) {
        if (part.trim() === '' || part.trim() === '--') continue;

        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;

        const headerSection = part.substring(0, headerEnd);
        const content = part.substring(headerEnd + 4);

        // Remove trailing \r\n
        const cleanContent = content.replace(/\r\n$/, '');

        const filenameMatch = headerSection.match(/filename="([^"]+)"/);
        const nameMatch = headerSection.match(/name="([^"]+)"/);

        if (filenameMatch && nameMatch) {
          result.files.push({
            fieldname: nameMatch[1],
            filename: filenameMatch[1],
            content: Buffer.from(cleanContent, 'binary')
          });
        } else if (nameMatch) {
          result.fields[nameMatch[1]] = cleanContent.trim();
        }
      }

      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

// Parse OFX file (extrato bancário)
function parseOFX(content) {
  const text = content.toString('utf-8');
  const transactions = [];

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
      transactions.push({
        tipo: amount >= 0 ? 'receita' : 'despesa',
        valor: Math.abs(amount),
        descricao: memo || (amount >= 0 ? 'Crédito' : 'Débito'),
        data: dtPosted ? formatOFXDate(dtPosted) : null,
        trnType
      });
    }
  }

  const totalReceitas = transactions.filter(t => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0);
  const totalDespesas = transactions.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);

  return {
    type: 'ofx',
    transacoes: transactions.length,
    receitas: totalReceitas,
    despesas: totalDespesas,
    items: transactions.slice(0, 50),
    summary: `🏦 Extrato OFX: ${transactions.length} transações | Entradas: R$ ${totalReceitas.toFixed(2)} | Saídas: R$ ${totalDespesas.toFixed(2)}`
  };
}

function formatOFXDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return null;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
}

// Parse CSV file
function parseCSV(content) {
  const text = content.toString('utf-8');
  const lines = text.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    return { type: 'csv', error: 'Arquivo vazio', items: [] };
  }

  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';
  const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/["']/g, ''));

  const findColumn = (keywords) => {
    return headers.findIndex(h => keywords.some(k => h.includes(k)));
  };

  const descCol = findColumn(['descricao', 'descrição', 'historico', 'histórico', 'nome', 'memo']);
  const valorCol = findColumn(['valor', 'value', 'amount', 'quantia']);
  const dataCol = findColumn(['data', 'date', 'vencimento']);
  const tipoCol = findColumn(['tipo', 'type', 'natureza']);

  const items = [];
  let totalReceitas = 0;
  let totalDespesas = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/["']/g, ''));
    if (values.length < 2) continue;

    let valor = valorCol >= 0 ? parseFloat(values[valorCol]?.replace(/[^\d.,-]/g, '').replace(',', '.')) : 0;
    const descricao = descCol >= 0 ? values[descCol] : values[0];
    const tipoRaw = tipoCol >= 0 ? values[tipoCol]?.toLowerCase() : '';

    let tipo = 'despesa';
    if (tipoRaw.includes('credit') || tipoRaw.includes('receita') || valor > 0) {
      tipo = 'receita';
    }

    valor = Math.abs(valor);
    if (valor > 0) {
      items.push({ tipo, valor, descricao });
      if (tipo === 'receita') totalReceitas += valor;
      else totalDespesas += valor;
    }
  }

  return {
    type: 'csv',
    transacoes: items.length,
    receitas: totalReceitas,
    despesas: totalDespesas,
    items: items.slice(0, 50),
    summary: `📊 CSV: ${items.length} itens | Receitas: R$ ${totalReceitas.toFixed(2)} | Despesas: R$ ${totalDespesas.toFixed(2)}`
  };
}

// Parse PDF file (extração básica)
async function parsePDF(content) {
  try {
    // Tentar usar pdf-parse
    const pdf = require('pdf-parse');
    const data = await pdf(content);
    const text = data.text;

    // Extrair valores monetários
    const moneyRegex = /R?\$?\s*(\d{1,3}(?:\.\d{3})*,\d{2})/g;
    const transactions = [];

    const lines = text.split('\n');
    const creditKeywords = ['credito', 'crédito', 'deposito', 'pix recebid', 'ted recebid', 'transferencia recebid'];
    const debitKeywords = ['debito', 'débito', 'pagamento', 'pix enviad', 'saque', 'tarifa', 'taxa'];

    for (const line of lines) {
      const lineLower = line.toLowerCase();
      const valueMatch = line.match(/(\d{1,3}(?:\.\d{3})*,\d{2})/);

      if (!valueMatch) continue;

      const valor = parseFloat(valueMatch[1].replace(/\./g, '').replace(',', '.'));
      if (isNaN(valor) || valor <= 0 || valor > 10000000) continue;

      let tipo = 'indefinido';
      if (creditKeywords.some(k => lineLower.includes(k))) tipo = 'receita';
      else if (debitKeywords.some(k => lineLower.includes(k))) tipo = 'despesa';

      const descricao = line.replace(valueMatch[0], '').trim().substring(0, 50);
      if (descricao.length > 3) {
        transactions.push({ tipo, valor, descricao });
      }
    }

    const receitas = transactions.filter(t => t.tipo === 'receita');
    const despesas = transactions.filter(t => t.tipo === 'despesa');
    const totalReceitas = receitas.reduce((s, t) => s + t.valor, 0);
    const totalDespesas = despesas.reduce((s, t) => s + t.valor, 0);

    return {
      type: 'pdf',
      paginas: data.numpages,
      transacoes: transactions.length,
      receitas: totalReceitas,
      despesas: totalDespesas,
      items: transactions.slice(0, 50),
      summary: `📕 PDF (${data.numpages} pág): ${transactions.length} transações | Entradas: R$ ${totalReceitas.toFixed(2)} | Saídas: R$ ${totalDespesas.toFixed(2)}`
    };
  } catch (error) {
    console.error('PDF parse error:', error.message);

    // Fallback: extração básica do buffer
    const text = content.toString('latin1');
    const moneyRegex = /\d{1,3}(?:\.\d{3})*,\d{2}/g;
    const values = (text.match(moneyRegex) || [])
      .map(v => parseFloat(v.replace(/\./g, '').replace(',', '.')))
      .filter(v => v > 0 && v < 10000000);

    const total = values.reduce((s, v) => s + v, 0);

    return {
      type: 'pdf',
      error: 'Extração limitada',
      valores_encontrados: values.length,
      total_estimado: total,
      summary: `📕 PDF: ${values.length} valores encontrados | Total: R$ ${total.toFixed(2)}`,
      nota: 'Para melhor precisão, exporte o extrato em OFX ou CSV do seu banco.'
    };
  }
}

// Main handler
exports.handler = async (event) => {
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
    console.log('Processing upload...');

    const { files, fields } = await parseMultipartForm(event);
    console.log('Files received:', files.length);

    if (files.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nenhum arquivo enviado' })
      };
    }

    const file = files[0];
    const filename = file.filename.toLowerCase();
    console.log('Processing file:', filename, 'Size:', file.content.length);

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
        summary: '📗 Excel: Exporte como CSV para processar.',
        nota: 'No Excel: Arquivo > Salvar Como > CSV'
      };
    } else {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Formato não suportado. Use PDF, OFX ou CSV.' })
      };
    }

    console.log('Processing complete:', result.type);

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
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Erro ao processar arquivo: ' + error.message,
        nota: 'Tente um arquivo menor ou em formato OFX/CSV.'
      })
    };
  }
};
