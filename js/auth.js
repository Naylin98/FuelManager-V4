// js/auth.js

const AUTH_KEY = 'fuel_app_current_user';
// သင့် Google Apps Script Web App URL ကို ဤနေရာတွင် ထည့်ပါ
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxYvzFOpcsTNxeGGrS6lJ1jG23-7p4Gqz4olWD1WLM7xvK1tdR4dZ9JomnxBRZ-UPep/exec'; 

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
        <div class="auth-card" style="max-height: 90vh; overflow-y: auto;">
            <div class="auth-header">
                <div class="logo-icon">⛽</div>
                <h2>Fuel Station OS</h2>
                <p id="auth-subtitle">Please sign in to continue</p>
                <button id="theme-toggle" style="background:none; border:none; cursor:pointer; font-size: 20px; margin-top: 10px;">
                    <span id="theme-icon">🌙</span>
                </button>
            </div>

            <div id="auth-error-msg" class="auth-error" style="display:none; color: red; text-align: center; margin-bottom: 10px;"></div>
            <div id="auth-success-msg" class="auth-success" style="display:none; color: green; text-align: center; margin-bottom: 10px;"></div>

            <!-- Login Form -->
            <form id="login-form" class="auth-form">
                <div class="auth-group">
                    <label>Username</label>
                    <input type="text" id="login-username" class="auth-control" placeholder="Enter username" required>
                </div>
                <div class="auth-group">
                    <label>Password</label>
                    <input type="password" id="login-password" class="auth-control" placeholder="Enter password" required>
                </div>
                <button type="submit" id="login-btn" class="btn-auth-submit">
                    <span class="btn-text">Sign In</span>
                    <span class="loader" style="display: none;">Loading...</span>
                </button>
                <p style="text-align: center; margin-top: 15px; font-size: 14px;">
                    Don't have an account? <a href="#" id="show-signup" style="color: var(--primary);">Sign up</a>
                </p>
            </form>

            <!-- Signup Form -->
            <form id="signup-form" class="auth-form" style="display: none;">
                <div class="auth-group">
                    <label>Username</label>
                    <input type="text" id="signup-username" class="auth-control" placeholder="Create username" required>
                </div>
                <div class="auth-group">
                    <label>Password</label>
                    <input type="password" id="signup-password" class="auth-control" placeholder="Create password" required>
                </div>
                <div class="auth-group">
                    <label>Role</label>
                    <select id="signup-role" class="auth-control" style="width: 100%; padding: 10px; border-radius: 8px;">
                        <option value="User">User</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>
                
                <!-- Tab Permissions (Only for User) -->
                <div class="auth-group" id="tabs-permission-group">
                    <label style="margin-bottom: 8px; display: block;">Allowed Tabs (For User Role)</label>
                    <div style="display: flex; flex-direction: column; gap: 8px; font-size: 14px;">
                        <label><input type="checkbox" class="tab-cb" value="/dashboard" checked> Dashboard</label>
                        <label><input type="checkbox" class="tab-cb" value="/fuel"> Fuel Entry</label>
                        <label><input type="checkbox" class="tab-cb" value="/draft"> Drafts</label>
                        <label><input type="checkbox" class="tab-cb" value="/inventory"> Inventory</label>
                        <label><input type="checkbox" class="tab-cb" value="/reports"> Reports</label>
                        <label><input type="checkbox" class="tab-cb" value="/settings"> Settings</label>
                    </div>
                </div>

                <button type="submit" id="signup-btn" class="btn-auth-submit" style="margin-top: 15px;">
                    <span class="btn-text">Sign Up</span>
                    <span class="loader" style="display: none;">Creating...</span>
                </button>
                <p style="text-align: center; margin-top: 15px; font-size: 14px;">
                    Already have an account? <a href="#" id="show-login" style="color: var(--primary);">Sign in</a>
                </p>
            </form>
        </div>
    `;

    document.body.appendChild(wrapper);

    // Theme Toggle Logic
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const savedTheme = localStorage.getItem('fuel_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'light' ? '🌙' : '☀️';

    themeBtn.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('fuel_theme', newTheme);
        themeIcon.textContent = newTheme === 'light' ? '🌙' : '☀️';
    });

    // Forms & Elements
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const errorBox = document.getElementById('auth-error-msg');
    const successBox = document.getElementById('auth-success-msg');
    const authSubtitle = document.getElementById('auth-subtitle');
    const roleSelect = document.getElementById('signup-role');
    const tabsGroup = document.getElementById('tabs-permission-group');

    // Toggle Forms
    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authSubtitle.textContent = 'Create a new account';
        errorBox.style.display = 'none';
        successBox.style.display = 'none';
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        authSubtitle.textContent = 'Please sign in to continue';
        errorBox.style.display = 'none';
        successBox.style.display = 'none';
    });

    // Show/Hide Tabs Checkbox based on Role Selection
    roleSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Admin') {
            tabsGroup.style.display = 'none'; // Admin gets all automatically
        } else {
            tabsGroup.style.display = 'block';
        }
    });

    // Handle Signup
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';
        successBox.style.display = 'none';
        
        const username = document.getElementById('signup-username').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        const role = roleSelect.value;
        let allowedTabs = [];
        
        if (role === 'User') {
            document.querySelectorAll('.tab-cb:checked').forEach(cb => allowedTabs.push(cb.value));
            if(allowedTabs.length === 0) {
                errorBox.textContent = "Please select at least one tab for User.";
                errorBox.style.display = 'block';
                return;
            }
        }

        const signupBtn = document.getElementById('signup-btn');
        signupBtn.disabled = true;
        signupBtn.querySelector('.btn-text').style.display = 'none';
        signupBtn.querySelector('.loader').style.display = 'inline-block';

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: "signup", username, password, role, allowedTabs }),
            });
            const result = await response.json();

            if (result.success) {
                successBox.textContent = result.message;
                successBox.style.display = 'block';
                signupForm.reset();
                setTimeout(() => showLoginLink.click(), 2000); // Switch to login after 2 sec
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            errorBox.textContent = err.message || "Signup failed. Check network.";
            errorBox.style.display = 'block';
        } finally {
            signupBtn.disabled = false;
            signupBtn.querySelector('.btn-text').style.display = 'block';
            signupBtn.querySelector('.loader').style.display = 'none';
        }
    });

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        const loginBtn = document.getElementById('login-btn');
        loginBtn.disabled = true;
        loginBtn.querySelector('.btn-text').style.display = 'none';
        loginBtn.querySelector('.loader').style.display = 'inline-block';

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: JSON.stringify({ action: "login", username, password }),
            });
            const result = await response.json();

            if (result.success) {
                localStorage.setItem(AUTH_KEY, JSON.stringify({
                    username: result.user.username,
                    role: result.user.role,
                    allowedTabs: result.user.allowedTabs
                }));
                wrapper.remove();
                if (onLoginSuccess) onLoginSuccess();
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            errorBox.textContent = err.message || "Login failed. Check network.";
            errorBox.style.display = 'block';
        } finally {
            loginBtn.disabled = false;
            loginBtn.querySelector('.btn-text').style.display = 'block';
            loginBtn.querySelector('.loader').style.display = 'none';
        }
    });
}