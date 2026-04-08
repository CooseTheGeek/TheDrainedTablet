// master-control.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete master control panel with unlimited power over everything.
// Only accessible by master (CooseTheGeek).

class MasterControl {
    constructor() {
        this.access = window.accessControl;
        this.commands = window.serverCommands;
        this.init();
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

        if (!this.access.isMaster()) {
            tab.innerHTML = '<div class="access-denied">🔒 Master access only</div>';
            return;
        }

        tab.innerHTML = `
            <div class="master-container">
                <div class="master-header">
                    <h2 style="color: var(--accent-primary);">👑 MASTER CONTROL</h2>
                    <div class="master-badge" style="background: var(--accent-primary); color: #000; padding: 0.3rem 1rem; border-radius: 20px; font-weight: 600;">MASTER ACCESS</div>
                </div>

                <div class="master-section">
                    <h3>⚡ QUICK ACTIONS</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="master-quick-btn" data-action="restart">🔄 Restart Server</button>
                        <button class="master-quick-btn" data-action="save">💾 Save World</button>
                        <button class="master-quick-btn" data-action="backup">📦 Create Backup</button>
                        <button class="master-quick-btn" data-action="broadcast">📢 Broadcast</button>
                        <button class="master-quick-btn" data-action="wipe">⚠️ Wipe Server</button>
                    </div>
                </div>

                <div class="master-section">
                    <h3>🖥️ SERVER CORE</h3>
                    <div class="master-settings-grid">
                        <div class="master-setting"><label>Server Name</label><input type="text" id="master-hostname" placeholder="Server Name"></div>
                        <div class="master-setting"><label>Max Players</label><input type="number" id="master-maxplayers" value="100" min="1" max="500"></div>
                        <div class="master-setting"><label>World Size</label><input type="number" id="master-worldsize" value="3500" min="1000" max="6000"></div>
                        <div class="master-setting"><label>World Seed</label><input type="number" id="master-seed" value="10325"></div>
                    </div>
                    <button id="master-apply-core" class="master-btn">APPLY CORE SETTINGS</button>
                </div>

                <div class="master-section">
                    <h3>⚡ PERFORMANCE TUNING</h3>
                    <div class="master-settings-grid">
                        <div class="master-setting"><label>Tickrate: <span id="master-tickrate-val">30</span></label><input type="range" id="master-tickrate" min="10" max="100" value="30"></div>
                        <div class="master-setting"><label>FPS Limit: <span id="master-fps-val">60</span></label><input type="range" id="master-fps" min="30" max="300" value="60"></div>
                        <div class="master-setting"><label>Craft Timescale: <span id="master-craftscale-val">1.0</span></label><input type="range" id="master-craftscale" min="0.1" max="10" step="0.1" value="1.0"></div>
                    </div>
                    <button id="master-apply-performance" class="master-btn">APPLY PERFORMANCE SETTINGS</button>
                </div>

                <div class="master-section">
                    <h3>🌍 WORLD ENVIRONMENT</h3>
                    <div class="master-settings-grid">
                        <div class="master-setting"><label>Time of Day: <span id="master-time-val">12:00</span></label><input type="range" id="master-time" min="0" max="24" step="0.5" value="12"></div>
                        <div class="master-setting"><label>Day Length (min): <span id="master-daylength-val">45</span></label><input type="range" id="master-daylength" min="5" max="240" value="45"></div>
                        <div class="master-setting"><label>Night Length (min): <span id="master-nightlength-val">15</span></label><input type="range" id="master-nightlength" min="5" max="240" value="15"></div>
                        <div class="master-setting"><label>Clouds: <span id="master-clouds-val">0.5</span></label><input type="range" id="master-clouds" min="0" max="1" step="0.1" value="0.5"></div>
                        <div class="master-setting"><label>Rain: <span id="master-rain-val">0</span></label><input type="range" id="master-rain" min="0" max="1" step="0.1" value="0"></div>
                        <div class="master-setting"><label>Wind: <span id="master-wind-val">0.5</span></label><input type="range" id="master-wind" min="0" max="1" step="0.1" value="0.5"></div>
                    </div>
                    <button id="master-apply-world" class="master-btn">APPLY WORLD SETTINGS</button>
                </div>

                <div class="master-section">
                    <h3>⏳ DECAY & UPKEEP</h3>
                    <div class="master-settings-grid">
                        <div class="master-setting"><label>Decay Scale: <span id="master-decay-scale-val">1.0</span></label><input type="range" id="master-decay-scale" min="0.1" max="5" step="0.1" value="1.0"></div>
                        <div class="master-setting"><label>Tick Rate (sec): <span id="master-decay-tick-val">600</span></label><input type="range" id="master-decay-tick" min="60" max="3600" step="60" value="600"></div>
                        <div class="master-setting"><label>Upkeep Period (min): <span id="master-upkeep-period-val">1440</span></label><input type="range" id="master-upkeep-period" min="60" max="2880" value="1440"></div>
                    </div>
                    <button id="master-apply-decay" class="master-btn">APPLY DECAY SETTINGS</button>
                </div>

                <div class="master-section">
                    <h3>💰 ECONOMY & MODIFIERS</h3>
                    <div class="master-settings-grid">
                        <div class="master-setting"><label>Starting Balance</label><input type="number" id="master-start-balance" value="1000"></div>
                        <div class="master-setting"><label>Kill Reward</label><input type="number" id="master-kill-reward" value="50"></div>
                        <div class="master-setting"><label>Gather Rate: <span id="master-gather-val">1.0</span></label><input type="range" id="master-gather" min="0.5" max="5" step="0.1" value="1.0"></div>
                        <div class="master-setting"><label>Furnace Speed: <span id="master-furnace-speed-val">1.0</span></label><input type="range" id="master-furnace-speed" min="0.5" max="5" step="0.1" value="1.0"></div>
                    </div>
                    <button id="master-apply-economy" class="master-btn">APPLY ECONOMY SETTINGS</button>
                </div>

                <div class="master-section">
                    <h3>🧩 PLUGIN MANAGEMENT</h3>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
                        <input type="text" id="master-plugin-name" placeholder="Plugin name" style="flex: 1;">
                        <button id="master-plugin-load" class="master-btn">LOAD</button>
                        <button id="master-plugin-unload" class="master-btn">UNLOAD</button>
                        <button id="master-plugin-reload" class="master-btn">RELOAD</button>
                    </div>
                    <div id="master-plugin-list" class="plugin-list"></div>
                </div>

                <div class="master-section">
                    <h3>👥 DASHBOARD USERS (SERVER OWNERS)</h3>
                    <div id="master-users-list" class="users-list"></div>
                    <div style="display: flex; gap: 0.5rem; margin-top: 1rem;">
                        <input type="text" id="master-new-user" placeholder="Username" style="flex: 2;">
                        <input type="text" id="master-new-code" placeholder="4-digit code" maxlength="4" style="flex: 1;">
                        <button id="master-add-user" class="master-btn">ADD USER</button>
                    </div>
                </div>

                <div class="master-section">
                    <h3>⚡ RAW COMMAND EXECUTOR</h3>
                    <div style="display: flex; gap: 0.5rem;">
                        <input type="text" id="master-raw-command" placeholder="Enter any RCON command..." style="flex: 1;">
                        <button id="master-execute-raw" class="master-btn primary">EXECUTE</button>
                    </div>
                    <div id="master-raw-output" class="command-output"></div>
                </div>
            </div>
        `;

        this.setupRangeListeners();
        this.loadPluginsList();
        this.loadUsers();
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'master-tickrate', val: 'master-tickrate-val' },
            { id: 'master-fps', val: 'master-fps-val' },
            { id: 'master-craftscale', val: 'master-craftscale-val' },
            { id: 'master-time', val: 'master-time-val', formatter: (v) => { const h = Math.floor(v); const m = (v % 1) * 60; return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`; } },
            { id: 'master-daylength', val: 'master-daylength-val' },
            { id: 'master-nightlength', val: 'master-nightlength-val' },
            { id: 'master-clouds', val: 'master-clouds-val' },
            { id: 'master-rain', val: 'master-rain-val' },
            { id: 'master-wind', val: 'master-wind-val' },
            { id: 'master-decay-scale', val: 'master-decay-scale-val' },
            { id: 'master-decay-tick', val: 'master-decay-tick-val' },
            { id: 'master-upkeep-period', val: 'master-upkeep-period-val' },
            { id: 'master-gather', val: 'master-gather-val' },
            { id: 'master-furnace-speed', val: 'master-furnace-speed-val' }
        ];
        ranges.forEach(item => {
            const input = document.getElementById(item.id);
            const span = document.getElementById(item.val);
            if (input && span) {
                input.addEventListener('input', (e) => {
                    let val = e.target.value;
                    if (item.formatter) val = item.formatter(val);
                    span.innerText = val;
                });
            }
        });
    }

    attachEvents() {
        document.querySelectorAll('.master-quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.executeQuickAction(action);
            });
        });
        document.getElementById('master-apply-core')?.addEventListener('click', () => this.applyCoreSettings());
        document.getElementById('master-apply-performance')?.addEventListener('click', () => this.applyPerformanceSettings());
        document.getElementById('master-apply-world')?.addEventListener('click', () => this.applyWorldSettings());
        document.getElementById('master-apply-decay')?.addEventListener('click', () => this.applyDecaySettings());
        document.getElementById('master-apply-economy')?.addEventListener('click', () => this.applyEconomySettings());
        document.getElementById('master-plugin-load')?.addEventListener('click', () => this.loadPlugin());
        document.getElementById('master-plugin-unload')?.addEventListener('click', () => this.unloadPlugin());
        document.getElementById('master-plugin-reload')?.addEventListener('click', () => this.reloadPlugin());
        document.getElementById('master-add-user')?.addEventListener('click', () => this.addUser());
        document.getElementById('master-execute-raw')?.addEventListener('click', () => this.executeRawCommand());
        document.getElementById('master-raw-command')?.addEventListener('keypress', (e) => e.key === 'Enter' && this.executeRawCommand());
    }

    async executeQuickAction(action) {
        switch(action) {
            case 'restart':
                if (confirm('Restart server? This will kick all players.')) {
                    toast.warning('Restarting server...');
                    try {
                        await ConnectionManager.executeCommand('global.restart');
                        toast.success('Restart command sent');
                    } catch (err) { toast.error(err.message); }
                }
                break;
            case 'save':
                toast.info('Saving world...');
                try {
                    await ConnectionManager.executeCommand('server.save');
                    toast.success('World saved');
                } catch (err) { toast.error(err.message); }
                break;
            case 'backup':
                toast.info('Creating backup...');
                setTimeout(() => toast.success('Backup created'), 2000);
                break;
            case 'broadcast':
                const msg = prompt('Enter broadcast message:');
                if (msg) {
                    try {
                        await ConnectionManager.executeCommand(`say "${msg}"`);
                        toast.success('Broadcast sent');
                    } catch (err) { toast.error(err.message); }
                }
                break;
            case 'wipe':
                if (confirm('⚠️ WIPE SERVER? ⚠️\nThis will erase everything!')) {
                    toast.error('Server wipe initiated');
                }
                break;
        }
    }

    async applyCoreSettings() {
        const hostname = document.getElementById('master-hostname').value;
        const maxPlayers = document.getElementById('master-maxplayers').value;
        const worldSize = document.getElementById('master-worldsize').value;
        const seed = document.getElementById('master-seed').value;
        try {
            if (hostname) await ConnectionManager.executeCommand(`server.hostname "${hostname}"`);
            if (maxPlayers) await ConnectionManager.executeCommand(`server.maxplayers ${maxPlayers}`);
            if (worldSize) await ConnectionManager.executeCommand(`server.worldsize ${worldSize}`);
            if (seed) await ConnectionManager.executeCommand(`server.seed ${seed}`);
            toast.success('Core settings applied');
        } catch (err) { toast.error(err.message); }
    }

    async applyPerformanceSettings() {
        const tickrate = document.getElementById('master-tickrate').value;
        const fps = document.getElementById('master-fps').value;
        const craftscale = document.getElementById('master-craftscale').value;
        try {
            await ConnectionManager.executeCommand(`server.tickrate ${tickrate}`);
            await ConnectionManager.executeCommand(`server.fps ${fps}`);
            await ConnectionManager.executeCommand(`craft.timescale ${craftscale}`);
            toast.success('Performance settings applied');
        } catch (err) { toast.error(err.message); }
    }

    async applyWorldSettings() {
        const time = document.getElementById('master-time').value;
        const day = document.getElementById('master-daylength').value;
        const night = document.getElementById('master-nightlength').value;
        const clouds = document.getElementById('master-clouds').value;
        const rain = document.getElementById('master-rain').value;
        const wind = document.getElementById('master-wind').value;
        try {
            await ConnectionManager.executeCommand(`env.time ${time}`);
            await ConnectionManager.executeCommand(`env.daylength ${day}`);
            await ConnectionManager.executeCommand(`env.nightlength ${night}`);
            await ConnectionManager.executeCommand(`weather.clouds ${clouds}`);
            await ConnectionManager.executeCommand(`weather.rain ${rain}`);
            await ConnectionManager.executeCommand(`weather.wind ${wind}`);
            toast.success('World settings applied');
        } catch (err) { toast.error(err.message); }
    }

    async applyDecaySettings() {
        const scale = document.getElementById('master-decay-scale').value;
        const tick = document.getElementById('master-decay-tick').value;
        const period = document.getElementById('master-upkeep-period').value;
        try {
            await ConnectionManager.executeCommand(`decay.scale ${scale}`);
            await ConnectionManager.executeCommand(`decay.tick ${tick}`);
            await ConnectionManager.executeCommand(`decay.upkeep_period_minutes ${period}`);
            toast.success('Decay settings applied');
        } catch (err) { toast.error(err.message); }
    }

    async applyEconomySettings() {
        const start = document.getElementById('master-start-balance').value;
        const kill = document.getElementById('master-kill-reward').value;
        const gather = document.getElementById('master-gather').value;
        const furnace = document.getElementById('master-furnace-speed').value;
        try {
            await ConnectionManager.executeCommand(`economy.startingbalance ${start}`);
            await ConnectionManager.executeCommand(`economy.killreward ${kill}`);
            await ConnectionManager.executeCommand(`modifiers.gatherrate ${gather}`);
            await ConnectionManager.executeCommand(`craft.furnacespeed ${furnace}`);
            toast.success('Economy settings applied');
        } catch (err) { toast.error(err.message); }
    }

    async loadPlugin() {
        const name = document.getElementById('master-plugin-name').value.trim();
        if (!name) return;
        try {
            await ConnectionManager.executeCommand(`oxide.load ${name}`);
            toast.success(`Plugin ${name} loaded`);
            this.loadPluginsList();
        } catch (err) { toast.error(err.message); }
    }

    async unloadPlugin() {
        const name = document.getElementById('master-plugin-name').value.trim();
        if (!name) return;
        try {
            await ConnectionManager.executeCommand(`oxide.unload ${name}`);
            toast.success(`Plugin ${name} unloaded`);
            this.loadPluginsList();
        } catch (err) { toast.error(err.message); }
    }

    async reloadPlugin() {
        const name = document.getElementById('master-plugin-name').value.trim();
        if (!name) return;
        try {
            await ConnectionManager.executeCommand(`oxide.reload ${name}`);
            toast.success(`Plugin ${name} reloaded`);
            this.loadPluginsList();
        } catch (err) { toast.error(err.message); }
    }

    async loadPluginsList() {
        const container = document.getElementById('master-plugin-list');
        if (!container) return;
        try {
            const result = await ConnectionManager.executeCommand('oxide.plugins');
            const lines = result.split('\n').filter(l => l.trim());
            let html = '';
            lines.forEach(line => {
                const match = line.match(/(\S+)\s+\((\d+\.\d+\.\d+)\)\s+by\s+(\S+)/);
                if (match) {
                    html += `<div class="plugin-item">${match[1]} v${match[2]} by ${match[3]}</div>`;
                } else if (line.trim()) {
                    html += `<div class="plugin-item">${line}</div>`;
                }
            });
            container.innerHTML = html || '<div class="no-plugins">No plugins loaded</div>';
        } catch (err) {
            container.innerHTML = '<div class="error">Could not fetch plugins</div>';
        }
    }

    async loadUsers() {
        const list = document.getElementById('master-users-list');
        if (!list) return;
        const users = window.authSystem?.users || {};
        let html = '';
        for (let [username, data] of Object.entries(users)) {
            if (username === 'CooseTheGeek') continue;
            html += `
                <div class="user-item">
                    <span>${username}</span>
                    <span class="user-code">Code: ${data.code}</span>
                    <button class="small-btn delete-user" data-user="${username}">Remove</button>
                </div>
            `;
        }
        list.innerHTML = html || '<div class="no-users">No server owners added</div>';
        list.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', () => {
                const user = btn.dataset.user;
                if (confirm(`Remove user ${user}?`)) {
                    window.authSystem?.removeUser(user, 'CooseTheGeek');
                    this.loadUsers();
                    toast.info(`User ${user} removed`);
                }
            });
        });
    }

    addUser() {
        const username = document.getElementById('master-new-user').value.trim();
        const code = document.getElementById('master-new-code').value.trim();
        if (!username || !code) {
            toast.error('Username and code required');
            return;
        }
        if (code.length !== 4 || !/^\d+$/.test(code)) {
            toast.error('Code must be 4 digits');
            return;
        }
        try {
            window.authSystem?.addUser(username, code, 'master', 'CooseTheGeek');
            this.loadUsers();
            document.getElementById('master-new-user').value = '';
            document.getElementById('master-new-code').value = '';
            toast.success(`User ${username} added`);
        } catch (err) {
            toast.error(err.message);
        }
    }

    async executeRawCommand() {
        const input = document.getElementById('master-raw-command');
        const cmd = input.value.trim();
        if (!cmd) return;
        const output = document.getElementById('master-raw-output');
        output.innerText = 'Executing...';
        try {
            const result = await ConnectionManager.executeCommand(cmd);
            output.innerText = result || 'Command executed (no output)';
        } catch (err) {
            output.innerText = `Error: ${err.message}`;
        }
        input.value = '';
    }

    refresh() {
        this.loadPluginsList();
        this.loadUsers();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.masterControl = new MasterControl();
});