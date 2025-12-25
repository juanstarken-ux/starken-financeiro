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
    const MENU_STATE_KEY = 'starken-menu-state';

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
                text.textContent = theme === 'dark' ? 'Modo Claro' : 'Modo Escuro';
            }
        }
    }

    // Toggle menu expansível
    function toggleSubMenu(menuId) {
        const submenu = document.getElementById(menuId);
        const arrow = document.querySelector(`[data-menu="${menuId}"] .menu-arrow`);

        if (submenu) {
            const isExpanded = submenu.classList.contains('expanded');
            submenu.classList.toggle('expanded');

            if (arrow) {
                arrow.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
            }

            // Salvar estado do menu
            const menuState = JSON.parse(localStorage.getItem(MENU_STATE_KEY) || '{}');
            menuState[menuId] = !isExpanded;
            localStorage.setItem(MENU_STATE_KEY, JSON.stringify(menuState));
        }
    }

    // Restaurar estado dos menus
    function restoreMenuState() {
        const menuState = JSON.parse(localStorage.getItem(MENU_STATE_KEY) || '{}');

        Object.entries(menuState).forEach(([menuId, isExpanded]) => {
            const submenu = document.getElementById(menuId);
            const arrow = document.querySelector(`[data-menu="${menuId}"] .menu-arrow`);

            if (submenu && isExpanded) {
                submenu.classList.add('expanded');
                if (arrow) {
                    arrow.style.transform = 'rotate(90deg)';
                }
            }
        });
    }

    // Injetar estilos globais
    function injectStyles() {
        if (document.getElementById('theme-toggle-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'theme-toggle-styles';
        styles.textContent = `
            /* Theme Toggle na Sidebar */
            .sidebar-theme-toggle {
                padding: 15px 20px;
                border-top: 1px solid rgba(255,255,255,0.1);
                margin-top: auto;
            }

            .theme-toggle-btn {
                width: 100%;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                background: rgba(255,255,255,0.1);
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                color: rgba(255,255,255,0.9);
                transition: all 0.3s ease;
            }

            .theme-toggle-btn:hover {
                background: rgba(255,255,255,0.2);
            }

            .theme-icon {
                font-size: 18px;
                line-height: 1;
            }

            .theme-text {
                font-size: 13px;
            }

            /* Menu Expansível */
            .nav-item-expandable {
                cursor: pointer;
                user-select: none;
            }

            .nav-item-expandable .menu-arrow {
                margin-left: auto;
                font-size: 10px;
                transition: transform 0.3s ease;
            }

            .submenu {
                max-height: 0;
                overflow: hidden;
                transition: max-height 0.3s ease;
                background: rgba(0,0,0,0.1);
            }

            .submenu.expanded {
                max-height: 500px;
            }

            .submenu .nav-item {
                padding-left: 45px;
                font-size: 13px;
                border-left: none;
            }

            .submenu .nav-item .nav-icon {
                font-size: 14px;
            }

            /* Separador */
            .nav-separator {
                height: 1px;
                background: rgba(255,255,255,0.1);
                margin: 10px 20px;
            }

            /* Badge de submenu */
            .submenu-badge {
                background: rgba(255,255,255,0.2);
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 10px;
                margin-left: 8px;
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

            .theme-dark .page-header {
                background: var(--white) !important;
                border-color: var(--border-color) !important;
            }

            .theme-dark .submenu {
                background: rgba(0,0,0,0.2) !important;
            }

            /* Transição suave */
            body, .sidebar, .summary-card, .data-table-container,
            .controls-bar, .modal, table, thead, tr, td, th,
            .form-input, .form-select, .btn, .filter-btn, .page-header {
                transition: background-color 0.3s ease,
                            color 0.3s ease,
                            border-color 0.3s ease !important;
            }
        `;
        document.head.appendChild(styles);
    }

    // Criar e injetar o botão de toggle na sidebar
    function createToggleButton() {
        // Verificar se já existe
        if (document.getElementById('themeToggle')) return;

        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        const currentTheme = getCurrentTheme();

        // Criar container para o toggle
        const toggleContainer = document.createElement('div');
        toggleContainer.className = 'sidebar-theme-toggle';
        toggleContainer.innerHTML = `
            <button id="themeToggle" class="theme-toggle-btn" title="Alternar tema">
                <span class="theme-icon">${currentTheme === 'dark' ? '☀️' : '🌙'}</span>
                <span class="theme-text">${currentTheme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
            </button>
        `;

        // Adicionar ao final da sidebar
        sidebar.appendChild(toggleContainer);

        // Adicionar evento de clique
        document.getElementById('themeToggle').onclick = toggleTheme;
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
                injectStyles();
                applyTheme(savedTheme);
                createToggleButton();
                restoreMenuState();
            });
        } else {
            injectStyles();
            applyTheme(savedTheme);
            createToggleButton();
            restoreMenuState();
        }
    }

    // Expor funções globalmente
    window.ThemeManager = {
        toggle: toggleTheme,
        apply: applyTheme,
        getCurrent: getCurrentTheme,
        toggleSubMenu: toggleSubMenu
    };

    // Iniciar
    init();
})();
