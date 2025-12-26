/**
 * Chat Widget - Agente Financeiro IA Starken
 * Widget de chat flutuante para interação com o agente financeiro
 */

const ChatWidget = {
  isOpen: false,
  isLoading: false,
  messages: [],
  conversationHistory: [],

  // Sugestões contextuais por página
  suggestions: {
    'index.html': [
      'Como está o resultado deste mês?',
      'Qual o lucro acumulado?',
      'Compare Starken vs Alpha'
    ],
    'contas-pagar.html': [
      'Quais contas vencem essa semana?',
      'Quanto já foi pago este mês?',
      'Liste as despesas pendentes'
    ],
    'contas-receber.html': [
      'Quanto tenho a receber?',
      'Quais clientes estão em atraso?',
      'Receitas por empresa'
    ],
    'fluxo-caixa.html': [
      'Projete o fluxo de caixa',
      'Quando o caixa fica apertado?',
      'Qual a previsão de saldo?'
    ],
    'default': [
      'Resumo financeiro do mês',
      'Contas a vencer',
      'Compare os últimos 2 meses'
    ]
  },

  // Inicializar o widget
  init() {
    this.injectStyles();
    this.createWidget();
    this.bindEvents();
    this.loadHistory();
  },

  // Injetar estilos CSS
  injectStyles() {
    const styles = `
      .chat-widget-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .chat-widget-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4A6B54 0%, #5d8a6b 100%);
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(74, 107, 84, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;
      }

      .chat-widget-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 25px rgba(74, 107, 84, 0.5);
      }

      .chat-widget-button svg {
        width: 28px;
        height: 28px;
        fill: white;
      }

      .chat-widget-button .notification-dot {
        position: absolute;
        top: 0;
        right: 0;
        width: 14px;
        height: 14px;
        background: #e74c3c;
        border-radius: 50%;
        border: 2px solid white;
        display: none;
      }

      .chat-widget-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 400px;
        height: 550px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        display: none;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.3s ease;
      }

      .chat-widget-window.open {
        display: flex;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .chat-widget-header {
        background: linear-gradient(135deg, #4A6B54 0%, #5d8a6b 100%);
        color: white;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .chat-widget-header-avatar {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
      }

      .chat-widget-header-info {
        flex: 1;
      }

      .chat-widget-header-title {
        font-weight: 600;
        font-size: 16px;
      }

      .chat-widget-header-status {
        font-size: 12px;
        opacity: 0.8;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .chat-widget-header-status .status-dot {
        width: 8px;
        height: 8px;
        background: #2ecc71;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .chat-widget-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .chat-widget-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .chat-widget-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        background: #f8f9fa;
      }

      .chat-message {
        max-width: 85%;
        padding: 12px 16px;
        border-radius: 16px;
        font-size: 14px;
        line-height: 1.5;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .chat-message.user {
        background: linear-gradient(135deg, #4A6B54 0%, #5d8a6b 100%);
        color: white;
        align-self: flex-end;
        border-bottom-right-radius: 4px;
      }

      .chat-message.assistant {
        background: white;
        color: #333;
        align-self: flex-start;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .chat-message.assistant pre {
        background: #f1f3f5;
        padding: 10px;
        border-radius: 8px;
        overflow-x: auto;
        font-size: 12px;
        margin: 8px 0;
      }

      .chat-message-time {
        font-size: 10px;
        opacity: 0.6;
        margin-top: 6px;
      }

      .chat-suggestions {
        padding: 15px 20px;
        background: white;
        border-top: 1px solid #e9ecef;
      }

      .chat-suggestions-title {
        font-size: 11px;
        color: #868e96;
        margin-bottom: 10px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .chat-suggestions-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .chat-suggestion-btn {
        background: #e9ecef;
        border: none;
        padding: 8px 14px;
        border-radius: 20px;
        font-size: 12px;
        color: #495057;
        cursor: pointer;
        transition: all 0.2s;
      }

      .chat-suggestion-btn:hover {
        background: #4A6B54;
        color: white;
      }

      .chat-widget-input-area {
        padding: 15px 20px;
        background: white;
        border-top: 1px solid #e9ecef;
        display: flex;
        gap: 10px;
      }

      .chat-widget-input {
        flex: 1;
        padding: 12px 16px;
        border: 2px solid #e9ecef;
        border-radius: 24px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      .chat-widget-input:focus {
        border-color: #4A6B54;
      }

      .chat-widget-send {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4A6B54 0%, #5d8a6b 100%);
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s;
      }

      .chat-widget-send:hover {
        transform: scale(1.05);
      }

      .chat-widget-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .chat-widget-send svg {
        width: 20px;
        height: 20px;
        fill: white;
      }

      .chat-typing-indicator {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 12px 16px;
        background: white;
        border-radius: 16px;
        border-bottom-left-radius: 4px;
        align-self: flex-start;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .chat-typing-indicator span {
        width: 8px;
        height: 8px;
        background: #4A6B54;
        border-radius: 50%;
        animation: typingBounce 1.4s infinite ease-in-out;
      }

      .chat-typing-indicator span:nth-child(1) { animation-delay: 0s; }
      .chat-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
      .chat-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

      @keyframes typingBounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40% { transform: scale(1); opacity: 1; }
      }

      .chat-welcome {
        text-align: center;
        padding: 30px 20px;
      }

      .chat-welcome-icon {
        font-size: 48px;
        margin-bottom: 15px;
      }

      .chat-welcome h3 {
        color: #4A6B54;
        margin-bottom: 8px;
        font-size: 18px;
      }

      .chat-welcome p {
        color: #868e96;
        font-size: 14px;
        line-height: 1.5;
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .chat-widget-window {
          background: #1a1a2e;
        }
        .chat-widget-messages {
          background: #16213e;
        }
        .chat-message.assistant {
          background: #1a1a2e;
          color: #e9ecef;
        }
        .chat-suggestions {
          background: #1a1a2e;
          border-color: #2a2a3e;
        }
        .chat-suggestion-btn {
          background: #2a2a3e;
          color: #e9ecef;
        }
        .chat-widget-input-area {
          background: #1a1a2e;
          border-color: #2a2a3e;
        }
        .chat-widget-input {
          background: #16213e;
          border-color: #2a2a3e;
          color: #e9ecef;
        }
        .chat-welcome h3 {
          color: #7A9B84;
        }
        .chat-welcome p {
          color: #868e96;
        }
      }

      /* Responsive */
      @media (max-width: 480px) {
        .chat-widget-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
          bottom: 80px;
          right: 0;
          left: 20px;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  },

  // Criar estrutura HTML do widget
  createWidget() {
    const container = document.createElement('div');
    container.className = 'chat-widget-container';
    container.innerHTML = `
      <div class="chat-widget-window" id="chatWindow">
        <div class="chat-widget-header">
          <div class="chat-widget-header-avatar">🤖</div>
          <div class="chat-widget-header-info">
            <div class="chat-widget-header-title">Agente Financeiro IA</div>
            <div class="chat-widget-header-status">
              <span class="status-dot"></span>
              Online - Pronto para ajudar
            </div>
          </div>
          <button class="chat-widget-close" onclick="ChatWidget.toggle()">✕</button>
        </div>
        <div class="chat-widget-messages" id="chatMessages">
          <div class="chat-welcome">
            <div class="chat-welcome-icon">🤖</div>
            <h3>Olá! Sou seu Agente Financeiro</h3>
            <p>Posso ajudar com consultas financeiras, análises de despesas e receitas, vencimentos e muito mais.</p>
          </div>
        </div>
        <div class="chat-suggestions" id="chatSuggestions">
          <div class="chat-suggestions-title">Sugestões</div>
          <div class="chat-suggestions-list" id="suggestionsList"></div>
        </div>
        <div class="chat-widget-input-area">
          <input type="text" class="chat-widget-input" id="chatInput" placeholder="Digite sua pergunta..." />
          <button class="chat-widget-send" id="chatSend" onclick="ChatWidget.sendMessage()">
            <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
      <button class="chat-widget-button" onclick="ChatWidget.toggle()">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        <span class="notification-dot" id="notificationDot"></span>
      </button>
    `;
    document.body.appendChild(container);

    this.updateSuggestions();
  },

  // Vincular eventos
  bindEvents() {
    const input = document.getElementById('chatInput');
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  },

  // Alternar visibilidade do chat
  toggle() {
    this.isOpen = !this.isOpen;
    const window = document.getElementById('chatWindow');
    window.classList.toggle('open', this.isOpen);

    if (this.isOpen) {
      document.getElementById('chatInput').focus();
      document.getElementById('notificationDot').style.display = 'none';
    }
  },

  // Atualizar sugestões baseadas na página atual
  updateSuggestions() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const suggestions = this.suggestions[currentPage] || this.suggestions['default'];

    const list = document.getElementById('suggestionsList');
    list.innerHTML = suggestions.map(s =>
      `<button class="chat-suggestion-btn" onclick="ChatWidget.sendSuggestion('${s}')">${s}</button>`
    ).join('');
  },

  // Enviar sugestão
  sendSuggestion(text) {
    document.getElementById('chatInput').value = text;
    this.sendMessage();
  },

  // Adicionar mensagem ao chat
  addMessage(content, role) {
    const messagesContainer = document.getElementById('chatMessages');

    // Remover welcome se for a primeira mensagem
    const welcome = messagesContainer.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${role}`;
    messageEl.innerHTML = `
      <div class="chat-message-content">${this.formatMessage(content)}</div>
      <div class="chat-message-time">${time}</div>
    `;

    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    this.messages.push({ role, content, time });
    this.saveHistory();
  },

  // Formatar mensagem (suporte básico a markdown)
  formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
      .replace(/R\$ ([\d.,]+)/g, '<strong>R$ $1</strong>');
  },

  // Mostrar indicador de digitação
  showTyping() {
    const messagesContainer = document.getElementById('chatMessages');
    const typingEl = document.createElement('div');
    typingEl.className = 'chat-typing-indicator';
    typingEl.id = 'typingIndicator';
    typingEl.innerHTML = '<span></span><span></span><span></span>';
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  // Esconder indicador de digitação
  hideTyping() {
    const typing = document.getElementById('typingIndicator');
    if (typing) typing.remove();
  },

  // Enviar mensagem
  async sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message || this.isLoading) return;

    // Adicionar mensagem do usuário
    this.addMessage(message, 'user');
    input.value = '';

    // Atualizar histórico de conversa para o Claude
    this.conversationHistory.push({ role: 'user', content: message });

    // Mostrar indicador de digitação
    this.showTyping();
    this.isLoading = true;
    document.getElementById('chatSend').disabled = true;

    try {
      const response = await fetch('/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          conversationHistory: this.conversationHistory.slice(-10) // Últimas 10 mensagens
        })
      });

      const data = await response.json();

      this.hideTyping();

      if (data.success) {
        this.addMessage(data.response, 'assistant');
        this.conversationHistory.push({ role: 'assistant', content: data.response });
      } else {
        this.addMessage('Desculpe, ocorreu um erro. Tente novamente.', 'assistant');
      }
    } catch (error) {
      this.hideTyping();
      this.addMessage('Erro de conexão. Verifique sua internet.', 'assistant');
      console.error('Chat error:', error);
    } finally {
      this.isLoading = false;
      document.getElementById('chatSend').disabled = false;
    }
  },

  // Salvar histórico no localStorage
  saveHistory() {
    try {
      localStorage.setItem('chatWidgetHistory', JSON.stringify({
        messages: this.messages.slice(-50), // Últimas 50 mensagens
        conversationHistory: this.conversationHistory.slice(-10)
      }));
    } catch (e) {
      console.warn('Não foi possível salvar histórico do chat');
    }
  },

  // Carregar histórico do localStorage
  loadHistory() {
    try {
      const saved = localStorage.getItem('chatWidgetHistory');
      if (saved) {
        const data = JSON.parse(saved);
        // Só carrega se foi hoje
        const today = new Date().toDateString();
        const lastMessage = data.messages[data.messages.length - 1];
        if (lastMessage) {
          this.messages = data.messages;
          this.conversationHistory = data.conversationHistory || [];

          // Re-renderizar mensagens
          const messagesContainer = document.getElementById('chatMessages');
          const welcome = messagesContainer.querySelector('.chat-welcome');
          if (welcome && this.messages.length > 0) {
            welcome.remove();
          }

          this.messages.forEach(msg => {
            const messageEl = document.createElement('div');
            messageEl.className = `chat-message ${msg.role}`;
            messageEl.innerHTML = `
              <div class="chat-message-content">${this.formatMessage(msg.content)}</div>
              <div class="chat-message-time">${msg.time}</div>
            `;
            messagesContainer.appendChild(messageEl);
          });
        }
      }
    } catch (e) {
      console.warn('Não foi possível carregar histórico do chat');
    }
  },

  // Limpar histórico
  clearHistory() {
    this.messages = [];
    this.conversationHistory = [];
    localStorage.removeItem('chatWidgetHistory');

    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = `
      <div class="chat-welcome">
        <div class="chat-welcome-icon">🤖</div>
        <h3>Olá! Sou seu Agente Financeiro</h3>
        <p>Posso ajudar com consultas financeiras, análises de despesas e receitas, vencimentos e muito mais.</p>
      </div>
    `;
  }
};

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ChatWidget.init());
} else {
  ChatWidget.init();
}
