// PLAYER HUB - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class PlayerHub {
    constructor(tablet) {
        this.tablet = tablet;
        this.players = this.loadPlayers();
        this.joinHistory = this.loadJoinHistory();
        this.init();
    }

    loadPlayers() {
        const saved = localStorage.getItem('drained_player_hub');
        return saved ? JSON.parse(saved) : {
            online: [
                { name: 'RustGod', joinTime: '2h ago', playtime: '342h', kills: 127, deaths: 43 },
                { name: 'BuilderBob', joinTime: '1h ago', playtime: '127h', kills: 34, deaths: 67 },
                { name: 'PvPKing', joinTime: '45m ago', playtime: '89h', kills: 89, deaths: 45 }
            ],
            recent: [
                { name: 'RaiderSue', joinTime: '3h ago', leftTime: '2h ago', playtime: '56h' },
                { name: 'FarmerJoe', joinTime: '5h ago', leftTime: '4h ago', playtime: '234h' },
                { name: 'SoloPlayer', joinTime: '12h ago', leftTime: '11h ago', playtime: '45h' }
            ],
            offline: [
                { name: 'TraderJoe', lastSeen: '2d ago', playtime: '45h' },
                { name: 'BaseBuilder', lastSeen: '3d ago', playtime: '120h' },
                { name: 'Grinder99', lastSeen: '5d ago', playtime: '200h' }
            ]
        };
    }

    loadJoinHistory() {
        const saved = localStorage.getItem('drained_join_history');
        return saved ? JSON.parse(saved) : [];
    }

    savePlayers() {
        localStorage.setItem('drained_player_hub', JSON.stringify(this.players));
    }

    saveJoinHistory() {
        localStorage.setItem('drained_join_history', JSON.stringify(this.joinHistory.slice(0, 100)));
    }

    init() {
        this.createHubHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'playerHub') {
                this.refresh();
            }
        });
    }

    createHubHTML() {
        const hubTab = document.getElementById('tab-playerHub');
        if (!hubTab) return;

        hubTab.innerHTML = `
            <div class="hub-container">
                <div class="hub-header">
                    <h2>📊 PLAYER HUB</h2>
                    <div class="hub-controls">
                        <input type="text" id="hub-search" placeholder="Search players...">
                        <button id="hub-refresh" class="hub-btn">🔄 REFRESH</button>
                    </div>
                </div>

                <div class="hub-grid">
                    <div class="hub-section online">
                        <h3>🟢 ONLINE NOW (${this.players.online.length})</h3>
                        <div id="online-players" class="player-list"></div>
                    </div>

                    <div class="hub-section recent">
                        <h3>⏱️ RECENTLY JOINED (24h)</h3>
                        <div id="recent-players" class="player-list"></div>
                    </div>

                    <div class="hub-section offline">
                        <h3>⚫ OFFLINE PLAYERS</h3>
                        <div id="offline-players" class="player-list"></div>
                    </div>
                </div>

                <div class="hub-stats">
                    <h3>📈 PLAYER STATISTICS</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value">${this.players.online.length + this.players.offline.length}</div>
                            <div class="stat-label">Total Players</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${this.players.online.length}</div>
                            <div class="stat-label">Online Now</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${this.players.recent.length}</div>
                            <div class="stat-label">Joined Today</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${Math.floor(Math.random() * 50 + 20)}h</div>
                            <div class="stat-label">Avg Playtime</div>
                        </div>
                    </div>
                </div>

                <div class="join-history">
                    <h3>📜 JOIN HISTORY</h3>
                    <div id="join-history-list" class="history-list"></div>
                </div>
            </div>
        `;

        this.renderOnline();
        this.renderRecent();
        this.renderOffline();
        this.renderJoinHistory();
    }

    setupEventListeners() {
        document.getElementById('hub-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('hub-search')?.addEventListener('input', (e) => this.search(e.target.value));

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-player')) {
                const player = e.target.dataset.player;
                this.viewPlayer(player);
            }
            if (e.target.classList.contains('message-player')) {
                const player = e.target.dataset.player;
                this.messagePlayer(player);
            }
            if (e.target.classList.contains('stats-player')) {
                const player = e.target.dataset.player;
                this.playerStats(player);
            }
        });
    }

    renderOnline() {
        const list = document.getElementById('online-players');
        let html = '';
        this.players.online.forEach(player => {
            html += `
                <div class="player-row online">
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                        <span class="player-time">${player.joinTime}</span>
                    </div>
                    <div class="player-stats">
                        <span>🎯 ${player.kills}</span>
                        <span>💀 ${player.deaths}</span>
                    </div>
                    <div class="player-actions">
                        <button class="small-btn view-player" data-player="${player.name}">👁️</button>
                        <button class="small-btn message-player" data-player="${player.name}">💬</button>
                        <button class="small-btn stats-player" data-player="${player.name}">📊</button>
                    </div>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    renderRecent() {
        const list = document.getElementById('recent-players');
        let html = '';
        this.players.recent.forEach(player => {
            html += `
                <div class="player-row recent">
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                        <span class="player-time">Joined: ${player.joinTime}</span>
                    </div>
                    <div class="player-stats">
                        <span>Played: ${player.playtime}</span>
                    </div>
                    <div class="player-actions">
                        <button class="small-btn view-player" data-player="${player.name}">👁️</button>
                    </div>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    renderOffline() {
        const list = document.getElementById('offline-players');
        let html = '';
        this.players.offline.forEach(player => {
            html += `
                <div class="player-row offline">
                    <div class="player-info">
                        <span class="player-name">${player.name}</span>
                        <span class="player-time">Last: ${player.lastSeen}</span>
                    </div>
                    <div class="player-stats">
                        <span>Played: ${player.playtime}</span>
                    </div>
                    <div class="player-actions">
                        <button class="small-btn view-player" data-player="${player.name}">👁️</button>
                    </div>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    renderJoinHistory() {
        const list = document.getElementById('join-history-list');
        
        if (this.joinHistory.length === 0) {
            list.innerHTML = '<div class="no-history">No join history</div>';
            return;
        }

        let html = '';
        this.joinHistory.slice(0, 20).forEach(entry => {
            const time = new Date(entry.time).toLocaleTimeString();
            html += `
                <div class="history-entry ${entry.type}">
                    <span class="history-time">[${time}]</span>
                    <span class="history-player">${entry.player}</span>
                    <span class="history-action">${entry.action}</span>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    search(query) {
        if (!query) {
            this.renderOnline();
            this.renderRecent();
            this.renderOffline();
            return;
        }

        const searchLower = query.toLowerCase();
        
        const filteredOnline = this.players.online.filter(p => 
            p.name.toLowerCase().includes(searchLower)
        );
        
        const filteredRecent = this.players.recent.filter(p => 
            p.name.toLowerCase().includes(searchLower)
        );
        
        const filteredOffline = this.players.offline.filter(p => 
            p.name.toLowerCase().includes(searchLower)
        );

        document.getElementById('online-players').innerHTML = this.renderFiltered(filteredOnline);
        document.getElementById('recent-players').innerHTML = this.renderFiltered(filteredRecent);
        document.getElementById('offline-players').innerHTML = this.renderFiltered(filteredOffline);
    }

    renderFiltered(players) {
        if (players.length === 0) return '<div class="no-results">No players found</div>';
        
        let html = '';
        players.forEach(p => {
            html += `
                <div class="player-row">
                    <span class="player-name">${p.name}</span>
                </div>
            `;
        });
        return html;
    }

    viewPlayer(player) {
        this.tablet.showToast(`Viewing ${player} profile`, 'info');
    }

    messagePlayer(player) {
        this.tablet.showToast(`Messaging ${player}...`, 'info');
    }

    playerStats(player) {
        this.tablet.showToast(`Loading stats for ${player}...`, 'info');
    }

    recordJoin(player) {
        this.joinHistory.unshift({
            player: player,
            action: 'joined',
            time: new Date().toISOString(),
            type: 'join'
        });
        this.saveJoinHistory();
    }

    recordLeave(player) {
        this.joinHistory.unshift({
            player: player,
            action: 'left',
            time: new Date().toISOString(),
            type: 'leave'
        });
        this.saveJoinHistory();
    }

    refresh() {
        this.renderOnline();
        this.renderRecent();
        this.renderOffline();
        this.renderJoinHistory();
        this.tablet.showToast('Player hub refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.playerHub = new PlayerHub(window.drainedTablet);
});