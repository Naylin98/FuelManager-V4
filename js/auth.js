// js/auth.js

const AUTH_KEY = 'fuel_app_current_user';

export function checkAuthGuard() {
    const user = localStorage.getItem(AUTH_KEY);
    return user !== null;
}

export function logoutUser() {
    localStorage.removeItem(AUTH_KEY);
    window.location.reload();
}

export function renderLoginScreen(onLoginSuccess) {
    if (!document.getElementById('auth-css')) {
        const link = document.createElement('link');
        link.id = 'auth-css';
        link.rel = 'stylesheet';
        link.href = 'css/auth.css';
        document.head.appendChild(link);
    }

    const wrapper = document.createElement('div');
    wrapper.id = 'auth-wrapper-modal';
    wrapper.className = 'auth-wrapper';
    
    wrapper.innerHTML = `
        <div class="auth-card">
            <div class="auth-header">
                <div class="logo-icon">⛽</div>
                <h2>Fuel Station OS</h2>
                <p>Please sign in to continue</p>
                <button id="theme-toggle" style="background:none; border:none; cursor:pointer; font-size: 20px; margin-top: 10px;">
                    <span id="theme-icon">🌙</span>
                </button>
            </div>

            <div id="auth-error-msg" class="auth-error">Invalid username or password</div>

            <form id="login-form" class="auth-form">
                <div class="auth-group">
                    <label for="login-username">Email Address</label>
                    <!-- Placeholder ကို admin@mm.com သို့ ပြင်ဆင်ထားပါသည် -->
                    <input type="email" id="login-username" class="auth-control" placeholder="admin@mm.com" required>
                </div>

                <div class="auth-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" class="auth-control" placeholder="Enter password" required>
                </div>

                <button type="submit" id="login-btn" class="btn-auth-submit">
                    <span class="btn-text">Sign In</span>
                    <span class="loader" style="display: none;">Loading...</span>
                </button>
            </form>
        </div>
    `;

    document.body.appendChild(wrapper);

    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const savedTheme = localStorage.getItem('fuel_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';

    themeBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('fuel_theme', newTheme);
        themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
    });

    const loginForm = document.getElementById('login-form');
    const loginBtn = document.getElementById('login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const loader = loginBtn.querySelector('.loader');
    const errorBox = document.getElementById('auth-error-msg');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const usernameInput = document.getElementById('login-username').value.trim();
        const passwordInput = document.getElementById('login-password').value.trim();

        errorBox.style.display = 'none';

        if (!usernameInput || !passwordInput) {
            errorBox.textContent = 'Please fill in all fields.';
            errorBox.style.display = 'block';
            return;
        }

        loginBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'block';

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));

            // ဤနေရာတွင် admin@mm.com နှင့် admin အဖြစ် ပြင်ဆင်ထားပါသည်
            if (usernameInput === 'admin@mm.com' && passwordInput === 'admin') {
                const userData = { username: usernameInput, role: 'Administrator', loginAt: new Date().toISOString() };
                localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
                
                wrapper.remove();
                if (onLoginSuccess) onLoginSuccess();
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.style.display = 'block';
        } finally {
            loginBtn.disabled = false;
            btnText.style.display = 'block';
            loader.style.display = 'none';
        }
    });
}