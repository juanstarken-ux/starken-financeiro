// Sistema de Autenticação - Starken Dashboard
// Este script deve ser incluído em todas as páginas protegidas

// VERIFICAÇÃO IMEDIATA - Executa antes de renderizar a página
(function() {
    // Verificar se não é a página de login
    if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('/login.html')) {
        let session = null;

        try {
            session = localStorage.getItem('starken_session');
        } catch (e) {
            // localStorage bloqueado (modo privado)
            console.warn('localStorage não disponível, tentando sessionStorage');
            try {
                session = sessionStorage.getItem('starken_session');
            } catch (err) {
                console.error('Nenhum storage disponível');
                window.location.replace('/login.html');
                throw new Error('Storage not available');
            }
        }

        if (!session) {
            // Não está logado, redirecionar IMEDIATAMENTE
            window.location.replace('/login.html');
            // Parar execução do resto da página
            throw new Error('Not authenticated');
        }

        try {
            const sessionData = JSON.parse(session);
            // Sessão válida, permitir continuar
        } catch (e) {
            // Sessão inválida, redirecionar
            try {
                localStorage.removeItem('starken_session');
            } catch (err) {
                try {
                    sessionStorage.removeItem('starken_session');
                } catch (e2) {
                    // Ignorar erro de storage
                }
            }
            window.location.replace('/login.html');
            throw new Error('Invalid session');
        }
    }
})();

// ============================================
// HELPERS DE STORAGE COM FALLBACK
// ============================================

function getFromStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (e) {
        try {
            return sessionStorage.getItem(key);
        } catch (err) {
            console.error('Storage não disponível');
            return null;
        }
    }
}

function setToStorage(key, value) {
    try {
        localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.warn('localStorage falhou, usando sessionStorage');
        try {
            sessionStorage.setItem(key, value);
            return true;
        } catch (err) {
            console.error('Nenhum storage disponível');
            return false;
        }
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (e) {
        try {
            sessionStorage.removeItem(key);
        } catch (err) {
            // Ignorar erro
        }
    }
}

// Verificar se o usuário está autenticado (retorna boolean)
function isAuthenticated() {
    const session = getFromStorage('starken_session');
    if (!session) return false;

    try {
        const sessionData = JSON.parse(session);
        return !!sessionData;
    } catch (e) {
        return false;
    }
}

// Verificar se o usuário está autenticado
function checkAuth() {
    const session = getFromStorage('starken_session');

    if (!session) {
        // Não está logado, redirecionar para login
        window.location.replace('/login.html');
        return null;
    }

    try {
        const sessionData = JSON.parse(session);
        return sessionData;
    } catch (e) {
        // Sessão inválida, fazer logout
        logout();
        return null;
    }
}

// Fazer logout
function logout() {
    removeFromStorage('starken_session');
    window.location.replace('/login.html');
}

// Obter dados do sócio logado
function getLoggedPartner() {
    const session = getFromStorage('starken_session');
    if (!session) return null;

    try {
        return JSON.parse(session);
    } catch (e) {
        return null;
    }
}

// Verificar se o usuário é CEO (Juan Minni)
function isCEO() {
    const partner = getLoggedPartner();
    if (!partner) return false;

    // Juan Minni é o único com acesso CEO
    return partner.username === 'juan' || partner.name === 'Juan Minni' || partner.role === 'CEO';
}

// Verificar se o usuário tem permissão para acessar uma página
function checkPagePermission(requiredRole) {
    const partner = getLoggedPartner();
    if (!partner) return false;

    if (requiredRole === 'CEO') {
        return isCEO();
    }

    return true; // Outras páginas são acessíveis a todos
}

// Atualizar informações do sócio no header
function updateHeaderWithPartner() {
    const partner = getLoggedPartner();
    if (!partner) return;

    // Verificar se existe um elemento para mostrar o nome do sócio
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
        userInfoElement.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: #2c3e50;">${partner.name}</div>
                    <div style="font-size: 12px; color: #6c757d;">${partner.role}</div>
                </div>
                <button onclick="logout()" style="
                    background: #dc3545;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 600;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#c82333'" onmouseout="this.style.background='#dc3545'">
                    Sair
                </button>
            </div>
        `;
    }
}

// Ocultar menu Gestão Financeira para não-CEOs
function hideFinanceMenuForPartners() {
    if (!isCEO()) {
        // Adicionar CSS global para ocultar menu
        const style = document.createElement('style');
        style.id = 'hide-finance-menu';
        style.textContent = `
            a[href="gestao.html"],
            a[href="pages/gestao.html"],
            #menu-gestao-financeira {
                display: none !important;
            }
        `;
        document.head.appendChild(style);

        // Também ocultar via JavaScript como backup
        const gestaoLinks = document.querySelectorAll('a[href="gestao.html"], a[href="pages/gestao.html"], #menu-gestao-financeira');
        gestaoLinks.forEach(link => {
            if (link) {
                link.style.setProperty('display', 'none', 'important');
                link.remove(); // Remover completamente do DOM
            }
        });
    }
}

// EXECUÇÃO IMEDIATA - antes do DOMContentLoaded
(function() {
    if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('/login.html')) {
        // Ocultar IMEDIATAMENTE se não for CEO
        if (!isCEO()) {
            const style = document.createElement('style');
            style.id = 'hide-finance-menu-immediate';
            style.textContent = `
                a[href="gestao.html"],
                a[href="pages/gestao.html"],
                #menu-gestao-financeira {
                    display: none !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
})();

// Executar quando a página carregar
if (window.location.pathname !== '/login.html' && !window.location.pathname.endsWith('/login.html')) {
    window.addEventListener('DOMContentLoaded', function() {
        const partner = checkAuth();
        if (partner) {
            updateHeaderWithPartner();
            // Ocultar menu de gestão financeira se não for CEO
            hideFinanceMenuForPartners();
        }
    });
}
