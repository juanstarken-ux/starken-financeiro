/**
 * Sistema de Logs Estruturado
 * Fornece logging melhor que console.log/console.error
 */

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

/**
 * Formata um log estruturado
 * @param {string} level - Nível do log
 * @param {string} message - Mensagem principal
 * @param {object} metadata - Dados adicionais
 * @returns {object} Log formatado
 */
function formatLog(level, message, metadata = {}) {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  };
}

/**
 * Logger class
 */
class Logger {
  constructor(context = '') {
    this.context = context;
  }

  /**
   * Log de erro
   * @param {string} message - Mensagem de erro
   * @param {Error|object} error - Objeto de erro ou metadata
   * @param {object} metadata - Dados adicionais
   */
  error(message, error = null, metadata = {}) {
    const log = formatLog(LOG_LEVELS.ERROR, message, {
      context: this.context,
      ...metadata
    });

    if (error) {
      if (error instanceof Error) {
        log.error = {
          name: error.name,
          message: error.message,
          stack: error.stack
        };
      } else {
        log.error = error;
      }
    }

    console.error(JSON.stringify(log));
    return log;
  }

  /**
   * Log de aviso
   * @param {string} message - Mensagem de aviso
   * @param {object} metadata - Dados adicionais
   */
  warn(message, metadata = {}) {
    const log = formatLog(LOG_LEVELS.WARN, message, {
      context: this.context,
      ...metadata
    });

    console.warn(JSON.stringify(log));
    return log;
  }

  /**
   * Log de informação
   * @param {string} message - Mensagem informativa
   * @param {object} metadata - Dados adicionais
   */
  info(message, metadata = {}) {
    const log = formatLog(LOG_LEVELS.INFO, message, {
      context: this.context,
      ...metadata
    });

    console.log(JSON.stringify(log));
    return log;
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   * @param {string} message - Mensagem de debug
   * @param {object} metadata - Dados adicionais
   */
  debug(message, metadata = {}) {
    if (process.env.NODE_ENV === 'production') return;

    const log = formatLog(LOG_LEVELS.DEBUG, message, {
      context: this.context,
      ...metadata
    });

    console.log(JSON.stringify(log));
    return log;
  }

  /**
   * Log de requisição HTTP
   * @param {object} event - Evento Netlify
   * @param {number} statusCode - Status code da resposta
   * @param {number} duration - Duração em ms
   */
  request(event, statusCode, duration) {
    const log = formatLog(LOG_LEVELS.INFO, 'HTTP Request', {
      context: this.context,
      request: {
        method: event.httpMethod,
        path: event.path,
        origin: event.headers.origin || 'unknown',
        userAgent: event.headers['user-agent'],
        ip: event.headers['x-nf-client-connection-ip'] || 'unknown'
      },
      response: {
        statusCode,
        duration: `${duration}ms`
      }
    });

    console.log(JSON.stringify(log));
    return log;
  }

  /**
   * Log de operação do Prisma
   * @param {string} operation - Operação (create, update, delete, etc)
   * @param {string} model - Model do Prisma
   * @param {object} metadata - Dados adicionais
   */
  prisma(operation, model, metadata = {}) {
    const log = formatLog(LOG_LEVELS.INFO, `Prisma ${operation}`, {
      context: this.context,
      prisma: {
        operation,
        model,
        ...metadata
      }
    });

    console.log(JSON.stringify(log));
    return log;
  }

  /**
   * Log de validação de dados
   * @param {boolean} success - Se validação passou
   * @param {object} details - Detalhes da validação
   */
  validation(success, details = {}) {
    const level = success ? LOG_LEVELS.INFO : LOG_LEVELS.WARN;
    const message = success ? 'Validation passed' : 'Validation failed';

    const log = formatLog(level, message, {
      context: this.context,
      validation: {
        success,
        ...details
      }
    });

    if (success) {
      console.log(JSON.stringify(log));
    } else {
      console.warn(JSON.stringify(log));
    }

    return log;
  }
}

/**
 * Cria uma instância do logger com contexto
 * @param {string} context - Contexto do logger (ex: "agent", "sync-data")
 * @returns {Logger}
 */
function createLogger(context) {
  return new Logger(context);
}

module.exports = {
  createLogger,
  Logger,
  LOG_LEVELS
};
