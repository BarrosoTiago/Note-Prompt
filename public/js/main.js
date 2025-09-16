// ===== BIBLIOTECA PESSOAL DE PROMPTS - FRONTEND =====

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 Frontend inicializado!');
    
    // Inicializar funcionalidades
    initMobileMenu();
    initTooltips();
    initSmoothScroll();
    
    console.log('✅ Todas as funcionalidades carregadas!');
});

// ===== MENU MOBILE =====
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', function() {
            toggleMobileMenu();
        });
        
        // Fechar menu ao clicar fora
        document.addEventListener('click', function(e) {
            if (!mobileMenuBtn.contains(e.target) && !mobileNav.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }
}

function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const isActive = mobileNav.classList.contains('active');
    
    if (isActive) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

function openMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    mobileNav.classList.add('active');
    
    // Animar entrada
    mobileNav.style.opacity = '0';
    mobileNav.style.transform = 'translateY(-10px)';
    
    requestAnimationFrame(() => {
        mobileNav.style.transition = 'all 0.3s ease';
        mobileNav.style.opacity = '1';
        mobileNav.style.transform = 'translateY(0)';
    });
}

function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    
    if (mobileNav.classList.contains('active')) {
        mobileNav.style.opacity = '0';
        mobileNav.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            mobileNav.classList.remove('active');
        }, 300);
    }
}

// Função global para fechar menu (chamada pelos links)
window.closeMobileMenu = closeMobileMenu;

// ===== TOOLTIPS SIMPLES =====
function initTooltips() {
    const elementsWithTitle = document.querySelectorAll('[title]');
    
    elementsWithTitle.forEach(element => {
        // Criar tooltip personalizado se necessário
        const title = element.getAttribute('title');
        if (title) {
            element.addEventListener('mouseenter', function(e) {
                showTooltip(e.target, title);
            });
            
            element.addEventListener('mouseleave', function() {
                hideTooltip();
            });
        }
    });
}

let tooltipElement = null;

function showTooltip(target, text) {
    // Criar tooltip se não existir
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.className = 'custom-tooltip';
        tooltipElement.style.cssText = `
            position: absolute;
            background: var(--gray-800);
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transform: translateY(-5px);
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(tooltipElement);
    }
    
    tooltipElement.textContent = text;
    
    // Posicionar tooltip
    const rect = target.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    
    tooltipElement.style.left = rect.left + (rect.width - tooltipRect.width) / 2 + 'px';
    tooltipElement.style.top = rect.top - tooltipRect.height - 8 + 'px';
    
    // Mostrar com animação
    requestAnimationFrame(() => {
        tooltipElement.style.opacity = '1';
        tooltipElement.style.transform = 'translateY(0)';
    });
}

function hideTooltip() {
    if (tooltipElement) {
        tooltipElement.style.opacity = '0';
        tooltipElement.style.transform = 'translateY(-5px)';
    }
}

// ===== SCROLL SUAVE =====
function initSmoothScroll() {
    const smoothLinks = document.querySelectorAll('a[href^="#"]');
    
    smoothLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== UTILITÁRIOS GLOBAIS =====

// Copiar texto para clipboard
window.copyToClipboard = async function(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('✅ Copiado para a área de transferência!', 'success');
        return true;
    } catch (err) {
        console.error('Erro ao copiar:', err);
        showNotification('❌ Erro ao copiar texto', 'error');
        return false;
    }
};

// Sistema de notificações simples
window.showNotification = function(message, type = 'info') {
    // Remover notificação existente
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        z-index: 1000;
        font-weight: 500;
        font-size: 14px;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    // Cores baseadas no tipo
    const colors = {
        success: { bg: '#10b981', color: 'white' },
        error: { bg: '#ef4444', color: 'white' },
        warning: { bg: '#f59e0b', color: 'white' },
        info: { bg: '#3b82f6', color: 'white' }
    };
    
    if (colors[type]) {
        notification.style.background = colors[type].bg;
        notification.style.color = colors[type].color;
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animar entrada
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
};

// Função para formatar datas
window.formatDate = function(date) {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Debug - mostrar informações da aplicação
window.debugInfo = function() {
    console.log('🔍 === DEBUG INFO ===');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('📏 Viewport:', window.innerWidth + 'x' + window.innerHeight);
    console.log('🌐 URL:', window.location.href);
    console.log('📄 Título:', document.title);
    console.log('🎨 CSS Variables:', getComputedStyle(document.documentElement));
};