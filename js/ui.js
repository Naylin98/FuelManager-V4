// js/ui.js
import { logoutUser } from './auth.js';

export function initUI() {
    // --- 1. Theme Management ---
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

    // --- 4. Role Based Access ကို ခေါ်ယူအသုံးပြုခြင်း ---
    // UI စတင်တာနဲ့ User ရဲ့ Role အလိုက် Menu တွေကို အပိတ်/အဖွင့် လုပ်ပေးပါမည်
    applyRoleBasedAccess();
}

// --- Helper Functions ---

function updateThemeIcon(theme) {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// Sidebar Nav များကို Role အလိုက် ထိန်းချုပ်မည့် Function
export function applyRoleBasedAccess() {
    const userData = JSON.parse(localStorage.getItem('fuel_app_current_user'));
    if (!userData) return;

    const navItems = document.querySelectorAll('#sidebar-nav .nav-item');
    
    if (userData.role === 'Admin') {
        // Admin ဆိုလျှင် အားလုံးမြင်ရမည်
        navItems.forEach(item => {
            if (item.id !== 'logout-btn') { // Logout ခလုတ်ကို မဖျောက်မိစေရန် စစ်ဆေးခြင်း
                item.style.display = 'flex';
            }
        });
    } else {
        // User ဆိုလျှင် Allowed Tabs ထဲတွင် ပါဝင်သော Menu များကိုသာ ပြမည်
        const allowed = userData.allowedTabs.split(','); 
        navItems.forEach(item => {
            // Logout ခလုတ်ကို အမြဲတမ်း ပြထားရန်
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