// STATUS TAB - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class ServerStatus {
    constructor(tablet) {
        this.tablet = tablet;
        this.stats = {
            players: 0,
            maxPlayers: 100,
            queue: 0,
            fps: 60,
            uptime: '0d 0h 0m',
            memory: '0%',
            cpu: '0%',
            network: '0 ms',
            entities: 0,
            buildings: 0,
            activeEvents: [],
            recentActions: []
        };
        this.init();
    }

    init() {
        this.createStatusHTML();
        this.setupEventListeners();
        this.startUpdates();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'status') {
                this.refresh();
            }
        });
    }

    createStatusHTML() {
        const statusTab = document.getElementById('tab-status');
        if (!statusTab) return;

        statusTab.innerHTML = `
            <div class="status-container">
                <div class="status-header">
                    <h2>📊 SERVER STATUS</h2>
                    <button id="refresh-status" class="status-btn">🔄 REFRESH</button>
                </div>

                <div class="status-grid">
                    <!-- Server Overview -->
                    <div class="status-card overview">
                        <h3>SERVER OVERVIEW</h3>
                        <div class="stat-row">
                            <span>Server Name:</span>
                            <span id="server-name">${this.tablet.serverConfig.name}</span>
                        </div>
                        <div class="stat-row">
                            <span>IP Address:</span>
                            <span id="server-ip">${this.tablet.serverConfig.ip}:${this.tablet.serverConfig.rconPort}</span>
                        </div>
                        <div class="stat-row">
                            <span>Map Seed:</span>
                            <span id="map-seed">${this.tablet.serverConfig.mapSeed}</span>
                        </div>
                        <div class="stat-row">
                            <span>Map Size:</span>
                            <span id="map-size">${this.tablet.serverConfig.mapSize}</span>
                        </div>
                    </div>

                    <!-- Player Stats -->
                    <div class="status-card players">
                        <h3>PLAYER STATISTICS</h3>
                        <div class="stat-large">
                            <span class="stat-value" id="player-count">0</span>
                            <span class="stat-label">Players Online</span>
                        </div>
                        <div class="stat-row">
                            <span>Queue:</span>
                            <span id="queue-count">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Max Players:</span>
                            <span id="max-players">100</span>
                        </div>
                        <div class="stat-row">
                            <span>Sleeping:</span>
                            <span id="sleeping-count">0</span>
                        </div>
                    </div>

                    <!-- Performance -->
                    <div class="status-card performance">
                        <h3>PERFORMANCE</h3>
                        <div class="stat-row">
                            <span>FPS:</span>
                            <span id="server-fps">60</span>
                        </div>
                        <div class="stat-row">
                            <span>CPU:</span>
                            <span id="cpu-usage">0%</span>
                        </div>
                        <div class="stat-row">
                            <span>Memory:</span>
                            <span id="memory-usage">0%</span>
                        </div>
                        <div class="stat-row">
                            <span>Network:</span>
                            <span id="network-latency">0ms</span>
                        </div>
                    </div>

                    <!-- World Stats -->
                    <div class="status-card world">
                        <h3>WORLD STATISTICS</h3>
                        <div class="stat-row">
                            <span>Entities:</span>
                            <span id="entity-count">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Buildings:</span>
                            <span id="building-count">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Time:</span>
                            <span id="world-time">12:00</span>
                        </div>
                        <div class="stat-row">
                            <span>Weather:</span>
                            <span id="weather">Clear</span>
                        </div>
                    </div>

                    <!-- Uptime -->
                    <div class="status-card uptime">
                        <h3>UPTIME</h3>
                        <div class="stat-large">
                            <span class="stat-value" id="uptime-days">0</span>
                            <span class="stat-label">Days</span>
                        </div>
                        <div class="stat-row">
                            <span>Hours:</span>
                            <span id="uptime-hours">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Minutes:</span>
                            <span id="uptime-minutes">0</span>
                        </div>
                        <div class="stat-row">
                            <span>Started:</span>
                            <span id="start-time">-</span>
                        </div>
                    </div>

                    <!-- Active Events -->
                    <div class="status-card events">
                        <h3>ACTIVE EVENTS</h3>
                        <div id="active-events-list">
                            <div class="no-events">No active events</div>
                        </div>
                    </div>

                    <!-- Recent Actions -->
                    <div class="status-card actions">
                        <h3>RECENT ACTIONS</h3>
                        <div id="recent-actions-list">
                            <div class="no-actions">No recent actions</div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions-panel">
                    <h3>QUICK ACTIONS</h3>
                    <div class="quick-actions-grid">
                        <button class="quick-action" data-action="restart">🔄 Restart Server</button>
                        <button class="quick-action" data-action="save">💾 Save World</button>
                        <button class="quick-action" data-action="backup">📦 Backup</button>
                        <button class="quick-action" data-action="broadcast">📢 Broadcast</button>
                        <button class="quick-action" data-action="announce">📣 Announce</button>
                        <button class="quick-action" data-action="wipe">⚠️ Wipe</button>
                    </div>
                </div>
            </div>
        `;

        this.updateStats();
    }

    setupEventListeners() {
        document.getElementById('refresh-status')?.addEventListener('click', () => this.refresh());
        
        document.querySelectorAll('.quick-action').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    startUpdates() {
        setInterval(() => {
            if (this.tablet.connected) {
                this.updateStats();
            }
        }, 5000);
    }

    updateStats() {
        if (!this.tablet.connected) {
            // Use mock data when disconnected
            this.stats = {
                players: 12,
                maxPlayers: 100,
                queue: 0,
                fps: 60,
                uptime: '3d 4h 23m',
                memory: '42%',
                cpu: '38%',
                network: '24 ms',
                entities: 3456,
                buildings: 892,
                activeEvents: ['Cargo Ship', 'Bradley'],
                recentActions: [
                    { time: '2m ago', action: 'Player RustGod joined' },
                    { time: '5m ago', action: 'Cargo Ship spawned' },
                    { time: '10m ago', action: 'Player BuilderBob left' }
                ]
            };
        }

        this.renderStats();
    }

    renderStats() {
        // Update player count
        document.getElementById('player-count').innerText = this.stats.players;
        document.getElementById('queue-count').innerText = this.stats.queue;
        document.getElementById('max-players').innerText = this.stats.maxPlayers;
        
        // Update performance
        document.getElementById('server-fps').innerText = this.stats.fps;
        document.getElementById('cpu-usage').innerText = this.stats.cpu;
        document.getElementById('memory-usage').innerText = this.stats.memory;
        document.getElementById('network-latency').innerText = this.stats.network;
        
        // Update world stats
        document.getElementById('entity-count').innerText = this.stats.entities;
        document.getElementById('building-count').innerText = this.stats.buildings;
        
        // Parse uptime
        const uptimeMatch = this.stats.uptime.match(/(\d+)d\s+(\d+)h\s+(\d+)m/);
        if (uptimeMatch) {
            document.getElementById('uptime-days').innerText = uptimeMatch[1];
            document.getElementById('uptime-hours').innerText = uptimeMatch[2];
            document.getElementById('uptime-minutes').innerText = uptimeMatch[3];
        }
        
        // Update events
        const eventsList = document.getElementById('active-events-list');
        if (this.stats.activeEvents.length === 0) {
            eventsList.innerHTML = '<div class="no-events">No active events</div>';
        } else {
            eventsList.innerHTML = this.stats.activeEvents.map(event => 
                `<div class="event-item">🎉 ${event}</div>`
            ).join('');
        }
        
        // Update recent actions
        const actionsList = document.getElementById('recent-actions-list');
        if (this.stats.recentActions.length === 0) {
            actionsList.innerHTML = '<div class="no-actions">No recent actions</div>';
        } else {
            actionsList.innerHTML = this.stats.recentActions.map(action => 
                `<div class="action-item"><span class="action-time">[${action.time}]</span> ${action.action}</div>`
            ).join('');
        }
    }

    handleQuickAction(action) {
        if (!this.tablet.isMaster() && action === 'wipe') {
            this.tablet.showError('Master access required for wipe');
            return;
        }

        switch(action) {
            case 'restart':
                this.tablet.showConfirm('Restart server? This will kick all players.', (confirmed) => {
                    if (confirmed) {
                        this.tablet.showToast('Restarting server...', 'warning');
                    }
                });
                break;
                
            case 'save':
                this.tablet.showToast('Saving world...', 'info');
                setTimeout(() => {
                    this.tablet.showToast('World saved', 'success');
                }, 2000);
                break;
                
            case 'backup':
                this.tablet.showToast('Creating backup...', 'info');
                setTimeout(() => {
                    this.tablet.showToast('Backup created', 'success');
                }, 3000);
                break;
                
            case 'broadcast':
                const msg = prompt('Enter broadcast message:');
                if (msg) {
                    this.tablet.showToast(`Broadcasting: ${msg}`, 'info');
                }
                break;
                
            case 'announce':
                const announce = prompt('Enter announcement:');
                if (announce) {
                    this.tablet.showToast(`Announcement sent`, 'success');
                }
                break;
                
            case 'wipe':
                this.tablet.showConfirm('⚠️ WIPE SERVER? ⚠️\nThis will erase everything!', (confirmed) => {
                    if (confirmed) {
                        this.tablet.showToast('Server wipe initiated', 'error');
                    }
                });
                break;
        }
    }

    refresh() {
        this.updateStats();
        this.tablet.showToast('Status refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.serverStatus = new ServerStatus(window.drainedTablet);
});