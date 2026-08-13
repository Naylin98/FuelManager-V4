// js/settings.js

export function renderSettingsModule(container) {
    container.innerHTML = `
        <div class="settings-container">
            <div class="settings-header">
                <h3>⚙️ System Settings & Preferences</h3>
                <p>Customize your application appearance and local configurations.</p>
            </div>

            <!-- Appearance Section -->
            <div class="glass-panel settings-section">
                <h4>🎨 Appearance & Theme</h4>
                
                <div class="setting-item" style="display: block; border-bottom: none;">
                    <div class="setting-info" style="margin-bottom: 12px;">
                        <label>Interface Theme</label>
                        <p>Select your preferred visual mode for the dashboard.</p>
                    </div>

                    <div class="theme-options">
                        <div class="theme-card" data-theme="light" id="theme-light">
                            <div class="theme-preview preview-light"></div>
                            <span>Light Mode</span>
                        </div>
                        <div class="theme-card" data-theme="dark" id="theme-dark">
                            <div class="theme-preview preview-dark"></div>
                            <span>Dark Mode</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- General Configurations -->
            <div class="glass-panel settings-section">
                <h4>🛠️ General Preferences</h4>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <label>Auto Save Drafts</label>
                        <p>Automatically cache form inputs as you type.</p>
                    </div>
                    <input type="checkbox" id="setting-auto-draft" checked style="width: 20px; height: 20px; cursor: pointer;">
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <label>Sound Notifications</label>
                        <p>Play audio cues on successful form submission.</p>
                    </div>
                    <input type="checkbox" id="setting-sound" style="width: 20px; height: 20px; cursor: pointer;">
                </div>
            </div>

            <div class="settings-actions">
                <button id="btn-save-config" class="btn-save-settings">Save Preferences</button>
            </div>
        </div>
    `;

    initSettingsEvents();
}

function initSettingsEvents() {
    const currentTheme = localStorage.getItem('app_theme') || 'light';
    updateThemeCardActive(currentTheme);

    // Theme Card Click Events
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const selectedTheme = card.getAttribute('data-theme');
            updateThemeCardActive(selectedTheme);
            applyTheme(selectedTheme);
        });
    });

    // Save Configurations Button
    document.getElementById('btn-save-config').addEventListener('click', () => {
        const autoDraft = document.getElementById('setting-auto-draft').checked;
        const soundEnabled = document.getElementById('setting-sound').checked;

        localStorage.setItem('pref_auto_draft', autoDraft);
        localStorage.setItem('pref_sound', soundEnabled);

        alert('Settings saved successfully!');
    });
}

function updateThemeCardActive(theme) {
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    if (theme === 'dark') {
        document.getElementById('theme-dark').classList.add('active');
    } else {
        document.getElementById('theme-light').classList.add('active');
    }
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('app_theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('app_theme', 'light');
    }
}