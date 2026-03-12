// playerHub.js – DRAINED TABLET ULTIMATE v7.0.0
// Player hub: overview of online, recent, and offline players with statistics.

class PlayerHub {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.players = this.loadPlayers();
        this.joinHistory = this.loadJoinHistory();
        this.init();
    }

    loadPlayers() {
        const saved = localStorage.getItem('tdl_player_hub');
        return saved ? JSON.parse(saved) : { online: [], recent: [], offline: [] };
    }

    loadJoinHistory() {
        const saved = localStorage.getItem('tdl_join_history');
        return saved ? JSON.parse(saved) : [];
    }

    savePlayers() {
        localStorage.setItem('tdl_player_hub', JSON.stringify(this.players));
    }

    saveJoinHistory() {
        localStorage.setItem('tdl_join_history', JSON.stringify(this.joinHistory.slice(0, 100)));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.updateFromAppState();
        window.addEventListener('players-updated', () => this.updateFromAppState());
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'playerHub') {
                this.refresh();
            }
        });
    }

    updateFromAppState() {
        // Use real players from AppState
        const onlinePlayers = AppState.players.map(p => ({
            name: p.name,
            joinTime: p.joinTime || 'Just now',
            playtime: p.playtime || 'N/A',
            kills: p.kills || 0,
            deaths: p.deaths || 0
        }));
        this.players.online = onlinePlayers;
        this.renderOnline();
        this.renderStats();
    }

    createHTML() {
        const tab = document.getElementById('tab-playerHub');
        if (!tab) return;
        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }
        tab.innerHTML = `
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
                            <div class="stat-value" id="total-players">0</div>
                            <div class="stat-label">Total Players</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="online-count">0</div>
                            <div class="stat-label">Online Now</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="joined-today">0</div>
                            <div class="stat-label">Joined Today</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="avg-playtime">0h</div>
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
        this.renderStats();
    }

    attachEvents() {
        document.getElementById('hub-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('hub-search')?.addEventListener('input', (e) => this.search(e.target.value));
        // Delegate for player actions
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
        if (!list) return;
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
        const onlineCount = document.getElementById('online-count');
        if (onlineCount) onlineCount.innerText = this.players.online.length;
    }

    renderRecent() {
        const list = document.getElementById('recent-players');
        if (!list) return;
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
        if (!list) return;
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
        if (!list) return;
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

    renderStats() {
        const total = this.players.online.length + this.players.offline.length;
        const totalEl = document.getElementById('total-players');
        if (totalEl) totalEl.innerText = total;
        const joinedTodayEl = document.getElementById('joined-today');
        if (joinedTodayEl) joinedTodayEl.innerText = this.players.recent.length;
        const avgEl = document.getElementById('avg-playtime');
        if (avgEl) avgEl.innerText = '12h'; // placeholder
    }

    search(query) {
        if (!query) {
            this.renderOnline();
            this.renderRecent();
            this.renderOffline();
            return;
        }
        const q = query.toLowerCase();
        const filterList = (list, containerId) => {
            const filtered = list.filter(p => p.name.toLowerCase().includes(q));
            const container = document.getElementById(containerId);
            if (!container) return;
            if (filtered.length === 0) {
                container.innerHTML = '<div class="no-results">No players found</div>';
                return;
            }
            let html = '';
            filtered.forEach(p => {
                html += `<div class="player-row"><span class="player-name">${p.name}</span></div>`;
            });
            container.innerHTML = html;
        };
        filterList(this.players.online, 'online-players');
        filterList(this.players.recent, 'recent-players');
        filterList(this.players.offline, 'offline-players');
    }

    viewPlayer(player) {
        toast.info(`Viewing ${player} profile`);
    }
    messagePlayer(player) {
        toast.info(`Messaging ${player}...`);
    }
    playerStats(player) {
        toast.info(`Loading stats for ${player}...`);
    }

    recordJoin(player) {
        this.joinHistory.unshift({ player, action: 'joined', time: new Date().toISOString(), type: 'join' });
        this.saveJoinHistory();
        this.renderJoinHistory();
    }

    recordLeave(player) {
        this.joinHistory.unshift({ player, action: 'left', time: new Date().toISOString(), type: 'leave' });
        this.saveJoinHistory();
        this.renderJoinHistory();
    }

    refresh() {
        this.updateFromAppState();
        this.renderOnline();
        this.renderRecent();
        this.renderOffline();
        this.renderJoinHistory();
        this.renderStats();
        toast.success('Player hub refreshed');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.playerHub = new PlayerHub();
});