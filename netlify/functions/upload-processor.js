// Headers CORS
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Keywords para identificar tipo de transação
const despesaKeywords = [
  'pagamento', 'pag ', 'pgto', 'debito', 'débito', 'saque', 'tarifa', 'taxa',
  'transferencia enviada', 'pix enviado', 'ted enviado', 'doc enviado',
  'compra', 'fatura', 'boleto', 'imposto', 'darf', 'gps', 'inss', 'fgts',
  'aluguel', 'energia', 'luz', 'agua', 'água', 'telefone', 'internet',
  'salario', 'salário', 'folha', 'funcionario', 'funcionário', 'prolabore',
  'fornecedor', 'material', 'equipamento', 'software', 'licença',
  'despesa', 'custo', 'gasto', 'saida', 'saída', 'debitar'
];

const receitaKeywords = [
  'credito', 'crédito', 'deposito', 'depósito', 'entrada', 'recebimento',
  'pix recebido', 'ted recebido', 'transferencia recebida',
  'venda', 'faturamento', 'receita', 'rendimento', 'juros recebidos',
  'cliente', 'pagou', 'recebido', 'creditar'
];

// Detectar tipo baseado na descrição
function detectTipo(descricao, valorOriginal) {
  const desc = (descricao || '').toLowerCase();

  // Primeiro verifica keywords de despesa
  if (despesaKeywords.some(k => desc.includes(k))) {
    return 'despesa';
  }

  // Depois keywords de receita
  if (receitaKeywords.some(k => desc.includes(k))) {
    return 'receita';
  }

  // Se valor é negativo, é despesa
  if (valorOriginal < 0) {
    return 'despesa';
  }

  // Default: indefinido para o usuário categorizar
  return 'indefinido';
}

// Parse multipart form data manually
function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    try {
      const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
      console.log('Content-Type:', contentType);

      const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);

      if (!boundaryMatch) {
        reject(new Error('No boundary found in content-type: ' + contentType));
        return;
      }

      const boundary = boundaryMatch[1] || boundaryMatch[2];

      let body;
      if (event.isBase64Encoded) {
        body = Buffer.from(event.body, 'base64');
      } else {
        body = Buffer.from(event.body, 'utf-8');
      }

      const bodyStr = body.toString('binary');
      const parts = bodyStr.split('--' + boundary);

      const result = { files: [], fields: {} };

      for (const part of parts) {
        if (part.trim() === '' || part.trim() === '--') continue;

        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd === -1) continue;

        const headerSection = part.substring(0, headerEnd);
        const content = part.substring(headerEnd + 4);

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
      console.error('Multipart parse error:', error);
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
      const descricao = memo || (amount >= 0 ? 'Crédito' : 'Débito');

      transactions.push({
        tipo: amount >= 0 ? 'receita' : 'despesa',
        valor: Math.abs(amount),
        descricao: descricao,
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
    items: transactions, // Retornar TODAS as transações
    summary: `🏦 Extrato OFX: ${transactions.length} transações | Entradas: R$ ${totalReceitas.toFixed(2)} | Saídas: R$ ${totalDespesas.toFixed(2)}`
  };
}

function formatOFXDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return null;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
}

