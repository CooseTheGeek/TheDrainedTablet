// players.js – DRAINED TABLET ULTIMATE v7.0.0
// Player management: list, search, detail view, actions.
// NO MOCK DATA – uses real players from AppState.players.

class Players {
    constructor() {
        this.tablet = window.drainedTablet;
        this.cmd = window.serverCommands;
        this.access = window.accessControl;
        this.selectedPlayer = null;
        this.filter = 'all';
        this.searchTerm = '';
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        // Update player list when AppState changes
        const unsubscribe = ConnectionManager.subscribe(() => this.renderList());
        // Listen for tab changes
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'players') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-players');
        if (!tab) return;

        tab.innerHTML = `
            <div class="players-container">
                <div class="players-header">
                    <h2>👥 PLAYER MANAGEMENT</h2>
                    <button id="players-refresh" class="players-btn">🔄 REFRESH</button>
                </div>
                <div class="players-controls">
                    <input type="text" id="players-search" placeholder="Search by name...">
                    <select id="players-filter">
                        <option value="all">All Players</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                    </select>
                </div>
                <div class="players-list" id="players-list">
                    <div class="waiting">Waiting for connection...</div>
                </div>
            </div>
            <!-- Player Detail Slide‑out Panel -->
            <div id="player-detail-panel" class="player-detail-panel hidden">
                <div class="panel-header">
                    <h3 id="detail-name">Player Name</h3>
                    <button id="close-detail">✕</button>
                </div>
                <div class="panel-content" id="detail-content">
                    <!-- Populated dynamically -->
                </div>
            </div>
        `;
    }

    attachEvents() {
        document.getElementById('players-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('players-search')?.addEventListener('input', (e) => {
            this.searchTerm = e.target.value;
            this.renderList();
        });
        document.getElementById('players-filter')?.addEventListener('change', (e) => {
            this.filter = e.target.value;
            this.renderList();
        });
        document.getElementById('close-detail')?.addEventListener('click', () => {
            document.getElementById('player-detail-panel').classList.add('hidden');
        });
    }

    renderList() {
        const listDiv = document.getElementById('players-list');
        if (!listDiv) return;

        if (AppState.connection.status !== 'connected') {
            listDiv.innerHTML = '<div class="waiting">Waiting for connection...</div>';
            return;
        }

        const players = AppState.players || [];
        const filtered = players.filter(p => {
            if (this.filter === 'online' && !p.online) return false;
            if (this.filter === 'offline' && p.online) return false;
            if (this.searchTerm && !p.name.toLowerCase().includes(this.searchTerm.toLowerCase())) return false;
            return true;
        });

        if (filtered.length === 0) {
            listDiv.innerHTML = '<div class="no-players">No players found</div>';
            return;
        }

        let html = '<table class="players-table"><tr><th>Name</th><th>Status</th><th>Playtime</th><th>Actions</th></tr>';
        filtered.forEach(p => {
            html += `
                <tr>
                    <td>${p.name}</td>
                    <td><span class="status-${p.online ? 'online' : 'offline'}">${p.online ? '🟢 Online' : '⚫ Offline'}</span></td>
                    <td>${p.playtime || 'N/A'}</td>
                    <td>
                        <button class="small-btn view-player" data-name="${p.name}">👁️</button>
                        ${this.access.hasRole('master') ? `<button class="small-btn kick-player" data-name="${p.name}">👢</button>` : ''}
                        ${this.access.hasRole('master') ? `<button class="small-btn ban-player" data-name="${p.name}">🔨</button>` : ''}
                    </td>
                </tr>
            `;
        });
        html += '</table>';
        listDiv.innerHTML = html;

        listDiv.querySelectorAll('.view-player').forEach(btn => {
            btn.addEventListener('click', (e) => this.viewPlayer(e.target.dataset.name));
        });
        listDiv.querySelectorAll('.kick-player').forEach(btn => {
            btn.addEventListener('click', (e) => this.kickPlayer(e.target.dataset.name));
        });
        listDiv.querySelectorAll('.ban-player').forEach(btn => {
            btn.addEventListener('click', (e) => this.banPlayer(e.target.dataset.name));
        });
    }

    async viewPlayer(name) {
        const player = AppState.players.find(p => p.name === name);
        if (!player) return;
        this.selectedPlayer = player;

        const panel = document.getElementById('player-detail-panel');
        document.getElementById('detail-name').innerText = player.name;

        // Fetch additional info (playtime, kills, etc.) – could use RCON commands
        let details = `
            <div class="detail-row"><strong>Status:</strong> ${player.online ? 'Online' : 'Offline'}</div>
            <div class="detail-row"><strong>Position:</strong> ${player.position ? `(${player.position.x}, ${player.position.y}, ${player.position.z})` : 'Unknown'}</div>
            <div class="detail-row"><strong>Playtime:</strong> ${player.playtime || 'N/A'}</div>
        `;

        if (this.access.hasRole('master')) {
            details += `
                <div class="action-buttons">
                    <button id="detail-kick" class="small-btn">Kick</button>
                    <button id="detail-ban" class="small-btn">Ban</button>
                    <button id="detail-mute" class="small-btn">Mute</button>
                    <button id="detail-teleport" class="small-btn">Teleport To</button>
                    <button id="detail-bring" class="small-btn">Bring</button>
                    <button id="detail-inventory" class="small-btn">Inventory</button>
                </div>
            `;
        }

        document.getElementById('detail-content').innerHTML = details;

        if (this.access.hasRole('master')) {
            document.getElementById('detail-kick')?.addEventListener('click', () => this.kickPlayer(player.name));
            document.getElementById('detail-ban')?.addEventListener('click', () => this.banPlayer(player.name));
            document.getElementById('detail-mute')?.addEventListener('click', () => this.mutePlayer(player.name));
            document.getElementById('detail-teleport')?.addEventListener('click', () => this.teleportTo(player.name));
            document.getElementById('detail-bring')?.addEventListener('click', () => this.bringPlayer(player.name));
            document.getElementById('detail-inventory')?.addEventListener('click', () => this.viewInventory(player.name));
        }

        panel.classList.remove('hidden');
    }

    async kickPlayer(name) {
        const reason = prompt(`Reason for kicking ${name}:`);
        if (!reason) return;
        try {
            await this.cmd.kick(name, reason);
            this.tablet.showToast(`Kicked ${name}`, 'warning');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async banPlayer(name) {
        const reason = prompt(`Reason for banning ${name}:`);
        if (!reason) return;
        try {
            await this.cmd.ban(name, reason);
            this.tablet.showToast(`Banned ${name}`, 'error');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async mutePlayer(name) {
        const minutes = prompt(`Mute ${name} for how many minutes?`, '30');
        if (!minutes) return;
        try {
            await this.cmd.mute(name, parseInt(minutes));
            this.tablet.showToast(`Muted ${name} for ${minutes} minutes`, 'info');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async teleportTo(name) {
        try {
            await this.cmd.teleport(name);
            this.tablet.showToast(`Teleported to ${name}`, 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async bringPlayer(name) {
        try {
            await this.cmd.teleport2me(name);
            this.tablet.showToast(`Brought ${name} to you`, 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    viewInventory(name) {
        // Switch to inventory viewer tab and load player
        window.home?.switchToTab('inventoryViewer');
        setTimeout(() => {
            const invViewer = window.inventoryViewer;
            if (invViewer) {
                invViewer.loadPlayer(name);
            }
        }, 100);
    }

    refresh() {
        this.renderList();
        this.tablet.showToast('Player list refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.players = new Players();
});