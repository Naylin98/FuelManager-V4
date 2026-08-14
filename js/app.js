// js/app.js

import { renderDashboard } from './dashboard.js';
import { renderFuelForm } from './fuel.js';
import { renderDraftModule } from './draft.js';
import { renderInventoryModule } from './inventory.js';
import { renderReportModule } from './report.js';
// import { renderSettingsModule } from './settings.js';

import { checkAuthGuard, renderLoginScreen } from './auth.js';
import { initUI } from './ui.js';

// ၁။ App စတင်ခြင်း
document.addEventListener('DOMContentLoaded', () => {
    // Authentication စစ်ဆေးမည်
    if (!checkAuthGuard()) {
        renderLoginScreen(() => {
            // Login အောင်မြင်ပါက App ကို စတင်မည်
            initializeAppContent();
        });
    } else {
        // Login ဝင်ထားပြီးသားဆိုပါက App ကို တိုက်ရိုက်စတင်မည်
        initializeAppContent();
    }
});

// ၂။ App လုပ်ဆောင်ချက်များ စတင်ခြင်း
function initializeAppContent() {
    // UI ခလုတ်များ (Sidebar, Theme, Logout) အသက်သွင်းခြင်း
    initUI(); 

    // Router ချိတ်ဆက်ခြင်း
    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // စစဖွင့်ချင်း တစ်ကြိမ် အလုပ်လုပ်ရန်
}

// ၃။ CSS လှမ်းခေါ်ရန် Helper Function
function loadCSS(id, href) {
    if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
    }
}

// ၄။ စာမျက်နှာ အကူးအပြောင်း (Router)
function handleRoute() {
    const appContent = document.getElementById('app-content');
    const pageTitle = document.getElementById('page-title');
    const navItems = document.querySelectorAll('#sidebar-nav .nav-item');

    let path = window.location.hash.replace('#', '') || '/dashboard';
    
    // index.html တွင် reports ဖြစ်နေပြီး ဤနေရာတွင် report ဖြစ်နေသည့် အမှားကို ဖြေရှင်းခြင်း
    if (path === '/reports') path = '/report';

    const titles = {
        '/dashboard': 'Dashboard',
        '/fuel': 'Fuel Entry',
        '/draft': 'Drafts',
        '/inventory': 'Inventory',
        '/report': 'Reports',
        '/settings': 'Settings'
    };

    // Sidebar ၏ Active လင့်ခ်များကို အရောင်ပြောင်းခြင်း
    navItems.forEach(item => {
        item.classList.remove('active');
        let itemPath = item.getAttribute('data-path');
        if (itemPath === '/reports' && path === '/report') {
            item.classList.add('active');
        } else if (itemPath === path) {
            item.classList.add('active');
        }
    });

    // Page Title ခေါင်းစဉ် ပြောင်းလဲခြင်း
    pageTitle.textContent = titles[path] || 'FuelManager Pro';

    // Loading ပြသခြင်း (အဟောင်းများကို ရှင်းလင်းခြင်း)
    appContent.innerHTML = `
        <div style="padding: 40px; text-align: center; color: var(--text-muted);">
            <span style="font-size: 32px; display: block; margin-bottom: 10px;">⏳</span>
            Loading Module...
        </div>
    `;

    // သေးငယ်သော အချိန်ကြန့်ကြာမှု ယူပြီးမှ သက်ဆိုင်ရာ Module များကို Render လုပ်မည်
    setTimeout(() => {
        appContent.innerHTML = ''; // Loading စာသားကို ဖျက်မည်

        if (path === '/dashboard') {
            renderDashboard(appContent);
        } else if (path === '/fuel') {
            loadCSS('form-css', 'css/form.css');
            renderFuelForm(appContent);
        } else if (path === '/draft') {
            loadCSS('draft-css', 'css/draft.css');
            renderDraftModule(appContent);
        } else if (path === '/inventory') {
            // appContent သို့ တိုက်ရိုက် ရေးဆွဲပြသရန် ပြင်ဆင်ထားသည်
            renderInventoryModule(appContent);
        } else if (path === '/report') {
            renderReportModule(appContent);
        } else if (path === '/settings') {
            appContent.innerHTML = `<h3>⚙️ Settings</h3><p>Settings Module is under construction...</p>`;
        } else {
            appContent.innerHTML = `<h3>Page Not Found</h3>`;
        }
    }, 50); 
}