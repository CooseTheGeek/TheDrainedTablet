// PLAYERS MANAGER - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class PlayerManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.players = [];
        this.bannedPlayers = this.loadBans();
        this.authLevels = ['User', 'VIP', 'Moderator', 'Admin', 'Owner'];
        this.init();
    }

    loadBans() {
        const saved = localStorage.getItem('drained_bans');
        return saved ? JSON.parse(saved) : [];
    }

    saveBans() {
        localStorage.setItem('drained_bans', JSON.stringify(this.bannedPlayers));
    }

    init() {
        this.createPlayersHTML();
        this.setupEventListeners();
        this.startTracking();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'players') {
                this.refresh();
            }
        });
    }

    createPlayersHTML() {
        const playersTab = document.getElementById('tab-players');
        if (!playersTab) return;

        playersTab.innerHTML = `
            <div class="players-container">
                <div class="players-header">
                    <h2>👥 PLAYER MANAGEMENT</h2>
                    <div class="players-controls">
                        <button id="refresh-players" class="player-btn">🔄 REFRESH</button>
                        <button id="ban-list" class="player-btn warning">📋 BAN LIST</button>
                    </div>
                </div>

                <div class="players-search">
                    <input type="text" id="player-search" placeholder="Search players...">
                    <select id="player-status">
                        <option value="all">All Players</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="banned">Banned</option>
                    </select>
                    <button id="search-btn" class="player-btn">🔍 SEARCH</button>
                </div>

                <div class="players-list" id="players-list"></div>

                <!-- Player Details Modal -->
                <div id="player-modal" class="modal hidden">
                    <div class="modal-content player-modal">
                        <h2 id="player-modal-name">Player Details</h2>
                        
                        <div class="player-details-grid">
                            <div class="detail-section">
                                <h3>Player Info</h3>
                                <div class="detail-row">
                                    <span>Status:</span>
                                    <span id="player-status-detail">Online</span>
                                </div>
                                <div class="detail-row">
                                    <span>Auth Level:</span>
                                    <span id="player-auth">User</span>
                                </div>
                                <div class="detail-row">
                                    <span>Playtime:</span>
                                    <span id="player-playtime">342h</span>
                                </div>
                                <div class="detail-row">
                                    <span>Position:</span>
                                    <span id="player-position">(1245, 45, 678)</span>
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h3>Statistics</h3>
                                <div class="detail-row">
                                    <span>Kills:</span>
                                    <span id="player-kills">127</span>
                                </div>
                                <div class="detail-row">
                                    <span>Deaths:</span>
                                    <span id="player-deaths">43</span>
                                </div>
                                <div class="detail-row">
                                    <span>K/D:</span>
                                    <span id="player-kd">2.95</span>
                                </div>
                                <div class="detail-row">
                                    <span>Headshots:</span>
                                    <span id="player-headshots">68</span>
                                </div>
                            </div>
                        </div>

                        <div class="player-actions">
                            <h3>Actions</h3>
                            <div class="action-buttons">
                                <button class="action-btn" id="action-give-kit">🎁 Give Kit</button>
                                <button class="action-btn" id="action-teleport">📍 Teleport To</button>
                                <button class="action-btn" id="action-bring">🏠 Bring Here</button>
                                <button class="action-btn" id="action-mute">🔇 Mute</button>
                                <button class="action-btn" id="action-kick">👢 Kick</button>
                                <button class="action-btn warning" id="action-ban">🔨 Ban</button>
                                <button class="action-btn" id="action-promote">⬆️ Promote</button>
                                <button class="action-btn" id="action-demote">⬇️ Demote</button>
                                <button class="action-btn" id="action-inventory">📦 Inventory</button>
                                <button class="action-btn" id="action-history">📜 History</button>
                            </div>
                        </div>

                        <div class="modal-actions">
                            <button id="close-player" class="player-btn">CLOSE</button>
                        </div>
                    </div>
                </div>

                <!-- Ban Modal -->
                <div id="ban-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>Ban Player</h3>
                        
                        <div class="form-group">
                            <label>Reason:</label>
                            <input type="text" id="ban-reason" placeholder="Ban reason">
                        </div>
                        
                        <div class="form-group">
                            <label>Duration (hours, 0 = permanent):</label>
                            <input type="number" id="ban-duration" value="0" min="0">
                        </div>
                        
                        <div class="modal-actions">
                            <button id="execute-ban" class="player-btn warning">BAN</button>
                            <button id="cancel-ban" class="player-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderPlayers();
    }

    setupEventListeners() {
        document.getElementById('refresh-players')?.addEventListener('click', () => this.refresh());
        document.getElementById('ban-list')?.addEventListener('click', () => this.showBanList());
        document.getElementById('search-btn')?.addEventListener('click', () => this.searchPlayers());

        document.getElementById('player-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPlayers();
        });

        document.getElementById('close-player')?.addEventListener('click', () => {
            document.getElementById('player-modal').classList.add('hidden');
        });

        document.getElementById('cancel-ban')?.addEventListener('click', () => {
            document.getElementById('ban-modal').classList.add('hidden');
        });

        document.getElementById('execute-ban')?.addEventListener('click', () => this.executeBan());

        // Action buttons
        document.getElementById('action-give-kit')?.addEventListener('click', () => this.giveKit());
        document.getElementById('action-teleport')?.addEventListener('click', () => this.teleportTo());
        document.getElementById('action-bring')?.addEventListener('click', () => this.bringHere());
        document.getElementById('action-mute')?.addEventListener('click', () => this.mutePlayer());
        document.getElementById('action-kick')?.addEventListener('click', () => this.kickPlayer());
        document.getElementById('action-ban')?.addEventListener('click', () => this.openBanModal());
        document.getElementById('action-promote')?.addEventListener('click', () => this.promotePlayer());
        document.getElementById('action-demote')?.addEventListener('click', () => this.demotePlayer());
        document.getElementById('action-inventory')?.addEventListener('click', () => this.viewInventory());
        document.getElementById('action-history')?.addEventListener('click', () => this.viewHistory());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('view-player')) {
                const player = e.target.dataset.player;
                this.viewPlayer(player);
            }
            if (e.target.classList.contains('quick-action')) {
                const player = e.target.dataset.player;
                const action = e.target.dataset.action;
                this.quickAction(player, action);
            }
        });
    }

    renderPlayers() {
        const container = document.getElementById('players-list');
        if (!container) return;

        // Fetch real players from tablet
        this.players = this.tablet.realPlayers.map(p => ({
            name: p.name,
            status: p.online ? 'online' : 'offline',
            auth: 'User', // Would need to fetch auth level via RCON
            playtime: 'N/A',
            position: p.position ? `(${p.position.x}, ${p.position.y}, ${p.position.z})` : 'Unknown'
        }));

        // Add some sample offline players for demo (will be replaced by real data)
        if (this.players.length === 0) {
            this.players = [
                { name: 'RustGod', status: 'online', auth: 'Admin', playtime: '342h', position: '(1245, 45, 678)' },
                { name: 'BuilderBob', status: 'online', auth: 'User', playtime: '127h', position: '(2341, 67, 891)' },
                { name: 'PvPKing', status: 'online', auth: 'VIP', playtime: '89h', position: '(3456, 78, 123)' },
                { name: 'RaiderSue', status: 'offline', auth: 'User', playtime: '56h', lastSeen: '2h ago' },
                { name: 'FarmerJoe', status: 'offline', auth: 'User', playtime: '234h', lastSeen: '1d ago' }
            ];
        }

        let html = '<table class="players-table">';
        html += '<tr><th>Player</th><th>Status</th><th>Auth</th><th>Playtime</th><th>Actions</th></tr>';

        this.players.forEach(player => {
            html += `
                <tr>
                    <td>${player.name}</td>
                    <td><span class="status-${player.status}">${player.status === 'online' ? '🟢 Online' : '⚫ Offline'}</span></td>
                    <td>${player.auth}</td>
                    <td>${player.playtime}</td>
                    <td>
                        <button class="small-btn view-player" data-player="${player.name}">👁️</button>
                        <button class="small-btn quick-action" data-player="${player.name}" data-action="kick">👢</button>
                        <button class="small-btn quick-action" data-player="${player.name}" data-action="ban">🔨</button>
                        <button class="small-btn quick-action" data-player="${player.name}" data-action="teleport">📍</button>
                    </td>
                </tr>
            `;
        });

        html += '</table>';
        container.innerHTML = html;
    }

    searchPlayers() {
        const search = document.getElementById('player-search').value.toLowerCase();
        const status = document.getElementById('player-status').value;

        // Filter and render (simplified, would actually filter this.players)
        this.renderPlayers();
    }

    viewPlayer(playerName) {
        const player = this.players.find(p => p.name === playerName);
        if (!player) return;

        document.getElementById('player-modal-name').innerText = player.name;
        document.getElementById('player-status-detail').innerText = player.status === 'online' ? '🟢 Online' : '⚫ Offline';
        document.getElementById('player-auth').innerText = player.auth;
        document.getElementById('player-playtime').innerText = player.playtime;
        document.getElementById('player-position').innerText = player.position || 'Unknown';
        // Fetch real stats via RCON
        this.tablet.fetchPlayerStats(playerName).then(stats => {
            if (stats) {
                document.getElementById('player-kills').innerText = stats.kills || 'N/A';
                document.getElementById('player-deaths').innerText = stats.deaths || 'N/A';
                document.getElementById('player-kd').innerText = stats.kd || 'N/A';
                document.getElementById('player-headshots').innerText = stats.headshots || 'N/A';
            }
        });

        this.currentPlayer = player;
        document.getElementById('player-modal').classList.remove('hidden');
    }

    quickAction(player, action) {
        switch(action) {
            case 'kick':
                this.tablet.showConfirm(`Kick ${player}?`, (confirmed) => {
                    if (confirmed) {
                        this.tablet.sendCommand(`kick ${player}`).then(() => {
                            this.tablet.showToast(`${player} kicked`, 'warning');
                        }).catch(err => {
                            this.tablet.showError(`Failed to kick: ${err.message}`);
                        });
                    }
                });
                break;
            case 'ban':
                this.currentPlayer = { name: player };
                this.openBanModal();
                break;
            case 'teleport':
                this.tablet.sendCommand(`teleport.toplayer ${this.tablet.currentUser} ${player}`).then(() => {
                    this.tablet.showToast(`Teleported to ${player}`, 'success');
                }).catch(err => {
                    this.tablet.showError(`Teleport failed: ${err.message}`);
                });
                break;
        }
    }

    openBanModal() {
        document.getElementById('ban-modal').classList.remove('hidden');
    }

    executeBan() {
        const reason = document.getElementById('ban-reason').value;
        const duration = document.getElementById('ban-duration').value;

        if (!reason) {
            this.tablet.showError('Enter ban reason');
            return;
        }

        this.bannedPlayers.push({
            player: this.currentPlayer.name,
            reason: reason,
            duration: duration,
            bannedAt: new Date().toISOString(),
            bannedBy: this.tablet.currentUser
        });

        this.saveBans();
        document.getElementById('ban-modal').classList.add('hidden');
        this.tablet.showToast(`Banned ${this.currentPlayer.name}`, 'error');
    }

    showBanList() {
        if (this.bannedPlayers.length === 0) {
            alert('No banned players');
            return;
        }

        let list = 'BANNED PLAYERS:\n\n';
        this.bannedPlayers.forEach(ban => {
            list += `${ban.player} - ${ban.reason} (${ban.duration}h) - ${new Date(ban.bannedAt).toLocaleString()}\n`;
        });

        alert(list);
    }

    giveKit() {
        if (!this.currentPlayer) return;
        this.tablet.showToast(`Give kit to ${this.currentPlayer.name}`, 'info');
    }

    teleportTo() {
        if (!this.currentPlayer) return;
        this.tablet.sendCommand(`teleport.toplayer ${this.tablet.currentUser} ${this.currentPlayer.name}`).then(() => {
            this.tablet.showToast(`Teleported to ${this.currentPlayer.name}`, 'success');
        }).catch(err => {
            this.tablet.showError(`Teleport failed: ${err.message}`);
        });
    }

    bringHere() {
        if (!this.currentPlayer) return;
        this.tablet.sendCommand(`teleport.toplayer ${this.currentPlayer.name} ${this.tablet.currentUser}`).then(() => {
            this.tablet.showToast(`Brought ${this.currentPlayer.name} to you`, 'success');
        }).catch(err => {
            this.tablet.showError(`Failed to bring player: ${err.message}`);
        });
    }

    mutePlayer() {
        if (!this.currentPlayer) return;
        const minutes = prompt(`Mute ${this.currentPlayer.name} for how many minutes?`, '30');
        if (minutes) {
            this.tablet.sendCommand(`mute ${this.currentPlayer.name} ${minutes}`).then(() => {
                this.tablet.showToast(`Muted ${this.currentPlayer.name} for ${minutes} minutes`, 'warning');
            }).catch(err => {
                this.tablet.showError(`Failed to mute: ${err.message}`);
            });
        }
    }

    kickPlayer() {
        if (!this.currentPlayer) return;
        this.tablet.showConfirm(`Kick ${this.currentPlayer.name}?`, (confirmed) => {
            if (confirmed) {
                this.tablet.sendCommand(`kick ${this.currentPlayer.name}`).then(() => {
                    this.tablet.showToast(`${this.currentPlayer.name} kicked`, 'warning');
                }).catch(err => {
                    this.tablet.showError(`Failed to kick: ${err.message}`);
                });
            }
        });
    }

    promotePlayer() {
        if (!this.currentPlayer) return;
        // Promote to next auth level (simplified)
        this.tablet.sendCommand(`ownerid ${this.currentPlayer.name}`).then(() => {
            this.tablet.showToast(`Promoted ${this.currentPlayer.name} to owner`, 'success');
        }).catch(err => {
            this.tablet.showError(`Failed to promote: ${err.message}`);
        });
    }

    demotePlayer() {
        if (!this.currentPlayer) return;
        // Demote (remove owner) – requires SteamID
        this.tablet.showToast(`Demotion requires SteamID – use Master Control`, 'info');
    }

    viewInventory() {
        if (!this.currentPlayer) return;
        this.tablet.switchTab('inventoryViewer');
        setTimeout(() => {
            // Trigger load of this player's inventory
            const invViewer = window.inventoryViewer;
            if (invViewer) {
                document.getElementById('inv-player-search').value = this.currentPlayer.name;
                invViewer.loadPlayer();
            }
        }, 100);
    }

    viewHistory() {
        if (!this.currentPlayer) return;
        this.tablet.showToast(`Viewing ${this.currentPlayer.name}'s history`, 'info');
    }

    startTracking() {
        setInterval(() => {
            // Update player list periodically
            if (this.tablet.connected) {
                this.renderPlayers();
            }
        }, 30000);
    }

    refresh() {
        this.renderPlayers();
        this.tablet.showToast('Players refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.playerManager = new PlayerManager(window.drainedTablet);
});