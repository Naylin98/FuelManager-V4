// js/ui.js
import { logoutUser } from './auth.js';

export function initUI() {
    // --- 1. Theme Management (Day/Night Mode) ---
    initTheme();

    // --- 2. Sidebar & Mobile Menu Management ---
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileClose = document.getElementById('mobile-close');
    const overlay = document.getElementById('sidebar-overlay');
    const navItems = document.querySelectorAll('.nav-item');

    const isMobile = () => window.innerWidth <= 768;

    if (menuToggle) {
        menuToggle.onclick = () => {
            if (isMobile()) {
                sidebar.classList.add('mobile-open');
                overlay.classList.add('active');
            } else {
                sidebar.classList.toggle('collapsed');
            }
        };
    }

    const closeMobileSidebar = () => {
        if (isMobile() && sidebar && overlay) {
            sidebar.classList.remove('mobile-open');
            overlay.classList.remove('active');
        }
    };

    if (mobileClose) mobileClose.onclick = closeMobileSidebar;
    if (overlay) overlay.onclick = closeMobileSidebar;

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (isMobile()) closeMobileSidebar();
        });
    });

    // --- 3. Logout Handling ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            logoutUser();
        };
    }

    // --- 4. Role Based Access ---
    applyRoleBasedAccess();

    // --- 5. User Profile/Name ပြောင်းလဲခြင်း ---
    renderUserInfo();
}

// ==========================================
// --- User Profile Display Function ---
// ==========================================
export function renderUserInfo() {
    const userData = JSON.parse(localStorage.getItem('fuel_app_current_user'));
    if (!userData || !userData.username) return;

    const userNameEl = document.getElementById('user-name');
    const userAvatarEl = document.getElementById('user-avatar');

    // User Name ကို ပြောင်းပေးခြင်း
    if (userNameEl) {
        userNameEl.textContent = userData.username;
    }

    // Avatar Circle ထဲတွင် Name ရဲ့ ပထမဆုံး စာလုံး (Capital) ကို ပြပေးခြင်း
    if (userAvatarEl) {
        const initial = userData.username.charAt(0).toUpperCase();
        userAvatarEl.textContent = initial;
    }
}

// ==========================================
// --- Theme Management Functions ---
// ==========================================
export function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle');

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme ? savedTheme : (systemPrefersDark ? 'dark' : 'light');
    
    setTheme(initialTheme);

    if (themeToggleBtn) {
        themeToggleBtn.onclick = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        };
    }
}

export function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// ==========================================
// --- Role Based Access Control ---
// ==========================================
export function applyRoleBasedAccess() {
    const userData = JSON.parse(localStorage.getItem('fuel_app_current_user'));
    if (!userData) return;

    const navItems = document.querySelectorAll('#sidebar-nav .nav-item');
    
    if (userData.role === 'Admin') {
        navItems.forEach(item => {
            if (item.id !== 'logout-btn') {
                item.style.display = 'flex';
            }
        });
    } else {
        const allowed = userData.allowedTabs ? userData.allowedTabs.split(',') : []; 
        navItems.forEach(item => {
            if (item.id === 'logout-btn') return; 
            
            const path = item.getAttribute('data-path');
            if (allowed.includes(path)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }
}