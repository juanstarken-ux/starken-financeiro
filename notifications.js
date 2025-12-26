// ============================================
// SISTEMA DE NOTIFICAÇÕES - STARKEN FINANCEIRO
// ============================================

const NotificationSystem = {
    alerts: [],
    unreadCount: 0,
    container: null,
    badge: null,
    panel: null,
    isOpen: false,

    // Inicializar sistema
    async init() {
        this.createUI();
        await this.fetchAlerts();
        this.startPolling();
    },

    // Criar interface de notificações
    createUI() {
        // Adicionar estilos
        const style = document.createElement('style');
        style.textContent = `
            .notification-bell {
                position: fixed;
                top: 20px;
                right: 30px;
                width: 50px;
                height: 50px;
                background: #4A6B54;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                z-index: 9999;
                transition: all 0.3s ease;
            }

            .notification-bell:hover {
                transform: scale(1.1);
                background: #3d5a46;
            }

            .notification-bell .bell-icon {
                font-size: 24px;
            }

            .notification-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: #e74c3c;
                color: white;
                font-size: 12px;
                font-weight: 700;
                min-width: 22px;
                height: 22px;
                border-radius: 11px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 6px;
                animation: pulse 2s infinite;
            }

            .notification-badge.hidden {
                display: none;
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .notification-panel {
                position: fixed;
                top: 80px;
                right: 30px;
                width: 400px;
                max-height: 500px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 9998;
                display: none;
                overflow: hidden;
            }

            .notification-panel.open {
                display: block;
                animation: slideIn 0.3s ease;
            }

            @keyframes slideIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .notification-header {
                padding: 20px;
                background: linear-gradient(135deg, #4A6B54 0%, #7A9B84 100%);
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .notification-header h3 {
                font-size: 18px;
                font-weight: 600;
            }

            .notification-count {
                background: rgba(255,255,255,0.2);
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 13px;
            }

            .notification-list {
                max-height: 350px;
                overflow-y: auto;
            }

            .notification-item {
                padding: 16px 20px;
                border-bottom: 1px solid #e1e8ed;
                display: flex;
                gap: 15px;
                transition: background 0.2s;
                cursor: pointer;
            }

            .notification-item:hover {
                background: #f5f7fa;
            }

            .notification-item.alta {
                border-left: 4px solid #e74c3c;
            }

            .notification-item.media {
                border-left: 4px solid #f39c12;
            }

            .notification-item.info {
                border-left: 4px solid #3498db;
            }

            .notification-icon {
                font-size: 24px;
                flex-shrink: 0;
            }

            .notification-content {
                flex: 1;
            }

            .notification-title {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 4px;
                font-size: 14px;
            }

            .notification-description {
                font-size: 13px;
                color: #7f8c8d;
            }

            .notification-time {
                font-size: 11px;
                color: #bdc3c7;
                margin-top: 6px;
            }

            .notification-empty {
                padding: 40px 20px;
                text-align: center;
                color: #7f8c8d;
            }

            .notification-empty .empty-icon {
                font-size: 48px;
                margin-bottom: 15px;
            }

            .notification-footer {
                padding: 15px 20px;
                background: #f5f7fa;
                text-align: center;
                border-top: 1px solid #e1e8ed;
            }

            .notification-footer a {
                color: #4A6B54;
                text-decoration: none;
                font-weight: 600;
                font-size: 14px;
            }

            .notification-footer a:hover {
                text-decoration: underline;
            }

            /* Toast Notifications */
            .toast-container {
                position: fixed;
                bottom: 30px;
                right: 30px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .toast {
                background: white;
                padding: 16px 20px;
                border-radius: 12px;
                box-shadow: 0 8px 30px rgba(0,0,0,0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                animation: toastIn 0.3s ease;
            }

            .toast.alta {
                border-left: 4px solid #e74c3c;
            }

            .toast.media {
                border-left: 4px solid #f39c12;
            }

            .toast.info {
                border-left: 4px solid #27ae60;
            }

            @keyframes toastIn {
                from { opacity: 0; transform: translateX(100px); }
                to { opacity: 1; transform: translateX(0); }
            }

            @keyframes toastOut {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100px); }
            }

            .toast-icon {
                font-size: 24px;
            }

            .toast-content {
                flex: 1;
            }

            .toast-title {
                font-weight: 600;
                font-size: 14px;
                color: #2c3e50;
            }

            .toast-message {
                font-size: 13px;
                color: #7f8c8d;
            }

            .toast-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #bdc3c7;
                cursor: pointer;
                padding: 0;
            }

            .toast-close:hover {
                color: #7f8c8d;
            }
        `;
        document.head.appendChild(style);

        // Criar container de toasts
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.id = 'toast-container';
        document.body.appendChild(toastContainer);

        // Criar sino de notificação
        this.container = document.createElement('div');
        this.container.className = 'notification-bell';
        this.container.innerHTML = `
            <span class="bell-icon">🔔</span>
            <span class="notification-badge hidden" id="notification-badge">0</span>
        `;
        this.container.onclick = () => this.togglePanel();
        document.body.appendChild(this.container);

        this.badge = document.getElementById('notification-badge');

        // Criar painel de notificações
        this.panel = document.createElement('div');
        this.panel.className = 'notification-panel';
        this.panel.id = 'notification-panel';
        this.panel.innerHTML = `
            <div class="notification-header">
                <h3>Alertas</h3>
                <span class="notification-count" id="alert-count">0 alertas</span>
            </div>
            <div class="notification-list" id="notification-list">
                <div class="notification-empty">
                    <div class="empty-icon">✅</div>
                    <div>Nenhum alerta no momento</div>
                </div>
            </div>
            <div class="notification-footer">
                <a href="/pages/stark.html">Pergunte ao STARK sobre finanças →</a>
            </div>
        `;
        document.body.appendChild(this.panel);

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target) && !this.panel.contains(e.target)) {
                this.closePanel();
            }
        });
    },

    // Buscar alertas do backend
    async fetchAlerts() {
        try {
            const response = await fetch('/alerts');
            const data = await response.json();

            if (data.success) {
                this.alerts = data.alertas;
                this.unreadCount = data.contagem.alta + data.contagem.media;
                this.updateUI();

                // Mostrar toast para alertas de alta prioridade
                const alertasAlta = this.alerts.filter(a => a.prioridade === 'alta');
                if (alertasAlta.length > 0 && !sessionStorage.getItem('alertsShown')) {
                    alertasAlta.slice(0, 2).forEach((alerta, i) => {
                        setTimeout(() => this.showToast(alerta), i * 1000);
                    });
                    sessionStorage.setItem('alertsShown', 'true');
                }
            }
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
        }
    },

    // Atualizar interface
    updateUI() {
        // Atualizar badge
        if (this.unreadCount > 0) {
            this.badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount;
            this.badge.classList.remove('hidden');
        } else {
            this.badge.classList.add('hidden');
        }

        // Atualizar contador no painel
        document.getElementById('alert-count').textContent =
            `${this.alerts.length} alerta${this.alerts.length !== 1 ? 's' : ''}`;

        // Atualizar lista
        const list = document.getElementById('notification-list');

        if (this.alerts.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <div class="empty-icon">✅</div>
                    <div>Nenhum alerta no momento</div>
                </div>
            `;
            return;
        }

        list.innerHTML = this.alerts.map(alerta => `
            <div class="notification-item ${alerta.prioridade}">
                <span class="notification-icon">${alerta.icone}</span>
                <div class="notification-content">
                    <div class="notification-title">${alerta.titulo}</div>
                    <div class="notification-description">${alerta.descricao}</div>
                    <div class="notification-time">${alerta.categoria === 'receita' ? 'Receita' : alerta.categoria === 'despesa' ? 'Despesa' : 'Sistema'}</div>
                </div>
            </div>
        `).join('');
    },

    // Alternar painel
    togglePanel() {
        if (this.isOpen) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    },

    openPanel() {
        this.panel.classList.add('open');
        this.isOpen = true;
    },

    closePanel() {
        this.panel.classList.remove('open');
        this.isOpen = false;
    },

    // Mostrar toast
    showToast(alerta) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${alerta.prioridade}`;
        toast.innerHTML = `
            <span class="toast-icon">${alerta.icone}</span>
            <div class="toast-content">
                <div class="toast-title">${alerta.titulo}</div>
                <div class="toast-message">${alerta.descricao}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;
        container.appendChild(toast);

        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            toast.style.animation = 'toastOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    // Polling para atualizar alertas
    startPolling() {
        // Atualizar a cada 5 minutos
        setInterval(() => this.fetchAlerts(), 5 * 60 * 1000);
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    NotificationSystem.init();
});

// Exportar para uso global
window.NotificationSystem = NotificationSystem;
