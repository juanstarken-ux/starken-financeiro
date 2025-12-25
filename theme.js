// Sistema de Tema Dark/Light - Starken Tecnologia
// Este arquivo deve ser incluído em todas as páginas

(function() {
    'use strict';

    // Variáveis CSS para tema dark
    const darkThemeVars = {
        '--bg-gray': '#1a1a2e',
        '--white': '#16213e',
        '--text-dark': '#eaeaea',
        '--text-light': '#a0a0a0',
        '--border-color': '#2d3748',
        '--primary-green': '#5d8a6b',
        '--secondary-green': '#7A9B84',
        '--light-green': '#4a6b54',
        '--card-bg': '#16213e',
        '--sidebar-bg': '#0f0f1a',
        '--table-row-hover': 'rgba(93, 138, 107, 0.1)',
        '--table-row-pago': 'rgba(39, 174, 96, 0.15)',
        '--table-row-vencido': 'rgba(231, 76, 60, 0.15)',
        '--modal-bg': '#1a1a2e',
        '--input-bg': '#16213e',
        '--shadow-color': 'rgba(0, 0, 0, 0.3)'
    };

    // Variáveis CSS para tema light (padrão)
    const lightThemeVars = {
        '--bg-gray': '#f5f7fa',
        '--white': '#ffffff',
        '--text-dark': '#2c3e50',
        '--text-light': '#7f8c8d',
        '--border-color': '#e1e8ed',
        '--primary-green': '#4A6B54',
        '--secondary-green': '#7A9B84',
        '--light-green': '#B8D4BE',
        '--card-bg': '#ffffff',
        '--sidebar-bg': '#4A6B54',
        '--table-row-hover': 'rgba(74, 107, 84, 0.03)',
        '--table-row-pago': 'rgba(39, 174, 96, 0.05)',
        '--table-row-vencido': 'rgba(231, 76, 60, 0.08)',
        '--modal-bg': '#ffffff',
        '--input-bg': '#ffffff',
        '--shadow-color': 'rgba(0, 0, 0, 0.08)'
    };

    // Chave do localStorage
    const THEME_KEY = 'starken-theme';

    // Função para obter o tema atual
    function getCurrentTheme() {
        return localStorage.getItem(THEME_KEY) || 'light';
    }

    // Função para aplicar o tema
    function applyTheme(theme) {
        const root = document.documentElement;
        const vars = theme === 'dark' ? darkThemeVars : lightThemeVars;

        // Aplicar variáveis CSS
        Object.entries(vars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Adicionar classe ao body
        document.body.classList.remove('theme-light', 'theme-dark');
        document.body.classList.add(`theme-${theme}`);

        // Atualizar ícone do botão se existir
        updateToggleButton(theme);

        // Salvar preferência
        localStorage.setItem(THEME_KEY, theme);

        // Disparar evento customizado
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    // Função para alternar o tema
    function toggleTheme() {
        const currentTheme = getCurrentTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
        return newTheme;
    }

    // Atualizar o botão de toggle
    function updateToggleButton(theme) {
        const toggleBtn = document.getElementById('themeToggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('.theme-icon');
            const text = toggleBtn.querySelector('.theme-text');

            if (icon) {
                icon.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
            if (text) {
                text.textContent = theme === 'dark' ? 'Claro' : 'Escuro';
            }
        }
    }

    // Criar e injetar o botão de toggle
    function createToggleButton() {
        // Verificar se já existe
        if (document.getElementById('themeToggle')) return;

        const currentTheme = getCurrentTheme();

        // Criar o botão
        const button = document.createElement('button');
        button.id = 'themeToggle';
        button.className = 'theme-toggle-btn';
        button.title = 'Alternar tema';
        button.innerHTML = `
            <span class="theme-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
            <span class="theme-text">${currentTheme === 'dark' ? 'Claro' : 'Escuro'}</span>
        `;
        button.onclick = toggleTheme;

        // Injetar estilos
        if (!document.getElementById('theme-toggle-styles')) {
            const styles = document.createElement('style');
            styles.id = 'theme-toggle-styles';
            styles.textContent = `
                .theme-toggle-btn {
                    position: fixed;
                    bottom: 20px;
                    left: 280px;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: var(--white);
                    border: 2px solid var(--border-color);
                    border-radius: 25px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-dark);
                    box-shadow: 0 4px 15px var(--shadow-color);
                    transition: all 0.3s ease;
                }

                .theme-toggle-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px var(--shadow-color);
                    border-color: var(--primary-green);
                }

                .theme-icon {
                    font-size: 18px;
                    line-height: 1;
                }

                .theme-text {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Ajustes específicos para tema dark */
                .theme-dark .sidebar {
                    background-color: var(--sidebar-bg) !important;
                }

                .theme-dark .summary-card,
                .theme-dark .data-table-container,
                .theme-dark .controls-bar {
                    background: var(--white) !important;
                    border-color: var(--border-color) !important;
                }

                .theme-dark .modal {
                    background: var(--modal-bg) !important;
                }

                .theme-dark .modal-header,
                .theme-dark .modal-footer {
                    background: var(--bg-gray) !important;
                }

                .theme-dark .form-input,
                .theme-dark .form-select,
                .theme-dark .month-select {
                    background: var(--input-bg) !important;
                    color: var(--text-dark) !important;
                    border-color: var(--border-color) !important;
                }

                .theme-dark thead {
                    background-color: var(--bg-gray) !important;
                }

                .theme-dark tr:hover {
                    background-color: var(--table-row-hover) !important;
                }

                .theme-dark tr.row-pago {
                    background-color: var(--table-row-pago) !important;
                }

                .theme-dark tr.row-vencido {
                    background-color: var(--table-row-vencido) !important;
                }

                .theme-dark tr.row-recebido {
                    background-color: var(--table-row-pago) !important;
                }

                .theme-dark .table-header {
                    background: linear-gradient(135deg, var(--bg-gray) 0%, var(--white) 100%) !important;
                }

                .theme-dark .filter-btn {
                    background: var(--white) !important;
                    border-color: var(--border-color) !important;
                    color: var(--text-dark) !important;
                }

                .theme-dark .filter-btn:hover,
                .theme-dark .filter-btn.active {
                    background: var(--primary-green) !important;
                    color: white !important;
                }

                .theme-dark .toast {
                    background: var(--white) !important;
                }

                .theme-dark .kanban-column {
                    background: var(--white) !important;
                    border-color: var(--border-color) !important;
                }

                .theme-dark .kanban-card {
                    background: var(--bg-gray) !important;
                    border-color: var(--border-color) !important;
                }

                .theme-dark .view-tabs .tab-btn {
                    background: var(--bg-gray) !important;
                    color: var(--text-dark) !important;
                }

                .theme-dark .view-tabs .tab-btn.active {
                    background: var(--primary-green) !important;
                    color: white !important;
                }

                /* Transição suave */
                body, .sidebar, .summary-card, .data-table-container,
                .controls-bar, .modal, table, thead, tr, td, th,
                .form-input, .form-select, .btn, .filter-btn {
                    transition: background-color 0.3s ease,
                                color 0.3s ease,
                                border-color 0.3s ease !important;
                }

                @media (max-width: 768px) {
                    .theme-toggle-btn {
                        left: 20px;
                        bottom: 80px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // Adicionar ao body
        document.body.appendChild(button);
    }

    // Inicialização
    function init() {
        // Aplicar tema salvo antes do DOM carregar (para evitar flash)
        const savedTheme = getCurrentTheme();

        // Aplicar tema assim que possível
        if (document.documentElement) {
            const vars = savedTheme === 'dark' ? darkThemeVars : lightThemeVars;
            Object.entries(vars).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        }

        // Quando o DOM estiver pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                applyTheme(savedTheme);
                createToggleButton();
            });
        } else {
            applyTheme(savedTheme);
            createToggleButton();
        }
    }

    // Expor funções globalmente
    window.ThemeManager = {
        toggle: toggleTheme,
        apply: applyTheme,
        getCurrent: getCurrentTheme
    };

    // Iniciar
    init();
})();
