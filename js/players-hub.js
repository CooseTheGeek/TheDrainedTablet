// players-hub.js – DRAINED TABLET ULTIMATE v7.0.0
// Consolidated page for all player-related tools.

class PlayersHub {
    constructor() {
        this.access = window.accessControl;
        this.searchQuery = '';
        this.modalStack = [];
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'players-hub') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-players-hub');
        if (!tab) return;
        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="page-container">
                <div class="page-header">
                    <h2>👥 Players Hub</h2>
                    <p>All player management tools in one place</p>
                </div>
                <div class="search-bar">
                    <input type="text" id="players-hub-search" placeholder="Search tools...">
                </div>
                <div class="category-grid" id="players-hub-grid">
                    <!-- Categories will be injected here -->
                </div>
            </div>

            <!-- Modal for loading feature content -->
            <div id="players-hub-modal" class="modal hidden">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 id="players-hub-modal-title">Feature</h3>
                        <button id="players-hub-modal-close" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <div id="players-hub-modal-body" style="max-height: 70vh; overflow-y: auto;"></div>
                </div>
            </div>
        `;

        this.renderCategories();
    }

    getTools() {
        return [
            // Player List (from players.js)
            { id: 'players-list', name: 'Player List', icon: '👥', desc: 'View and manage online players', category: 'players', module: 'players', tab: 'players' },
            // Player Profiling (from playerProfiling.js)
            { id: 'player-profiling', name: 'Player Profiling', icon: '🎯', desc: 'Risk assessment and behavior tracking', category: 'analytics', module: 'playerProfiling', tab: 'profiling' },
            // Psychological (from psychological.js)
            { id: 'psychological', name: 'Psychological', icon: '🧠', desc: 'Playstyle analysis and predictions', category: 'analytics', module: 'psychological', tab: 'psych' },
            // Predictive Analytics (from predictiveAnalytics.js)
            { id: 'predictive', name: 'Predictive Analytics', icon: '📈', desc: 'Next wipe, peak hours, raid risk', category: 'analytics', module: 'predictiveAnalytics', tab: 'predictive' },
            // Clans (from clans.js)
            { id: 'clans', name: 'Clans', icon: '👥', desc: 'Clan management', category: 'social', module: 'clans', tab: 'clans' },
            // Community Polls (from communityPolls.js)
            { id: 'polls', name: 'Community Polls', icon: '🗳️', desc: 'Create and vote on polls', category: 'social', module: 'communityPolls', tab: 'polls' },
            // Trading Floor (from tradingFloor.js)
            { id: 'trading', name: 'Trading Floor', icon: '💰', desc: 'Player trading system', category: 'economy', module: 'tradingFloor', tab: 'trading' },
            // Alliance Network (from allianceNetwork.js)
            { id: 'alliance', name: 'Alliance Network', icon: '🤝', desc: 'Cross-server alliances', category: 'social', module: 'allianceNetwork', tab: 'alliance' },
            // Base Defense (from baseDefense.js)
            { id: 'defense', name: 'Base Defense', icon: '🛡️', desc: 'Simulate base attacks', category: 'strategy', module: 'baseDefense', tab: 'defense' },
            // ZORP Zones (from zorp.js)
            { id: 'zorp', name: 'ZORP Zones', icon: '🎮', desc: 'Special zone management', category: 'world', module: 'zorpZones', tab: 'zorp' },
            // Player Actions (from playerActions.js)
            { id: 'player-actions', name: 'Player Actions', icon: '👢', desc: 'Warn, kick, ban, mute', category: 'actions', module: 'playerActions', tab: 'playerActions' },
            // Player Hub (from playerHub.js)
            { id: 'player-hub', name: 'Player Hub', icon: '📊', desc: 'Player statistics hub', category: 'analytics', module: 'playerHub', tab: 'playerHub' }
        ];
    }

    renderCategories(filter = '') {
        const grid = document.getElementById('players-hub-grid');
        if (!grid) return;

        const tools = this.getTools();
        const filtered = filter ? tools.filter(t => 
            t.name.toLowerCase().includes(filter) || 
            t.desc.toLowerCase().includes(filter)
        ) : tools;

        // Group by category
        const categories = {
            players: { name: '👥 Player Lists', icon: '👥', tools: [] },
            analytics: { name: '📊 Analytics', icon: '📊', tools: [] },
            social: { name: '🤝 Social', icon: '🤝', tools: [] },
            economy: { name: '💰 Economy', icon: '💰', tools: [] },
            strategy: { name: '🛡️ Strategy', icon: '🛡️', tools: [] },
            world: { name: '🌍 World', icon: '🌍', tools: [] },
            actions: { name: '⚡ Actions', icon: '⚡', tools: [] }
        };

        filtered.forEach(tool => {
            if (categories[tool.category]) {
                categories[tool.category].tools.push(tool);
            }
        });

        let html = '';
        for (let [key, cat] of Object.entries(categories)) {
            if (cat.tools.length === 0) continue;
            html += `
                <div class="category-card">
                    <h3>${cat.icon} ${cat.name}</h3>
                    <div class="feature-list">
                        ${cat.tools.map(tool => `
                            <div class="feature-item" data-tool-id="${tool.id}" data-module="${tool.module}" data-tab="${tool.tab}">
                                <span class="feature-icon">${tool.icon}</span>
                                <span class="feature-name">${tool.name}</span>
                                <span class="feature-desc">${tool.desc}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (filtered.length === 0) {
            html = '<div class="no-results" style="text-align: center; padding: 2rem;">No tools found</div>';
        }

        grid.innerHTML = html;
    }

    attachEvents() {
        document.getElementById('players-hub-search')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderCategories(this.searchQuery);
        });

        // Delegate for feature item clicks
        document.addEventListener('click', (e) => {
            const feature = e.target.closest('.feature-item');
            if (feature) {
                const toolId = feature.dataset.toolId;
                const moduleName = feature.dataset.module;
                const tabName = feature.dataset.tab;
                this.openFeature(toolId, moduleName, tabName);
            }
        });

        // Modal close
        document.getElementById('players-hub-modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });
        document.getElementById('players-hub-modal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    async openFeature(toolId, moduleName, tabName) {
        const modal = document.getElementById('players-hub-modal');
        const title = document.getElementById('players-hub-modal-title');
        const body = document.getElementById('players-hub-modal-body');

        title.innerText = toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        body.innerHTML = '<div class="loading">Loading...</div>';
        modal.classList.remove('hidden');

        // Get the original tab content and clone it into the modal
        const originalTab = document.getElementById(`tab-${tabName}`);
        if (originalTab) {
            // Clone the content (deep)
            const clone = originalTab.cloneNode(true);
            clone.id = `modal-${toolId}`;
            clone.classList.remove('hidden'); // ensure it's visible
            body.innerHTML = '';
            body.appendChild(clone);

            // Re-initialize the module if needed (some modules may need to re-run their init)
            // We can try to call the module's refresh or init method if it exists
            const module = window[moduleName];
            if (module && typeof module.refresh === 'function') {
                module.refresh();
            } else if (module && typeof module.init === 'function') {
                // Some modules may not have refresh; we can try to call a method that updates the UI
                // This is a bit risky, but we'll attempt to call a method that re-renders.
                // Alternatively, we can rely on the fact that the HTML is already there and the module's event listeners
                // are attached globally, so interactions should work.
                console.log(`Module ${moduleName} may need manual refresh`);
            }
        } else {
            body.innerHTML = '<div class="error">Feature not available</div>';
        }
    }

    closeModal() {
        const modal = document.getElementById('players-hub-modal');
        modal.classList.add('hidden');
        document.getElementById('players-hub-modal-body').innerHTML = '';
    }

    refresh() {
        this.renderCategories(this.searchQuery);
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.playersHub = new PlayersHub();
});