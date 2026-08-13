// js/ui.js
import { logoutUser } from './auth.js';

export function initUI() {
    // --- 1. Theme Management ---
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const savedTheme = localStorage.getItem('fuel_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if(themeIcon) themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';

    if (themeBtn) {
        themeBtn.onclick = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('fuel_theme', newTheme);
            themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
        };
    }

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
            logoutUser(); // auth.js မှ Function ကိုခေါ်မည်
        };
    }
}