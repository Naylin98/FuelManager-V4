// js/ui.js
import { logoutUser } from './auth.js';

export export function initUI() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    // LocalStorage ထဲက Theme အဟောင်းကို စစ်ဆေးခြင်း
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme');
            let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            // HTML tag တွင် data-theme အသစ် သတ်မှတ်ခြင်း
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme); // မှတ်ဉာဏ်တွင် သိမ်းရန်
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
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