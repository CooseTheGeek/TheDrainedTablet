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
        // Action cards (right column) – switch tabs
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                if (tab) {
                    this.switchToTab(tab);
                }
            });
        });

        // Profile link click
        document.getElementById('profile-link')?.addEventListener('click', () => {
            this.switchToTab('owner'); // Owner commands includes profile
        });

        // Listen for player updates from core
        window.addEventListener('players-updated', (e) => {
            // We don't directly use online list on home, but could if needed
        });

        // Listen for stats updates from core
        window.addEventListener('stats-updated', (e) => {
            // Could update server info on home if desired
        });

        // Listen for tab changes (to refresh when home becomes active)
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'home') {
                this.refresh();
            }
        });
    }

    loadFromTablet() {
        // Initial load if already connected
        if (this.tablet.connected && this.tablet.currentUser) {
            this.fetchPlayerStats(this.tablet.currentUser);
        }
    }

    switchToTab(tabId) {
        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        // Show the selected tab pane
        const targetPane = document.getElementById(`tab-${tabId}`);
        if (targetPane) {
            targetPane.classList.add('active');
            window.dispatchEvent(new CustomEvent('tab-changed', { detail: { tab: tabId } }));
        } else {
            console.warn(`Tab pane not found: tab-${tabId}`);
        }
    }

    fetchPlayerStats(playerName) {
        if (!this.tablet.connected) return;
        this.tablet.fetchPlayerStats(playerName).then(stats => {
            if (stats) {
                this.playerStats = stats;
                this.updateStats();
            }
        });
    }

    updateStats() {
        const healthEl = document.getElementById('health-gauge');
        const hydrationEl = document.getElementById('hydration-gauge');
        const foodEl = document.getElementById('food-gauge');
        const radiationFill = document.getElementById('radiation-fill');
        const radiationText = document.getElementById('radiation-text');

        if (healthEl) healthEl.innerText = this.playerStats.health || '--';
        if (hydrationEl) hydrationEl.innerText = (this.playerStats.hydration || 0) + '/100';
        if (foodEl) foodEl.innerText = (this.playerStats.food || 0) + '/100';
        
        // Radiation: show as current/9999 (stylized max)
        const rad = this.playerStats.radiation || 0;
        if (radiationFill) radiationFill.style.width = (rad / 100) + '%'; // rad is 0-100
        if (radiationText) radiationText.innerText = rad + '/9999';

        // Update armor slots (example, would need real data)
        // For now, we'll keep them empty or with sample data from tablet if available
        // In real implementation, we'd fetch player.inventory wear via RCON
        // For demonstration, we'll leave slots as is (they'll show empty)
    }

    refresh() {
        if (this.tablet.connected && this.tablet.currentUser) {
            this.fetchPlayerStats(this.tablet.currentUser);
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.homeTab = new HomeTab();
});