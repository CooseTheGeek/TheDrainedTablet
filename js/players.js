// players.js – DRAINED TABLET ULTIMATE v7.0.0 (fixed toast usage)

class Players {
    constructor() {
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
        const unsubscribe = ConnectionManager.subscribe(() => this.renderList());
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
                        ${this.access.hasRole('owner') ? `<button class="small-btn kick-player" data-name="${p.name}">👢</button>` : ''}
                        ${this.access.hasRole('owner') ? `<button class="small-btn ban-player" data-name="${p.name}">🔨</button>` : ''}
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

        let details = `
            <div class="detail-row"><strong>Status:</strong> ${player.online ? 'Online' : 'Offline'}</div>
            <div class="detail-row"><strong>Position:</strong> ${player.position ? `(${player.position.x}, ${player.position.y}, ${player.position.z})` : 'Unknown'}</div>
            <div class="detail-row"><strong>Playtime:</strong> ${player.playtime || 'N/A'}</div>
        `;

        if (this.access.hasRole('owner')) {
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

        if (this.access.hasRole('owner')) {
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
            toast.warning(`Kicked ${name}`);
        } catch (err) {
            toast.error(err.message);
        }
    }

    async banPlayer(name) {
        const reason = prompt(`Reason for banning ${name}:`);
        if (!reason) return;
        try {
            await this.cmd.ban(name, reason);
            toast.error(`Banned ${name}`);
        } catch (err) {
            toast.error(err.message);
        }
    }

    async mutePlayer(name) {
        const minutes = prompt(`Mute ${name} for how many minutes?`, '30');
        if (!minutes) return;
        try {
            await this.cmd.mute(name, parseInt(minutes));
            toast.info(`Muted ${name} for ${minutes} minutes`);
        } catch (err) {
            toast.error(err.message);
        }
    }

    async teleportTo(name) {
        try {
            await this.cmd.teleport(name);
            toast.success(`Teleported to ${name}`);
        } catch (err) {
            toast.error(err.message);
        }
    }

    async bringPlayer(name) {
        try {
            await this.cmd.teleport2me(name);
            toast.success(`Brought ${name} to you`);
        } catch (err) {
            toast.error(err.message);
        }
    }

    viewInventory(name) {
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
        toast.success('Player list refreshed');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.players = new Players();
});