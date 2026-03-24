// players.js – DRAINED TABLET ULTIMATE v7.0.0
// Player list with search, online status, and actions.

class Players {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.players = [];
        this.filteredPlayers = [];
        this.searchQuery = '';
        this.selectedPlayer = null;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.loadPlayers();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'players') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-players');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="players-container">
                <div class="players-header">
                    <h2>👥 PLAYER LIST</h2>
                    <div class="players-controls">
                        <input type="text" id="players-search" placeholder="Search players...">
                        <button id="players-refresh" class="players-btn">🔄 REFRESH</button>
                    </div>
                </div>
                <div class="players-list">
                    <table class="players-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Playtime</th>
                                <th>Position</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="players-tbody"></tbody>
                    </table>
                </div>
            </div>

            <!-- Player detail panel (hidden initially) -->
            <div id="player-detail-panel" class="player-detail-panel hidden">
                <div class="panel-header">
                    <h3>Player Details</h3>
                    <button id="close-detail-panel" class="close-btn">&times;</button>
                </div>
                <div class="panel-content" id="player-detail-content"></div>
            </div>
        `;

        this.renderPlayers();
    }

    attachEvents() {
        document.getElementById('players-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('players-search')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterPlayers();
        });
        document.getElementById('close-detail-panel')?.addEventListener('click', () => {
            document.getElementById('player-detail-panel').classList.add('hidden');
        });

        // Delegate for player actions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-player')) {
                const player = e.target.dataset.player;
                this.viewPlayer(player);
            }
            if (e.target.classList.contains('kick-player')) {
                const player = e.target.dataset.player;
                this.kickPlayer(player);
            }
            if (e.target.classList.contains('ban-player')) {
                const player = e.target.dataset.player;
                this.banPlayer(player);
            }
        });
    }

    loadPlayers() {
        this.players = AppState.players || [];
        this.filterPlayers();
    }

    filterPlayers() {
        if (this.searchQuery) {
            this.filteredPlayers = this.players.filter(p => p.name.toLowerCase().includes(this.searchQuery));
        } else {
            this.filteredPlayers = [...this.players];
        }
        this.renderPlayers();
    }

    renderPlayers() {
        const tbody = document.getElementById('players-tbody');
        if (!tbody) return;

        if (this.filteredPlayers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="no-players">No players online</td></tr>';
            return;
        }

        let html = '';
        this.filteredPlayers.forEach(player => {
            const statusClass = player.online ? 'online' : 'offline';
            html += `
                <tr>
                    <td>${player.name}</td>
                    <td><span class="status-${statusClass}">${player.online ? '🟢 Online' : '⚫ Offline'}</span></td>
                    <td>${player.playtime || 'N/A'}</td>
                    <td>${player.position ? `(${player.position.x}, ${player.position.z})` : 'Unknown'}</td>
                    <td>
                        <button class="small-btn view-player" data-player="${player.name}">👁️</button>
                        <button class="small-btn kick-player" data-player="${player.name}">👢</button>
                        <button class="small-btn ban-player" data-player="${player.name}">🔨</button>
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    }

    viewPlayer(playerName) {
        const player = this.players.find(p => p.name === playerName);
        if (!player) return;

        const detailPanel = document.getElementById('player-detail-panel');
        const content = document.getElementById('player-detail-content');
        content.innerHTML = `
            <div class="detail-row"><strong>Name:</strong> ${player.name}</div>
            <div class="detail-row"><strong>Status:</strong> ${player.online ? 'Online' : 'Offline'}</div>
            <div class="detail-row"><strong>Playtime:</strong> ${player.playtime || 'N/A'}</div>
            <div class="detail-row"><strong>Position:</strong> ${player.position ? `(${player.position.x}, ${player.position.z})` : 'Unknown'}</div>
            <div class="detail-row"><strong>Kills:</strong> ${player.kills || 0}</div>
            <div class="detail-row"><strong>Deaths:</strong> ${player.deaths || 0}</div>
            <div class="action-buttons">
                <button class="small-btn kick-player" data-player="${player.name}">Kick</button>
                <button class="small-btn ban-player" data-player="${player.name}">Ban</button>
                <button class="small-btn warn-player" data-player="${player.name}">Warn</button>
            </div>
        `;
        detailPanel.classList.remove('hidden');
    }

    async kickPlayer(playerName) {
        if (!confirm(`Kick ${playerName}?`)) return;
        try {
            await ConnectionManager.executeCommand(`kick ${playerName}`);
            toast.success(`${playerName} kicked`);
        } catch (err) {
            toast.error(`Kick failed: ${err.message}`);
        }
    }

    async banPlayer(playerName) {
        const reason = prompt('Ban reason:');
        if (!reason) return;
        if (!confirm(`Ban ${playerName}?`)) return;
        try {
            await ConnectionManager.executeCommand(`ban ${playerName} "${reason}"`);
            toast.error(`${playerName} banned`);
        } catch (err) {
            toast.error(`Ban failed: ${err.message}`);
        }
    }

    refresh() {
        this.loadPlayers();
        toast.success('Player list refreshed');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.players = new Players();
});