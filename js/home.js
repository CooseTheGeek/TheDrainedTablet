// home.js – DRAINED TABLET ULTIMATE v7.0.0 (with GPortal player count)

class Home {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.stats = {
            fps: 0,
            cpu: 0,
            memory: 0,
            players: 0,
            maxPlayers: 100,
            uptime: '0d 0h 0m',
            entities: 0
        };
        this.recentEvents = [];
        this.playerHistory = [];
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.startUpdates();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'home') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-home');
        if (!tab) return;

        tab.innerHTML = `
            <div class="home-container">
                <div class="home-header">
                    <h2>🏠 DASHBOARD</h2>
                    <button id="home-refresh" class="home-btn">🔄 REFRESH</button>
                </div>
                <div class="home-grid" id="home-grid"></div>
                <div class="home-row">
                    <div class="home-card" id="recent-events-card">
                        <h3>📋 RECENT EVENTS</h3>
                        <div id="recent-events-list" class="events-list">Waiting for connection...</div>
                    </div>
                    <div class="home-card" id="quick-actions-card">
                        <h3>⚡ QUICK ACTIONS</h3>
                        <div class="quick-actions-grid" id="quick-actions"></div>
                    </div>
                </div>
                <div class="home-card" id="player-activity-card">
                    <h3>📈 PLAYER ACTIVITY (LAST 24H)</h3>
                    <canvas id="activity-chart" width="800" height="200"></canvas>
                </div>
            </div>
        `;

        this.renderGauges();
        this.renderQuickActions();
    }

    renderGauges() {
        const grid = document.getElementById('home-grid');
        if (!grid) return;
        grid.innerHTML = `
            <div class="gauge-card" id="gauge-cpu">
                <div class="gauge-title">CPU</div>
                <div class="gauge-value" id="cpu-value">0%</div>
                <div class="gauge-progress"><div class="gauge-fill" id="cpu-fill" style="width:0%"></div></div>
            </div>
            <div class="gauge-card" id="gauge-ram">
                <div class="gauge-title">RAM</div>
                <div class="gauge-value" id="ram-value">0%</div>
                <div class="gauge-progress"><div class="gauge-fill" id="ram-fill" style="width:0%"></div></div>
            </div>
            <div class="gauge-card" id="gauge-players">
                <div class="gauge-title">PLAYERS</div>
                <div class="gauge-value" id="players-value">0/100</div>
                <div class="gauge-progress"><div class="gauge-fill" id="players-fill" style="width:0%"></div></div>
            </div>
            <div class="gauge-card" id="gauge-tps">
                <div class="gauge-title">FPS</div>
                <div class="gauge-value" id="fps-value">0</div>
                <div class="gauge-progress"><div class="gauge-fill" id="fps-fill" style="width:0%"></div></div>
            </div>
        `;
    }

    renderQuickActions() {
        const actionsDiv = document.getElementById('quick-actions');
        if (!actionsDiv) return;
        let actions = [
            { label: 'Restart', command: 'global.restart', icon: '🔄', role: 'owner' },
            { label: 'Save', command: 'server.save', icon: '💾', role: 'master' },
            { label: 'Backup', command: 'gportal.backup.create', icon: '📦', role: 'owner' },
            { label: 'Broadcast', command: 'say', icon: '📢', role: 'master', needsInput: true },
            { label: 'Airdrop', command: 'airdrop.drop', icon: '📡', role: 'master' },
            { label: 'Heli', command: 'heli.call', icon: '🚁', role: 'master' }
        ];
        let html = '';
        actions.forEach(action => {
            if (this.access?.hasRole(action.role)) {
                html += `<button class="quick-action" data-cmd="${action.command}" ${action.needsInput ? 'data-needs-input' : ''}>${action.icon} ${action.label}</button>`;
            }
        });
        actionsDiv.innerHTML = html;
        actionsDiv.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', () => this.executeQuickAction(btn));
        });
    }

    async executeQuickAction(btn) {
        const cmd = btn.dataset.cmd;
        let fullCmd = cmd;
        if (btn.hasAttribute('data-needs-input')) {
            const msg = prompt('Enter message:');
            if (!msg) return;
            fullCmd = `${cmd} "${msg}"`;
        }
        try {
            await ConnectionManager.executeCommand(fullCmd);
            toast.success('Command executed');
        } catch (err) {
            toast.error(err.message);
        }
    }

    startUpdates() {
        this.updateInterval = setInterval(() => this.updateStats(), 5000);
    }

    async updateStats() {
        // Get player count from AppState.players (populated by GPortal polling)
        this.stats.players = (AppState.players || []).length;

        // If GPortal is ready, also fetch other stats
        if (window.gportalConnector && window.gportalConnector.apiReady) {
            try {
                const fps = await ConnectionManager.executeCommand('server.fps');
                const cpu = await ConnectionManager.executeCommand('server.cpu');
                const mem = await ConnectionManager.executeCommand('server.memory');
                const maxPlayers = AppState.connection.server?.maxPlayers || 100;
                const uptime = await ConnectionManager.executeCommand('server.uptime');
                const entities = await ConnectionManager.executeCommand('entity.count');
                
                this.stats.fps = parseInt(fps) || 0;
                this.stats.cpu = parseInt(cpu) || 0;
                this.stats.memory = parseInt(mem) || 0;
                this.stats.maxPlayers = maxPlayers;
                this.stats.uptime = uptime || '0d 0h 0m';
                this.stats.entities = parseInt(entities) || 0;
            } catch (err) {
                console.warn('Failed to update stats via GPortal:', err);
            }
        } else if (AppState.connection.status === 'connected') {
            // Fallback to old RCON stats
            try {
                const fps = await ConnectionManager.executeCommand('server.fps');
                const cpu = await ConnectionManager.executeCommand('server.cpu');
                const mem = await ConnectionManager.executeCommand('server.memory');
                const maxPlayers = AppState.connection.server?.maxPlayers || 100;
                const uptime = await ConnectionManager.executeCommand('server.uptime');
                const entities = await ConnectionManager.executeCommand('entity.count');
                
                this.stats.fps = parseInt(fps) || 0;
                this.stats.cpu = parseInt(cpu) || 0;
                this.stats.memory = parseInt(mem) || 0;
                this.stats.maxPlayers = maxPlayers;
                this.stats.uptime = uptime || '0d 0h 0m';
                this.stats.entities = parseInt(entities) || 0;
            } catch (err) {
                console.warn('Failed to update stats via RCON:', err);
            }
        } else {
            this.showDisconnected();
            return;
        }

        this.updateGauges();
        this.updateEvents();
        this.updateChart();
    }

    showDisconnected() {
        const ids = ['cpu-value', 'ram-value', 'players-value', 'fps-value'];
        ids.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.innerText = '--';
        });
        const eventsEl = document.getElementById('recent-events-list');
        if (eventsEl) eventsEl.innerHTML = 'Waiting for connection...';
    }

    updateGauges() {
        const setText = (id, text) => {
            const el = document.getElementById(id);
            if (el) el.innerText = text;
        };
        const setWidth = (id, width) => {
            const el = document.getElementById(id);
            if (el) el.style.width = width + '%';
        };
        setText('cpu-value', this.stats.cpu + '%');
        setWidth('cpu-fill', this.stats.cpu);
        setText('ram-value', this.stats.memory + '%');
        setWidth('ram-fill', this.stats.memory);
        setText('players-value', this.stats.players + '/' + this.stats.maxPlayers);
        setWidth('players-fill', (this.stats.players / this.stats.maxPlayers * 100));
        setText('fps-value', this.stats.fps);
        setWidth('fps-fill', (this.stats.fps / 60 * 100));
    }

    async updateEvents() {
        const list = document.getElementById('recent-events-list');
        if (!list) return;
        list.innerHTML = '<div class="event-item">Airdrop dropped (2m ago)</div><div class="event-item">PlayerX killed PlayerY (5m ago)</div>';
    }

    updateChart() {
        const canvas = document.getElementById('activity-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.fillStyle = '#FFB100';
        ctx.font = '12px monospace';
        ctx.fillText('Chart would show player count over time', 10, 100);
    }

    refresh() {
        this.updateStats();
        toast.success('Home refreshed');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.home = new Home();
});