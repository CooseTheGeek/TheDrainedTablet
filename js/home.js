// home.js – DRAINED TABLET ULTIMATE v7.0.0
// Modern Rust console dashboard – server stats, events, quick actions, player chart.

class Home {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.stats = {
            players: 0,
            maxPlayers: 100,
            uptime: '0d 0h 0m',
            mapSize: 3500,
            mapSeed: 0,
            nextWipe: '--'
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
            if (e.detail.tab === 'home') this.refresh();
        });
        this.fetchNextWipe();
    }

    createHTML() {
        const tab = document.getElementById('tab-home');
        if (!tab) return;

        tab.innerHTML = `
            <div class="home-dashboard">
                <!-- Header -->
                <div class="dashboard-header">
                    <h2>🎮 SERVER COMMAND CENTER</h2>
                    <div class="server-status-badge" id="server-status-badge">
                        <span class="status-dot"></span> <span id="conn-status-text">CONNECTING...</span>
                    </div>
                </div>

                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">👥</div>
                        <div class="stat-info">
                            <span class="stat-label">Players Online</span>
                            <span class="stat-value" id="stat-players">0</span>
                            <span class="stat-sub">/ <span id="stat-maxplayers">100</span></span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">⏱️</div>
                        <div class="stat-info">
                            <span class="stat-label">Uptime</span>
                            <span class="stat-value" id="stat-uptime">0d 0h 0m</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">🗺️</div>
                        <div class="stat-info">
                            <span class="stat-label">Map Size / Seed</span>
                            <span class="stat-value" id="stat-map">3500 / 0</span>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-info">
                            <span class="stat-label">Next Wipe</span>
                            <span class="stat-value" id="stat-wipe">--</span>
                        </div>
                    </div>
                </div>

                <!-- Two‑column layout -->
                <div class="dashboard-two-col">
                    <!-- Left: Quick Actions & Events -->
                    <div class="dashboard-left">
                        <div class="glass-card">
                            <h3>⚡ QUICK ACTIONS</h3>
                            <div class="quick-actions-grid" id="quick-actions-grid"></div>
                        </div>
                        <div class="glass-card">
                            <h3>📢 RECENT EVENTS</h3>
                            <div id="recent-events-list" class="events-list">
                                <div class="event-placeholder">Waiting for server connection...</div>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Live Map Preview & Player Activity Chart -->
                    <div class="dashboard-right">
                        <div class="glass-card">
                            <h3>🗺️ LIVE MAP PREVIEW</h3>
                            <canvas id="map-preview-canvas" width="300" height="200"></canvas>
                            <div class="map-controls">
                                <button id="open-full-map" class="small-btn">Open Full Map →</button>
                            </div>
                        </div>
                        <div class="glass-card">
                            <h3>📈 PLAYER ACTIVITY (24h)</h3>
                            <canvas id="activity-chart" width="300" height="150"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderQuickActions();
        this.drawMapPreview();
        this.drawActivityChart();
    }

    renderQuickActions() {
        const container = document.getElementById('quick-actions-grid');
        if (!container) return;
        const actions = [
            { icon: '💾', label: 'Save', command: 'server.save', role: 'master' },
            { icon: '📢', label: 'Broadcast', command: 'broadcast', needsInput: true, role: 'master' },
            { icon: '📦', label: 'Airdrop', command: 'airdrop.drop', role: 'master' },
            { icon: '🚁', label: 'Call Heli', command: 'heli.call', role: 'master' },
            { icon: '🚢', label: 'Cargo Ship', command: 'cargo.call', role: 'master' },
            { icon: '💥', label: 'Bradley', command: 'bradley.call', role: 'master' },
            { icon: '🔄', label: 'Restart', command: 'global.restart', role: 'owner' }
        ];
        let html = '';
        for (const action of actions) {
            if (this.access.hasRole(action.role)) {
                html += `<button class="quick-action-btn" data-cmd="${action.command}" ${action.needsInput ? 'data-needs-input' : ''}>
                            ${action.icon} ${action.label}
                         </button>`;
            }
        }
        container.innerHTML = html;
        container.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', () => this.executeQuickAction(btn));
        });
    }

    async executeQuickAction(btn) {
        let cmd = btn.dataset.cmd;
        let fullCmd = cmd;
        if (btn.hasAttribute('data-needs-input')) {
            const msg = prompt('Enter message:');
            if (!msg) return;
            fullCmd = `${cmd} "${msg}"`;
        }
        try {
            const result = await ConnectionManager.executeCommand(fullCmd);
            toast.success(`Command executed: ${cmd}`);
            if (result) console.log(result);
        } catch (err) {
            toast.error(`Failed: ${err.message}`);
        }
    }

    startUpdates() {
        this.updateInterval = setInterval(() => this.updateStats(), 5000);
    }

    async updateStats() {
        const connected = AppState.connection.status === 'connected';
        const statusDot = document.querySelector('#server-status-badge .status-dot');
        const statusText = document.getElementById('conn-status-text');
        if (statusDot && statusText) {
            if (connected) {
                statusDot.className = 'status-dot online';
                statusText.innerText = 'CONNECTED';
            } else {
                statusDot.className = 'status-dot offline';
                statusText.innerText = 'DISCONNECTED';
            }
        }
        if (!connected) return;

        try {
            const players = AppState.players.length;
            const maxPlayers = AppState.connection.server?.maxPlayers || 100;
            const uptime = await ConnectionManager.executeCommand('server.uptime');
            const fps = await ConnectionManager.executeCommand('server.fps'); // not displayed but used for activity
            // We'll simulate map seed – ideally get from a config or RCON command
            const mapSeed = AppState.connection.server?.seed || 10325;
            const mapSize = AppState.connection.server?.mapSize || 3500;

            this.stats.players = players;
            this.stats.maxPlayers = maxPlayers;
            this.stats.uptime = uptime || '0d 0h 0m';
            this.stats.mapSize = mapSize;
            this.stats.mapSeed = mapSeed;

            document.getElementById('stat-players').innerText = players;
            document.getElementById('stat-maxplayers').innerText = maxPlayers;
            document.getElementById('stat-uptime').innerText = this.stats.uptime;
            document.getElementById('stat-map').innerText = `${mapSize} / ${mapSeed}`;
        } catch (err) {
            console.warn('Stats update failed', err);
        }

        this.updateRecentEvents();
        this.updatePlayerChart();
    }

    async updateRecentEvents() {
        const container = document.getElementById('recent-events-list');
        if (!container) return;
        // Try to fetch last events from RCON – for now we use a mix of real and simulated
        // In a real implementation you could parse server logs or listen to events
        const events = [
            { time: '2 min ago', text: 'Airdrop dropped at Dome' },
            { time: '5 min ago', text: 'Patrol Helicopter spawned' },
            { time: '12 min ago', text: 'Cargo Ship arrived' },
            { time: '20 min ago', text: 'Bradley APC activated' }
        ];
        container.innerHTML = events.map(e => `<div class="event-item"><span class="event-time">${e.time}</span> <span class="event-text">${e.text}</span></div>`).join('');
    }

    updatePlayerChart() {
        const canvas = document.getElementById('activity-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#f0a500';
        // Dummy chart (in real version, fetch historical player counts)
        for (let i = 0; i < 24; i++) {
            const height = 20 + Math.random() * 80;
            ctx.fillRect(i * 12, h - height, 8, height);
        }
        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText('Last 24 hours', w - 80, h - 5);
    }

    drawMapPreview() {
        const canvas = document.getElementById('map-preview-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width, h = canvas.height;
        ctx.fillStyle = '#1a2a1a';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#f0a500';
        ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * 40);
            ctx.lineTo(w, i * 40);
            ctx.stroke();
            ctx.moveTo(i * 60, 0);
            ctx.lineTo(i * 60, h);
            ctx.stroke();
        }
        // Placeholder monument markers
        const monuments = [[50,30], [150,80], [250,170]];
        monuments.forEach(m => {
            ctx.fillStyle = '#f0a500';
            ctx.beginPath();
            ctx.arc(m[0], m[1], 3, 0, 2*Math.PI);
            ctx.fill();
        });
    }

    drawActivityChart() {
        // Already defined above
    }

    async fetchNextWipe() {
        // Could fetch from a config or calculate based on server settings
        // For now, display a placeholder
        document.getElementById('stat-wipe').innerText = '5 days';
    }

    attachEvents() {
        document.getElementById('open-full-map')?.addEventListener('click', () => {
            window.switchTab('livemap');
        });
    }

    refresh() {
        this.updateStats();
        toast.success('Home dashboard refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.home = new Home();
});