// Parse CSV file - MELHORADO
function parseCSV(content) {
  const text = content.toString('utf-8');
  const lines = text.split(/\r?\n/).filter(line => line.trim());

  if (lines.length === 0) {
    return { type: 'csv', error: 'Arquivo vazio', items: [] };
  }

  const firstLine = lines[0];
  const delimiter = firstLine.includes(';') ? ';' : ',';
  const headers = firstLine.split(delimiter).map(h => h.trim().toLowerCase().replace(/["']/g, ''));

  console.log('CSV Headers:', headers);
  console.log('CSV Delimiter:', delimiter);
  console.log('CSV Lines:', lines.length);

  const findColumn = (keywords) => {
    return headers.findIndex(h => keywords.some(k => h.includes(k)));
  };

  // Encontrar colunas
  const descCol = findColumn(['descricao', 'descrição', 'historico', 'histórico', 'nome', 'memo', 'lancamento', 'lançamento']);
  const valorCol = findColumn(['valor', 'value', 'amount', 'quantia', 'total']);
  const dataCol = findColumn(['data', 'date', 'vencimento', 'dt']);
  const tipoCol = findColumn(['tipo', 'type', 'natureza', 'categoria', 'category']);
  const categoriaCol = findColumn(['categoria', 'category', 'classificacao', 'classificação']);

  console.log('Columns found - desc:', descCol, 'valor:', valorCol, 'data:', dataCol, 'tipo:', tipoCol);

  const items = [];
  let totalReceitas = 0;
  let totalDespesas = 0;
  let totalIndefinido = 0;

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/["']/g, ''));
    if (values.length < 2) continue;

    // Pegar valor original (pode ser negativo)
    let valorStr = valorCol >= 0 ? values[valorCol] : '';
    let valorOriginal = parseFloat(valorStr?.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;

    const descricao = descCol >= 0 ? values[descCol] : values[0];
    const tipoRaw = tipoCol >= 0 ? values[tipoCol]?.toLowerCase() : '';
    const categoria = categoriaCol >= 0 ? values[categoriaCol] : '';
    const data = dataCol >= 0 ? values[dataCol] : '';

    // Determinar tipo
    let tipo;

    // Se tem coluna de tipo explícita
    if (tipoRaw) {
      if (tipoRaw.includes('credit') || tipoRaw.includes('receita') || tipoRaw.includes('entrada')) {
        tipo = 'receita';
      } else if (tipoRaw.includes('debit') || tipoRaw.includes('despesa') || tipoRaw.includes('saida') || tipoRaw.includes('saída')) {
        tipo = 'despesa';
      }
    }

    // Se não determinou pelo tipo, usa detecção inteligente
    if (!tipo) {
      tipo = detectTipo(descricao + ' ' + categoria, valorOriginal);
    }

    const valor = Math.abs(valorOriginal);

    if (valor > 0) {
      items.push({
        tipo,
        valor,
        descricao,
        categoria: categoria || null,
        data: data || null
      });

      if (tipo === 'receita') totalReceitas += valor;
      else if (tipo === 'despesa') totalDespesas += valor;
      else totalIndefinido += valor;
    }
  }

  // Agrupar por categoria se houver
  const porCategoria = {};
  items.forEach(item => {
    const cat = item.categoria || item.descricao?.split(' ')[0] || 'Outros';
    if (!porCategoria[cat]) porCategoria[cat] = { receitas: 0, despesas: 0, count: 0 };
    porCategoria[cat].count++;
    if (item.tipo === 'receita') porCategoria[cat].receitas += item.valor;
    else if (item.tipo === 'despesa') porCategoria[cat].despesas += item.valor;
  });

  const saldo = totalReceitas - totalDespesas;
  const summaryParts = [`📊 CSV: ${items.length} transações`];
  if (totalReceitas > 0) summaryParts.push(`Entradas: R$ ${totalReceitas.toFixed(2)}`);
  if (totalDespesas > 0) summaryParts.push(`Saídas: R$ ${totalDespesas.toFixed(2)}`);
  if (totalIndefinido > 0) summaryParts.push(`Não classificado: R$ ${totalIndefinido.toFixed(2)}`);
  summaryParts.push(`Saldo: R$ ${saldo.toFixed(2)}`);

  return {
    type: 'csv',
    transacoes: items.length,
    receitas: totalReceitas,
    despesas: totalDespesas,
    indefinido: totalIndefinido,
    saldo: saldo,
    porCategoria: porCategoria,
    items: items, // Retornar TODAS as transações
    summary: summaryParts.join(' | ')
  };
}

// Parse PDF file (extração melhorada)
async function parsePDF(content) {
  console.log('Starting PDF parsing, buffer size:', content.length);

  let text = '';
  let numPages = 0;

  // Tentar pdf-parse primeiro
  try {
    const pdf = require('pdf-parse');
    const data = await pdf(content);
    text = data.text || '';
    numPages = data.numpages || 1;
    console.log('pdf-parse success, text length:', text.length);
  } catch (error) {
    console.log('pdf-parse failed:', error.message);
  }

  // Se pdf-parse falhou ou retornou vazio, tentar extração do buffer
  if (!text || text.trim().length < 50) {
    console.log('Trying buffer extraction...');

    // Tentar diferentes encodings
    const encodings = ['utf-8', 'latin1', 'ascii'];
    for (const enc of encodings) {
      try {
        const bufText = content.toString(enc);
        // Procurar por padrões de texto legível
        if (bufText.length > text.length) {
          text = bufText;
        }
      } catch (e) {}
    }
  }

  console.log('Final text length:', text.length);
  console.log('Text sample:', text.substring(0, 1000));

  // Buscar valores monetários em múltiplos formatos
  const transactions = [];

  // Padrões de valores monetários brasileiros
  const patterns = [
    /(\d{1,3}(?:\.\d{3})*,\d{2})/g,           // 1.234,56
    /R\$\s*(\d{1,3}(?:\.\d{3})*,\d{2})/gi,    // R$ 1.234,56
    /(\d+,\d{2})/g,                            // 123,45
    /(\d{1,3}(?:,\d{3})*\.\d{2})/g            // 1,234.56 (formato US)
  ];

  const foundValues = new Set();

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      let valueStr = match[1] || match[0];
      // Normalizar para número
      let valor;
      if (valueStr.includes(',') && valueStr.includes('.')) {
        // Formato brasileiro: 1.234,56
        valor = parseFloat(valueStr.replace(/\./g, '').replace(',', '.'));
      } else if (valueStr.includes(',')) {
        // Pode ser 1234,56 ou 1,234.56
        if (valueStr.indexOf(',') > valueStr.length - 4) {
          // Vírgula é decimal: 1234,56
          valor = parseFloat(valueStr.replace(',', '.'));
        } else {
          // Vírgula é milhar: 1,234
          valor = parseFloat(valueStr.replace(/,/g, ''));
        }
      } else {
        valor = parseFloat(valueStr);
      }

      if (!isNaN(valor) && valor > 0 && valor < 10000000) {
        const key = valor.toFixed(2);
        if (!foundValues.has(key)) {
          foundValues.add(key);

          // Tentar encontrar contexto próximo ao valor
          const idx = text.indexOf(match[0]);
          const context = text.substring(Math.max(0, idx - 100), idx + match[0].length + 50);
          const tipo = detectTipo(context, 0);

          transactions.push({
            tipo,
            valor,
            descricao: context.replace(match[0], '').trim().substring(0, 80).replace(/\s+/g, ' ')
          });
        }
      }
    }
  }

  // Ordenar por valor (maiores primeiro)
  transactions.sort((a, b) => b.valor - a.valor);

  const receitas = transactions.filter(t => t.tipo === 'receita');
  const despesas = transactions.filter(t => t.tipo === 'despesa');
  const indefinidas = transactions.filter(t => t.tipo === 'indefinido');

  const totalReceitas = receitas.reduce((s, t) => s + t.valor, 0);
  const totalDespesas = despesas.reduce((s, t) => s + t.valor, 0);
  const totalIndefinido = indefinidas.reduce((s, t) => s + t.valor, 0);

  // Se não encontrou nada, retornar mensagem útil
  if (transactions.length === 0) {
    return {
      type: 'pdf',
      transacoes: 0,
      receitas: 0,
      despesas: 0,
      items: [],
      summary: '📕 PDF: Não foi possível extrair transações automaticamente.',
      nota: '⚠️ Este PDF pode ser protegido ou escaneado. Para melhores resultados:\n' +
            '1. No Internet Banking, exporte o extrato em formato OFX\n' +
            '2. Ou exporte como CSV/Excel\n' +
            '3. Esses formatos permitem análise detalhada das transações'
    };
  }

  return {
    type: 'pdf',
    paginas: numPages,
    transacoes: transactions.length,
    receitas: totalReceitas,
    despesas: totalDespesas,
    indefinido: totalIndefinido,
    items: transactions.slice(0, 100),
    summary: `📕 PDF (${numPages} pág): ${transactions.length} valores | Entradas: R$ ${totalReceitas.toFixed(2)} | Saídas: R$ ${totalDespesas.toFixed(2)}`,
    nota: transactions.length < 10 ? 'Para análise mais completa, exporte o extrato em OFX ou CSV.' : null
  };
}

// Main handler
exports.handler = async (event) => {
  console.log('=== Upload Processor Started ===');

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
    console.log('Processing file:', filename, 'Size:', file.content.length, 'bytes');

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

    console.log('Processing complete:', result.type, 'Items:', result.transacoes || 0);

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
    console.error('Upload error:', error.message);

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
