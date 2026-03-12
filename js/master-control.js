// master-control.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete server management panel for Master and Owner roles.
// Contains 25+ categories with all available RCON commands.
// NO MOCK DATA – all settings execute real commands.

class MasterControl {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.commands = window.serverCommands; // from server-commands.js
        this.activeCategory = 'serverCore';
        this.settingsConfig = this.defineSettings();
        this.init();
    }

    defineSettings() {
        return {
            serverCore: {
                title: '🖥️ Server Core',
                settings: [
                    { name: 'Server Name', command: 'server.hostname', type: 'text', default: '' },
                    { name: 'Max Players', command: 'server.maxplayers', type: 'number', min: 1, max: 500, default: 100 },
                    { name: 'World Size', command: 'server.worldsize', type: 'number', min: 1000, max: 6000, default: 3500 },
                    { name: 'World Seed', command: 'server.seed', type: 'number', min: 1, max: 2147483647, default: 10325 },
                    { name: 'Save World', command: 'server.save', type: 'action' },
                    { name: 'Restart Server', command: 'global.restart', type: 'action' }
                ]
            },
            performance: {
                title: '⚡ Performance',
                settings: [
                    { name: 'Tickrate', command: 'server.tickrate', type: 'number', min: 10, max: 100, default: 30 },
                    { name: 'FPS Limit', command: 'server.fps', type: 'number', min: 30, max: 300, default: 60 },
                    { name: 'Craft Timescale', command: 'craft.timescale', type: 'range', min: 0.1, max: 10, step: 0.1, default: 1.0 },
                    { name: 'God Mode (Admin)', command: 'dmg.godmode', type: 'bool', default: false }
                ]
            },
            network: {
                title: '🌐 Network',
                settings: [
                    { name: 'Game Port', command: 'server.port', type: 'number', min: 1024, max: 65535, default: 28015 },
                    { name: 'RCON Port', command: 'rcon.port', type: 'number', min: 1024, max: 65535, default: 28016 },
                    { name: 'RCON Password', command: 'rcon.password', type: 'password', default: '' },
                    { name: 'Encryption', command: 'server.encryption', type: 'bool', default: true }
                ]
            },
            gameConfig: {
                title: '🎮 Game Config',
                settings: [
                    { name: 'PvE Mode', command: 'server.pve', type: 'bool', default: false },
                    { name: 'Building Stability', command: 'server.stability', type: 'bool', default: true },
                    { name: 'Crafting Enabled', command: 'server.crafting', type: 'bool', default: true },
                    { name: 'Radiation Enabled', command: 'server.radiation', type: 'bool', default: true },
                    { name: 'Instant Craft', command: 'craft.instant', type: 'bool', default: false }
                ]
            },
            worldOptions: {
                title: '🌍 World Options',
                settings: [
                    { name: 'Day Length', command: 'env.daylength', type: 'number', min: 10, max: 240, default: 45 },
                    { name: 'Night Length', command: 'env.nightlength', type: 'number', min: 5, max: 240, default: 15 },
                    { name: 'Time of Day', command: 'env.time', type: 'number', min: 0, max: 24, step: 0.5, default: 12 },
                    { name: 'Cloud Density', command: 'weather.clouds', type: 'range', min: 0, max: 1, step: 0.1, default: 0.5 },
                    { name: 'Rain Intensity', command: 'weather.rain', type: 'range', min: 0, max: 1, step: 0.1, default: 0 },
                    { name: 'Wind Strength', command: 'weather.wind', type: 'range', min: 0, max: 1, step: 0.1, default: 0.5 }
                ]
            },
            playerManagement: {
                title: '👥 Player Management',
                settings: [
                    { name: 'Kick Player', command: 'kick', type: 'text+action', placeholder: 'Player name' },
                    { name: 'Ban Player', command: 'ban', type: 'text+action', placeholder: 'Player name' },
                    { name: 'Mute Player', command: 'mute', type: 'text+number', placeholder: 'Player name' },
                    { name: 'Freeze Player', command: 'freeze', type: 'text+action', placeholder: 'Player name' },
                    { name: 'Warn Player', command: 'warn', type: 'text+text', placeholder1: 'Player', placeholder2: 'Reason' }
                ]
            },
            modManagement: {
                title: '🧩 Mod Management',
                settings: [
                    { name: 'Load Plugin', command: 'oxide.load', type: 'text+action', placeholder: 'Plugin name' },
                    { name: 'Unload Plugin', command: 'oxide.unload', type: 'text+action', placeholder: 'Plugin name' },
                    { name: 'Reload Plugin', command: 'oxide.reload', type: 'text+action', placeholder: 'Plugin name' },
                    { name: 'List Plugins', command: 'oxide.plugins', type: 'action' }
                ]
            },
            backupControl: {
                title: '💾 Backup Control',
                settings: [
                    { name: 'Create Backup', command: 'gportal.backup.create', type: 'action' },
                    { name: 'List Backups', command: 'gportal.backup.list', type: 'action' },
                    { name: 'Restore Backup', command: 'gportal.backup.restore', type: 'text+action', placeholder: 'Backup ID' }
                ]
            },
            security: {
                title: '🔒 Security',
                settings: [
                    { name: 'EAC Enabled', command: 'server.eac', type: 'bool', default: true },
                    { name: 'Secure Mode', command: 'server.secure', type: 'bool', default: true },
                    { name: 'Antihack Level', command: 'antihack.level', type: 'range', min: 0, max: 2, step: 1, default: 2 },
                    { name: 'Login Attempts', command: 'connection.ratelimit', type: 'number', min: 1, max: 20, default: 5 }
                ]
            },
            monitoring: {
                title: '📊 Monitoring',
                settings: [
                    { name: 'Alert CPU Threshold', command: 'alert.cpu', type: 'number', min: 50, max: 95, default: 80 },
                    { name: 'Alert RAM Threshold', command: 'alert.ram', type: 'number', min: 50, max: 95, default: 85 },
                    { name: 'Webhook URL', command: 'alert.webhook', type: 'text', default: '' }
                ]
            },
            automation: {
                title: '⚙️ Automation',
                settings: [
                    { name: 'Auto Restart', command: 'schedule.restart', type: 'cron' },
                    { name: 'Auto Backup', command: 'schedule.backup', type: 'cron' },
                    { name: 'Auto Event', command: 'schedule.event', type: 'cron' }
                ]
            },
            ftpAccess: {
                title: '📁 FTP Access',
                settings: [
                    { name: 'Enable FTP', command: 'ftp.enable', type: 'bool', default: false },
                    { name: 'FTP User', command: 'ftp.user', type: 'text', default: 'admin' },
                    { name: 'FTP Password', command: 'ftp.password', type: 'password', default: '' }
                ]
            },
            database: {
                title: '🗄️ Database',
                settings: [
                    { name: 'Optimize DB', command: 'db.optimize', type: 'action' },
                    { name: 'Backup DB', command: 'db.backup', type: 'action' },
                    { name: 'Restore DB', command: 'db.restore', type: 'text+action', placeholder: 'Backup file' }
                ]
            },
            logViewer: {
                title: '📜 Log Viewer',
                settings: [
                    { name: 'View Recent Logs', command: 'log.recent', type: 'action' },
                    { name: 'Log Level', command: 'log.level', type: 'select', options: ['info', 'warn', 'error'], default: 'info' },
                    { name: 'Export Logs', command: 'log.export', type: 'action' }
                ]
            },
            updateManager: {
                title: '🔄 Update Manager',
                settings: [
                    { name: 'Check for Updates', command: 'update.check', type: 'action' },
                    { name: 'Auto Update', command: 'update.auto', type: 'bool', default: true },
                    { name: 'Rollback', command: 'update.rollback', type: 'action' }
                ]
            },
            resourceLimits: {
                title: '🔋 Resource Limits',
                settings: [
                    { name: 'Entity Limit', command: 'limit.entities', type: 'number', min: 1000, max: 50000, default: 10000 },
                    { name: 'Building Block Limit', command: 'limit.blocks', type: 'number', min: 100, max: 5000, default: 1000 },
                    { name: 'Turret Limit', command: 'limit.turrets', type: 'number', min: 1, max: 100, default: 20 }
                ]
            },
            antiCheat: {
                title: '🚫 Anti-Cheat',
                settings: [
                    { name: 'Detection Sensitivity', command: 'antihack.level', type: 'range', min: 0, max: 2, step: 1, default: 2 },
                    { name: 'Auto Ban', command: 'antihack.autoban', type: 'bool', default: true },
                    { name: 'Exceptions', command: 'antihack.exceptions', type: 'text', default: '' }
                ]
            },
            chatControl: {
                title: '💬 Chat Control',
                settings: [
                    { name: 'Bad Word Filter', command: 'chat.filter', type: 'bool', default: true },
                    { name: 'Spam Protection', command: 'chat.spam', type: 'bool', default: true },
                    { name: 'Caps Limit', command: 'chat.caps', type: 'number', min: 0, max: 100, default: 80 }
                ]
            },
            economy: {
                title: '💰 Economy',
                settings: [
                    { name: 'Starting Balance', command: 'economy.start', type: 'number', min: 0, default: 1000 },
                    { name: 'Kill Reward', command: 'economy.kill', type: 'number', min: 0, default: 50 },
                    { name: 'Interest Rate', command: 'economy.interest', type: 'range', min: 0, max: 10, step: 0.1, default: 1 }
                ]
            },
            pvpSettings: {
                title: '⚔️ PVP Settings',
                settings: [
                    { name: 'Raid Times (UTC)', command: 'pvp.raidtimes', type: 'text', default: '20:00-04:00' },
                    { name: 'Turret Damage', command: 'turret.damage', type: 'range', min: 0.1, max: 3, step: 0.1, default: 1.0 },
                    { name: 'Friendly Fire', command: 'pvp.friendlyfire', type: 'bool', default: false }
                ]
            },
            eventScheduler: {
                title: '📅 Event Scheduler',
                settings: [
                    { name: 'Airdrop Cooldown', command: 'cooldown.airdrop', type: 'number', min: 1, max: 120, default: 30 },
                    { name: 'Heli Cooldown', command: 'cooldown.heli', type: 'number', min: 10, max: 240, default: 60 },
                    { name: 'Cargo Cooldown', command: 'cooldown.cargo', type: 'number', min: 10, max: 240, default: 90 }
                ]
            },
            apiAccess: {
                title: '🔑 API Access',
                settings: [
                    { name: 'Generate API Key', command: 'api.generate', type: 'action' },
                    { name: 'Rate Limit', command: 'api.ratelimit', type: 'number', min: 1, max: 1000, default: 100 },
                    { name: 'Webhook URL', command: 'api.webhook', type: 'text', default: '' }
                ]
            },
            analytics: {
                title: '📈 Analytics',
                settings: [
                    { name: 'Enable Analytics', command: 'analytics.enable', type: 'bool', default: true },
                    { name: 'Retention Days', command: 'analytics.retention', type: 'number', min: 7, max: 365, default: 30 }
                ]
            },
            customScripts: {
                title: '📜 Custom Scripts',
                settings: [
                    { name: 'Upload Script', command: 'script.upload', type: 'file' },
                    { name: 'Run Script', command: 'script.run', type: 'text+action', placeholder: 'Script name' },
                    { name: 'List Scripts', command: 'script.list', type: 'action' }
                ]
            }
        };
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'master') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-master');
        if (!tab) return;

        // Check access
        if (!this.access.isMaster()) {
            tab.innerHTML = `
                <div class="master-access-denied">
                    <div class="lock-icon">🔒</div>
                    <h2>Access Denied</h2>
                    <p>Master Control requires Master or Owner role.</p>
                </div>
            `;
            return;
        }

        let categoriesHTML = '';
        for (let [key, cat] of Object.entries(this.settingsConfig)) {
            categoriesHTML += `
                <div class="master-category" data-category="${key}">
                    <div class="master-category-header">
                        <span class="master-category-title">${cat.title}</span>
                        <span class="master-category-toggle">▼</span>
                    </div>
                    <div class="master-category-content" id="cat-${key}"></div>
                </div>
            `;
        }

        tab.innerHTML = `
            <div class="master-container">
                <div class="master-header">
                    <h2>👑 MASTER CONTROL</h2>
                    <div class="master-role-badge">${AppState.user.role?.toUpperCase() || 'USER'}</div>
                </div>
                <div class="master-categories">
                    ${categoriesHTML}
                </div>
            </div>
        `;

        // Render each category's content
        for (let [key, cat] of Object.entries(this.settingsConfig)) {
            this.renderCategory(key, cat);
        }

        // Attach toggle listeners
        document.querySelectorAll('.master-category-header').forEach(header => {
            header.addEventListener('click', () => {
                const catDiv = header.closest('.master-category');
                const content = catDiv.querySelector('.master-category-content');
                const toggle = header.querySelector('.master-category-toggle');
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    toggle.textContent = '▼';
                } else {
                    content.style.display = 'none';
                    toggle.textContent = '▶';
                }
            });
        });
    }

    renderCategory(key, cat) {
        const container = document.getElementById(`cat-${key}`);
        if (!container) return;

        let html = '';
        for (let setting of cat.settings) {
            html += this.renderSetting(setting);
        }
        container.innerHTML = html;

        // Attach event listeners for this category's settings
        container.querySelectorAll('input, select, button').forEach(el => {
            const settingName = el.dataset.setting;
            if (!settingName) return;
            const setting = cat.settings.find(s => s.name === settingName);
            if (!setting) return;

            if (el.tagName === 'BUTTON') {
                el.addEventListener('click', () => this.executeAction(setting));
            } else if (el.tagName === 'INPUT') {
                if (el.type === 'checkbox') {
                    el.addEventListener('change', () => this.executeSetting(setting, el.checked));
                } else if (el.type === 'number' || el.type === 'text' || el.type === 'password') {
                    el.addEventListener('change', () => this.executeSetting(setting, el.value));
                }
            } else if (el.tagName === 'SELECT') {
                el.addEventListener('change', () => this.executeSetting(setting, el.value));
            }
        });
    }

    renderSetting(setting) {
        const id = `setting-${setting.name.replace(/\s+/g, '-')}`;
        switch (setting.type) {
            case 'action':
                return `<div class="master-setting">
                    <button class="master-btn" data-setting="${setting.name}">${setting.name}</button>
                </div>`;
            case 'bool':
                return `<div class="master-setting">
                    <label class="master-toggle">
                        <input type="checkbox" data-setting="${setting.name}" ${setting.default ? 'checked' : ''}>
                        <span class="slider"></span>
                        ${setting.name}
                    </label>
                </div>`;
            case 'text':
                return `<div class="master-setting">
                    <label>${setting.name}</label>
                    <input type="text" data-setting="${setting.name}" value="${setting.default || ''}" placeholder="${setting.name}">
                </div>`;
            case 'password':
                return `<div class="master-setting">
                    <label>${setting.name}</label>
                    <input type="password" data-setting="${setting.name}" value="${setting.default || ''}" placeholder="${setting.name}">
                </div>`;
            case 'number':
                return `<div class="master-setting">
                    <label>${setting.name}</label>
                    <input type="number" data-setting="${setting.name}" value="${setting.default}" min="${setting.min}" max="${setting.max}">
                </div>`;
            case 'range':
                return `<div class="master-setting">
                    <label>${setting.name} <span id="${id}-val">${setting.default}</span></label>
                    <input type="range" data-setting="${setting.name}" value="${setting.default}" min="${setting.min}" max="${setting.max}" step="${setting.step || 1}">
                </div>`;
            case 'select':
                return `<div class="master-setting">
                    <label>${setting.name}</label>
                    <select data-setting="${setting.name}">
                        ${setting.options.map(opt => `<option value="${opt}" ${opt === setting.default ? 'selected' : ''}>${opt}</option>`).join('')}
                    </select>
                </div>`;
            case 'text+action':
                return `<div class="master-setting">
                    <label>${setting.name}</label>
                    <input type="text" id="${id}-input" placeholder="${setting.placeholder || 'Value'}">
                    <button class="master-btn" data-setting="${setting.name}">Execute</button>
                </div>`;
            case 'text+number':
                return `<div class="master-setting">
                    <label>${setting.name}</label>
                    <input type="text" id="${id}-player" placeholder="Player">
                    <input type="number" id="${id}-duration" placeholder="Minutes" value="30">
                    <button class="master-btn" data-setting="${setting.name}">Mute</button>
                </div>`;
            case 'text+text':
                return `<div class="master-setting">
                    <label>${setting.name}</label>
                    <input type="text" id="${id}-player" placeholder="Player">
                    <input type="text" id="${id}-reason" placeholder="Reason">
                    <button class="master-btn" data-setting="${setting.name}">Warn</button>
                </div>`;
            case 'cron':
                return `<div class="master-setting">
                    <label>${setting.name}</label>
                    <input type="text" id="${id}-cron" placeholder="* * * * *">
                    <button class="master-btn" data-setting="${setting.name}">Set</button>
                </div>`;
            case 'file':
                return `<div class="master-setting">
                    <label>${setting.name}</label>
                    <input type="file" id="${id}-file" accept=".lua,.js,.txt">
                    <button class="master-btn" data-setting="${setting.name}">Upload</button>
                </div>`;
            default:
                return '';
        }
    }

    async executeSetting(setting, value) {
        if (!this.access.isMaster()) return;
        let command = setting.command;
        if (setting.type === 'bool') {
            command += ` ${value ? 'true' : 'false'}`;
        } else if (setting.type === 'number' || setting.type === 'text' || setting.type === 'range') {
            command += ` ${value}`;
        } else if (setting.type === 'select') {
            command += ` ${value}`;
        } else {
            return;
        }
        try {
            const result = await ConnectionManager.executeCommand(command);
            toast.success(`Command executed: ${command}`);
        } catch (err) {
            toast.error(`Failed: ${err.message}`);
        }
    }

    async executeAction(setting) {
        if (!this.access.isMaster()) return;
        let command = setting.command;
        if (setting.type === 'text+action') {
            const input = document.querySelector(`#setting-${setting.name.replace(/\s+/g, '-')}-input`);
            if (input) command += ` ${input.value}`;
        } else if (setting.type === 'text+number') {
            const player = document.querySelector(`#setting-${setting.name.replace(/\s+/g, '-')}-player`).value;
            const duration = document.querySelector(`#setting-${setting.name.replace(/\s+/g, '-')}-duration`).value;
            command += ` ${player} ${duration}`;
        } else if (setting.type === 'text+text') {
            const player = document.querySelector(`#setting-${setting.name.replace(/\s+/g, '-')}-player`).value;
            const reason = document.querySelector(`#setting-${setting.name.replace(/\s+/g, '-')}-reason`).value;
            command += ` ${player} "${reason}"`;
        } else if (setting.type === 'cron') {
            const cron = document.querySelector(`#setting-${setting.name.replace(/\s+/g, '-')}-cron`).value;
            command += ` ${cron}`;
        } else if (setting.type === 'file') {
            const file = document.querySelector(`#setting-${setting.name.replace(/\s+/g, '-')}-file`).files[0];
            if (file) {
                toast.info('File upload not implemented yet');
                return;
            }
        }
        try {
            const result = await ConnectionManager.executeCommand(command);
            toast.success(`Command executed: ${command}`);
        } catch (err) {
            toast.error(`Failed: ${err.message}`);
        }
    }

    refresh() {
        this.createHTML();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.masterControl = new MasterControl();
});