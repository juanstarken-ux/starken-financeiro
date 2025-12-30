/**
 * Rate Limiter Simples (em memória)
 * Limita requisições por IP
 */

// Armazenamento em memória (resetado a cada cold start da function)
const requestCounts = new Map();

// Configuração
const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minuto
  MAX_REQUESTS: 30,      // 30 requisições por minuto
  MAX_REQUESTS_AGENT: 10 // 10 requisições por minuto para agent (usa Anthropic API)
};

/**
 * Limpa entradas antigas do mapa
 */
function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.windowStart > RATE_LIMIT.WINDOW_MS * 2) {
      requestCounts.delete(key);
    }
  }
}

/**
 * Verifica se o IP excedeu o limite de requisições
 * @param {string} ip - Endereço IP do cliente
 * @param {boolean} isAgentEndpoint - Se true, aplica limite mais restritivo
 * @returns {object} { allowed: boolean, remaining: number, resetIn: number }
 */
function checkRateLimit(ip, isAgentEndpoint = false) {
  const now = Date.now();
  const maxRequests = isAgentEndpoint ? RATE_LIMIT.MAX_REQUESTS_AGENT : RATE_LIMIT.MAX_REQUESTS;

  // Limpar entradas antigas periodicamente
  if (Math.random() < 0.01) {
    cleanupOldEntries();
  }

  // Buscar ou criar entrada para este IP
  let ipData = requestCounts.get(ip);

  if (!ipData || (now - ipData.windowStart) > RATE_LIMIT.WINDOW_MS) {
    // Nova janela de tempo
    ipData = {
      count: 0,
      windowStart: now
    };
    requestCounts.set(ip, ipData);
  }

  // Incrementar contador
  ipData.count++;

  // Calcular informações para retornar
  const remaining = Math.max(0, maxRequests - ipData.count);
  const resetIn = Math.ceil((ipData.windowStart + RATE_LIMIT.WINDOW_MS - now) / 1000);

  return {
    allowed: ipData.count <= maxRequests,
    remaining,
    resetIn,
    limit: maxRequests
  };
}

/**
 * Extrai IP do evento Netlify
 * @param {object} event - Evento da Netlify Function
 * @returns {string} IP do cliente
 */
function getClientIP(event) {
  // Netlify fornece o IP no header x-nf-client-connection-ip
  return event.headers['x-nf-client-connection-ip'] ||
         event.headers['x-forwarded-for']?.split(',')[0] ||
         event.headers['client-ip'] ||
         'unknown';
}

/**
 * Middleware para aplicar rate limiting
 * @param {object} event - Evento da Netlify Function
 * @param {object} headers - Headers da resposta
 * @param {boolean} isAgentEndpoint - Se é endpoint do agent
 * @returns {object|null} Response object se bloqueado, null se permitido
 */
function applyRateLimit(event, headers, isAgentEndpoint = false) {
  const ip = getClientIP(event);
  const rateLimit = checkRateLimit(ip, isAgentEndpoint);

  // Adicionar headers informativos
  const enhancedHeaders = {
    ...headers,
    'X-RateLimit-Limit': String(rateLimit.limit),
    'X-RateLimit-Remaining': String(rateLimit.remaining),
    'X-RateLimit-Reset': String(rateLimit.resetIn)
  };

  if (!rateLimit.allowed) {
    console.warn(`⚠️ Rate limit exceeded for IP: ${ip} (${isAgentEndpoint ? 'agent' : 'api'} endpoint)`);

    return {
      statusCode: 429,
      headers: {
        ...enhancedHeaders,
        'Retry-After': String(rateLimit.resetIn)
      },
      body: JSON.stringify({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${rateLimit.resetIn} seconds.`,
        limit: rateLimit.limit,
        resetIn: rateLimit.resetIn
      })
    };
  }

  // Retornar headers atualizados
  return {
    allowed: true,
    headers: enhancedHeaders
  };
}

module.exports = {
  applyRateLimit,
  getClientIP,
  checkRateLimit,
  RATE_LIMIT
};
