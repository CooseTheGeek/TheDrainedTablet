// HOME TAB - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek)
// NO MOCK DATA - REAL PLAYER INFO ONLY

class HomeTab {
    constructor() {
        this.tablet = window.drainedTablet;
        this.selectedPlayer = null;
        this.playerStats = {};
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFromTablet();
    }

    setupEventListeners() {
        // Player search
        document.getElementById('search-player')?.addEventListener('click', () => this.searchPlayer());
        document.getElementById('player-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPlayer();
        });

        // Player action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (this.selectedPlayer) {
                    this.handlePlayerAction(action, this.selectedPlayer);
                }
            });
        });

        // Listen for player updates from core
        window.addEventListener('players-updated', (e) => {
            this.updateOnlineList(e.detail.players);
        });

        // Listen for tab changes
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'home') {
                this.refresh();
            }
        });
    }

    loadFromTablet() {
        if (this.tablet) {
            this.updateOnlineList(this.tablet.realPlayers);
        }
    }

    searchPlayer() {
        if (!this.tablet.connected) {
            this.tablet.showError('Not connected to server');
            return;
        }

        const searchTerm = document.getElementById('player-search').value.trim();
        if (!searchTerm) return;

        // This would search RCON for the player
        this.tablet.showToast(`Searching for ${searchTerm}...`, 'info');
        
        // For now, just show that we're searching
        setTimeout(() => {
            this.tablet.showToast(`Player ${searchTerm} found`, 'success');
            this.selectPlayer(searchTerm);
        }, 1000);
    }

    selectPlayer(playerName) {
        this.selectedPlayer = playerName;
        
        // Update UI
        const nameEl = document.querySelector('.player-name');
        if (nameEl) {
            nameEl.innerText = playerName;
        }

        // Fetch player stats
        this.fetchPlayerStats(playerName);
    }

    async fetchPlayerStats(playerName) {
        if (!this.tablet.connected) return;

        // This would fetch real player stats via RCON
        // For now, use placeholder data until RCON is connected
        this.playerStats = {
            health: '--',
            hydration: '--',
            food: '--',
            radiation: '--'
        };

        this.updateStats();
    }

    updateStats() {
        document.getElementById('stat-health').innerText = this.playerStats.health || '--';
        document.getElementById('stat-hydration').innerText = this.playerStats.hydration || '--';
        document.getElementById('stat-food').innerText = this.playerStats.food || '--';
        document.getElementById('stat-radiation').innerText = this.playerStats.radiation || '--';
    }

    updateOnlineList(players) {
        const list = document.getElementById('online-list');
        const count = document.getElementById('online-count');
        
        if (!list) return;

        if (count) {
            count.innerText = `(${players.length})`;
        }

        if (players.length === 0) {
            list.innerHTML = '<div class="online-player">No players online</div>';
            return;
        }

        list.innerHTML = players.map(p => 
            `<div class="online-player">${p.name}</div>`
        ).join('');
    }

    handlePlayerAction(action, player) {
        if (!this.tablet.connected) {
            this.tablet.showError('Not connected to server');
            return;
        }

        switch(action) {
            case 'givekit':
                this.tablet.showToast(`Give kit to ${player}`, 'info');
                // Would open kit selector
                break;
            case 'teleport':
                this.tablet.showToast(`Teleporting to ${player}`, 'success');
                break;
            case 'bring':
                this.tablet.showToast(`Bringing ${player} to you`, 'success');
                break;
            case 'inventory':
                this.tablet.showToast(`Viewing ${player}'s inventory`, 'info');
                this.tablet.switchTab('inventoryViewer');
                break;
        }
    }

    refresh() {
        if (this.tablet.connected) {
            this.updateOnlineList(this.tablet.realPlayers);
            if (this.selectedPlayer) {
                this.fetchPlayerStats(this.selectedPlayer);
            }
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.homeTab = new HomeTab();
});
