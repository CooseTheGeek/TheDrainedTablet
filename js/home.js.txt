// HOME TAB - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class HomeTab {
    constructor(tablet) {
        this.tablet = tablet;
        this.selectedPlayer = null;
        this.playerStats = {
            health: 76,
            hydration: 58,
            food: 87,
            radiation: 56,
            maxRadiation: 9999
        };
        this.armorSlots = {
            head: null,
            chest: null,
            hands: null,
            legs: null,
            feet: null,
            belt: null
        };
        this.equippedItems = [];
        this.stagedKit = [];
        this.init();
    }

    init() {
        this.createHomeHTML();
        this.setupEventListeners();
        this.startLiveUpdates();
    }

    createHomeHTML() {
        const homeTab = document.getElementById('tab-home');
        if (!homeTab) return;

        homeTab.innerHTML = `
            <div class="home-grid">
                <!-- Left Column - Player Info -->
                <div class="home-left">
                    <div class="player-search">
                        <h3>PLAYER SEARCH</h3>
                        <div class="search-container">
                            <input type="text" id="player-search-input" placeholder="Enter player name...">
                            <button id="player-search-btn">🔍</button>
                        </div>
                        <div id="player-search-results" class="search-results hidden"></div>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-circle" id="health-stat">${this.playerStats.health}</div>
                            <span>HEALTH</span>
                        </div>
                        <div class="stat-card">
                            <div class="stat-circle" id="hydration-stat">${this.playerStats.hydration}</div>
                            <span>HYDRATION</span>
                        </div>
                        <div class="stat-card">
                            <div class="stat-circle" id="food-stat">${this.playerStats.food}</div>
                            <span>FOOD</span>
                        </div>
                        <div class="stat-card">
                            <div class="stat-circle" id="radiation-stat">${this.playerStats.radiation}/${this.playerStats.maxRadiation}</div>
                            <span>RADIATION</span>
                        </div>
                    </div>
                    
                    <div class="selected-player-info" id="selected-player-info" style="display: none;">
                        <h4 id="selected-player-name"></h4>
                        <div class="player-quick-actions">
                            <button class="quick-action-btn" data-action="givekit">GIVE KIT</button>
                            <button class="quick-action-btn" data-action="teleport">TELEPORT TO</button>
                            <button class="quick-action-btn" data-action="bring">BRING HERE</button>
                            <button class="quick-action-btn" data-action="inventory">VIEW INV</button>
                            <button class="quick-action-btn" data-action="kick">KICK</button>
                            <button class="quick-action-btn" data-action="ban">BAN</button>
                        </div>
                    </div>
                </div>
                
                <!-- Center Column - Armor & Model -->
                <div class="home-center">
                    <div class="model-viewer">
                        <div class="model-container" id="player-model-container">
                            <div class="default-model">
                                <svg width="200" height="300" viewBox="0 0 200 300">
                                    <circle cx="100" cy="50" r="25" fill="#2a2a2a" stroke="#FFB100" stroke-width="2"/>
                                    <rect x="80" y="75" width="40" height="80" fill="#2a2a2a" stroke="#FFB100" stroke-width="2"/>
                                    <rect x="40" y="85" width="40" height="20" fill="#2a2a2a" stroke="#FFB100" stroke-width="2"/>
                                    <rect x="120" y="85" width="40" height="20" fill="#2a2a2a" stroke="#FFB100" stroke-width="2"/>
                                    <rect x="80" y="155" width="20" height="60" fill="#2a2a2a" stroke="#FFB100" stroke-width="2"/>
                                    <rect x="100" y="155" width="20" height="60" fill="#2a2a2a" stroke="#FFB100" stroke-width="2"/>
                                </svg>
                            </div>
                            <div class="model-loading hidden">LOADING PLAYER MODEL...</div>
                        </div>
                        <div class="equipped-items" id="equipped-items">
                            <span class="equipped-label">EQUIPPED:</span>
                            <span id="equipped-list">No player selected</span>
                        </div>
                    </div>
                    
                    <div class="armor-slots">
                        <div class="armor-slot" data-slot="head">
                            <span class="slot-label">HEAD</span>
                            <span class="slot-item" id="slot-head">-</span>
                        </div>
                        <div class="armor-slot" data-slot="chest">
                            <span class="slot-label">CHEST</span>
                            <span class="slot-item" id="slot-chest">-</span>
                        </div>
                        <div class="armor-slot" data-slot="hands">
                            <span class="slot-label">HANDS</span>
                            <span class="slot-item" id="slot-hands">-</span>
                        </div>
                        <div class="armor-slot" data-slot="legs">
                            <span class="slot-label">LEGS</span>
                            <span class="slot-item" id="slot-legs">-</span>
                        </div>
                        <div class="armor-slot" data-slot="feet">
                            <span class="slot-label">FEET</span>
                            <span class="slot-item" id="slot-feet">-</span>
                        </div>
                        <div class="armor-slot" data-slot="belt">
                            <span class="slot-label">BELT</span>
                            <span class="slot-item" id="slot-belt">-</span>
                        </div>
                    </div>
                </div>
                
                <!-- Right Column - Quick Actions -->
                <div class="home-right">
                    <div class="quick-actions">
                        <h3>QUICK COMMANDS</h3>
                        <button class="quick-cmd-btn" data-cmd="map.show">📍 LIVE MAP</button>
                        <button class="quick-cmd-btn" data-cmd="admin.console">👑 OWNER COMMANDS</button>
                        <button class="quick-cmd-btn" data-cmd="server.settings">⚙️ SERVER SETTINGS</button>
                        <button class="quick-cmd-btn" data-cmd="kit.open">🔧 KIT MAKER</button>
                        <button class="quick-cmd-btn" data-cmd="chat.global">💬 CHAT CENTER</button>
                        <button class="quick-cmd-btn" data-cmd="inv.view">📦 VIEW INVENTORY</button>
                    </div>
                    
                    <div class="kit-staging">
                        <h3>KIT STAGING</h3>
                        <div id="staged-items-container" class="staged-items"></div>
                        <div class="kit-controls">
                            <span id="staged-count">0 ITEMS</span>
                            <button id="clear-staged">CLEAR</button>
                            <button id="sync-staged">SYNC KIT</button>
                        </div>
                    </div>
                    
                    <div class="server-logo">
                        <div class="logo-icon">⎔</div>
                        <p>discord.gg/drained</p>
                    </div>
                </div>
            </div>
            
            <!-- Bottom Map Preview -->
            <div class="map-preview">
                <div class="map-preview-header">
                    <h3>LIVE MAP PREVIEW</h3>
                    <span id="map-players-count">0 players online</span>
                </div>
                <canvas id="home-map-canvas" width="800" height="200"></canvas>
                <div class="map-coordinates" id="home-map-coords">X: 0 Y: 0 Z: 0</div>
            </div>
        `;
    }

    setupEventListeners() {
        // Player search
        document.getElementById('player-search-btn')?.addEventListener('click', () => this.searchPlayer());
        document.getElementById('player-search-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPlayer();
        });

        // Quick action buttons
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (this.selectedPlayer) {
                    this.handlePlayerAction(action, this.selectedPlayer);
                }
            });
        });

        // Quick command buttons
        document.querySelectorAll('.quick-cmd-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const cmd = e.target.dataset.cmd;
                this.tablet.switchTab(cmd.split('.')[0]);
            });
        });

        // Kit staging
        document.getElementById('clear-staged')?.addEventListener('click', () => this.clearStagedKit());
        document.getElementById('sync-staged')?.addEventListener('click', () => this.syncStagedKit());

        // Map canvas interactions
        const mapCanvas = document.getElementById('home-map-canvas');
        if (mapCanvas) {
            mapCanvas.addEventListener('mousemove', (e) => this.handleMapHover(e));
            mapCanvas.addEventListener('click', (e) => this.handleMapClick(e));
        }

        // Listen for player updates
        window.addEventListener('player-update', (e) => {
            if (this.selectedPlayer) {
                const player = e.detail.find(p => p.name === this.selectedPlayer);
                if (player) {
                    this.updatePlayerStats(player);
                }
            }
            this.updateMapPlayers(e.detail);
        });

        // Listen for tab changes
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'home') {
                this.refresh();
            }
        });
    }

    searchPlayer() {
        const searchTerm = document.getElementById('player-search-input').value.trim();
        if (!searchTerm) return;

        // In real version, this would query RCON
        // Mock results for demo
        const mockResults = [
            { name: 'RustGod', online: true, health: 76, x: 1245, y: 45, z: 678 },
            { name: 'BuilderBob', online: true, health: 92, x: 2341, y: 67, z: 891 },
            { name: 'PvPKing', online: true, health: 34, x: 3456, y: 78, z: 123 },
            { name: 'RaiderSue', online: false, lastSeen: '2 hours ago' }
        ].filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

        this.displaySearchResults(mockResults);
    }

    displaySearchResults(results) {
        const resultsDiv = document.getElementById('player-search-results');
        resultsDiv.classList.remove('hidden');
        
        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">No players found</div>';
            return;
        }

        let html = '';
        results.forEach(player => {
            html += `
                <div class="search-result-item" data-player="${player.name}">
                    <span class="player-name">${player.name}</span>
                    <span class="player-status ${player.online ? 'online' : 'offline'}">
                        ${player.online ? '🟢 ONLINE' : '⚫ OFFLINE'}
                    </span>
                    ${player.online ? `<span class="player-health">${player.health}HP</span>` : ''}
                    <button class="select-player-btn" onclick="homeTab.selectPlayer('${player.name}')">SELECT</button>
                </div>
            `;
        });

        resultsDiv.innerHTML = html;
    }

    selectPlayer(playerName) {
        this.selectedPlayer = playerName;
        document.getElementById('selected-player-info').style.display = 'block';
        document.getElementById('selected-player-name').innerText = playerName;
        document.getElementById('player-search-results').classList.add('hidden');
        document.getElementById('player-search-input').value = '';

        // Mock player data
        this.updatePlayerStats({
            name: playerName,
            health: 76,
            hydration: 58,
            food: 87,
            radiation: 56,
            armor: {
                head: 'Metal Facemask',
                chest: 'Metal Chest Plate',
                hands: 'Tactical Gloves',
                legs: 'Roadsign Kilt',
                feet: 'Boots',
                belt: 'AK-47'
            },
            equipped: ['AK-47', 'Bolt Rifle', 'Med Syringe', 'C4']
        });

        this.tablet.showToast('Selected player: ' + playerName, 'success');
    }

    updatePlayerStats(player) {
        // Update gauges
        document.getElementById('health-stat').innerText = player.health || '--';
        document.getElementById('hydration-stat').innerText = player.hydration || '--';
        document.getElementById('food-stat').innerText = player.food || '--';
        document.getElementById('radiation-stat').innerText = (player.radiation || '--') + '/9999';

        // Update armor slots
        if (player.armor) {
            document.getElementById('slot-head').innerText = player.armor.head || '-';
            document.getElementById('slot-chest').innerText = player.armor.chest || '-';
            document.getElementById('slot-hands').innerText = player.armor.hands || '-';
            document.getElementById('slot-legs').innerText = player.armor.legs || '-';
            document.getElementById('slot-feet').innerText = player.armor.feet || '-';
            document.getElementById('slot-belt').innerText = player.armor.belt || '-';
        }

        // Update equipped items
        if (player.equipped) {
            document.getElementById('equipped-list').innerHTML = player.equipped.map(item => 
                `<span class="equipped-item">${item}</span>`
            ).join(' • ');
        }
    }

    handlePlayerAction(action, player) {
        if (!this.tablet.connected) {
            this.tablet.showError('Not connected to server');
            return;
        }

        switch(action) {
            case 'givekit':
                this.tablet.showToast('Opening kit selector for ' + player, 'info');
                // Would open kit selector modal
                break;
            case 'teleport':
                this.tablet.showToast('Teleporting to ' + player, 'success');
                break;
            case 'bring':
                this.tablet.showToast('Bringing ' + player + ' to you', 'success');
                break;
            case 'inventory':
                this.tablet.switchTab('inventoryViewer');
                this.tablet.showToast('Loading inventory for ' + player, 'info');
                break;
            case 'kick':
                this.tablet.showConfirm('Kick ' + player + '?', (confirmed) => {
                    if (confirmed) {
                        this.tablet.showToast(player + ' kicked', 'warning');
                    }
                });
                break;
            case 'ban':
                this.tablet.showConfirm('Ban ' + player + '?', (confirmed) => {
                    if (confirmed) {
                        this.tablet.showToast(player + ' banned', 'error');
                    }
                });
                break;
        }
    }

    updateMapPlayers(players) {
        const canvas = document.getElementById('home-map-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();

            const y = (i / 10) * canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw players
        players.forEach(player => {
            const x = (player.x / 3500) * canvas.width;
            const y = (player.z / 3500) * canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = player.name === this.selectedPlayer ? '#FFB100' : 'rgba(255, 177, 0, 0.5)';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.stroke();

            if (player.name === this.selectedPlayer) {
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, 2 * Math.PI);
                ctx.strokeStyle = '#FFB100';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        });

        document.getElementById('map-players-count').innerText = players.length + ' players online';
    }

    handleMapHover(e) {
        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        const canvasX = (e.clientX - rect.left) * scaleX;
        const canvasY = (e.clientY - rect.top) * scaleY;

        const gameX = Math.round((canvasX / canvas.width) * 3500);
        const gameZ = Math.round((canvasY / canvas.height) * 3500);

        document.getElementById('home-map-coords').innerText = `X: ${gameX} Y: 0 Z: ${gameZ}`;
    }

    handleMapClick(e) {
        // Could teleport or set waypoint
        const coords = document.getElementById('home-map-coords').innerText;
        this.tablet.showToast('Copied: ' + coords, 'info');
    }

    addToStagedKit(item) {
        this.stagedKit.push(item);
        this.updateStagedDisplay();
    }

    removeFromStagedKit(index) {
        this.stagedKit.splice(index, 1);
        this.updateStagedDisplay();
    }

    clearStagedKit() {
        this.stagedKit = [];
        this.updateStagedDisplay();
        this.tablet.showToast('Kit staging cleared', 'info');
    }

    updateStagedDisplay() {
        const container = document.getElementById('staged-items-container');
        const countEl = document.getElementById('staged-count');

        if (this.stagedKit.length === 0) {
            container.innerHTML = '<div class="empty-staged">No items staged</div>';
            countEl.innerText = '0 ITEMS';
            return;
        }

        let html = '';
        this.stagedKit.forEach((item, index) => {
            html += `
                <div class="staged-item">
                    <span>${item}</span>
                    <button class="remove-item" onclick="homeTab.removeFromStagedKit(${index})">✕</button>
                </div>
            `;
        });

        container.innerHTML = html;
        countEl.innerText = this.stagedKit.length + ' ITEMS';
    }

    syncStagedKit() {
        if (this.stagedKit.length === 0) {
            this.tablet.showError('No items in staged kit');
            return;
        }

        if (!this.tablet.connected) {
            this.tablet.showError('Not connected to server');
            return;
        }

        this.tablet.showToast('Syncing kit to server...', 'info');
        setTimeout(() => {
            this.tablet.showToast('Kit synced successfully!', 'success');
            this.clearStagedKit();
        }, 2000);
    }

    refresh() {
        if (this.selectedPlayer) {
            // Refresh player data
            this.tablet.showToast('Refreshing player data...', 'info');
        }
    }

    startLiveUpdates() {
        setInterval(() => {
            if (this.tablet.connected && this.selectedPlayer) {
                // Simulate stat changes
                this.playerStats.health = Math.max(0, this.playerStats.health - 1);
                this.playerStats.hydration = Math.max(0, this.playerStats.hydration - 1);
                this.playerStats.food = Math.max(0, this.playerStats.food - 1);
                this.playerStats.radiation = Math.min(9999, this.playerStats.radiation + 1);

                document.getElementById('health-stat').innerText = this.playerStats.health;
                document.getElementById('hydration-stat').innerText = this.playerStats.hydration;
                document.getElementById('food-stat').innerText = this.playerStats.food;
                document.getElementById('radiation-stat').innerText = this.playerStats.radiation + '/9999';
            }
        }, 30000);
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.homeTab = new HomeTab(window.drainedTablet);
});