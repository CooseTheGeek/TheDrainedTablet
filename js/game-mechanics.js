// game-mechanics.js – DRAINED TABLET ULTIMATE v7.0.0
// Consolidated page for all game mechanics tools.

class GameMechanics {
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
            if (e.detail.tab === 'game-mechanics') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-game-mechanics');
        if (!tab) return;
        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="page-container">
                <div class="page-header">
                    <h2>⚙️ Game Mechanics</h2>
                    <p>All game system tools in one place</p>
                </div>
                <div class="search-bar">
                    <input type="text" id="game-mechanics-search" placeholder="Search tools...">
                </div>
                <div class="category-grid" id="game-mechanics-grid">
                    <!-- Categories will be injected here -->
                </div>
            </div>

            <!-- Modal for loading feature content -->
            <div id="game-mechanics-modal" class="modal hidden">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 id="game-mechanics-modal-title">Feature</h3>
                        <button id="game-mechanics-modal-close" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <div id="game-mechanics-modal-body" style="max-height: 70vh; overflow-y: auto;"></div>
                </div>
            </div>
        `;

        this.renderCategories();
    }

    getTools() {
        return [
            // Items
            { id: 'items', name: 'Items', icon: '📦', desc: 'Item database', category: 'items', module: 'items', tab: 'items' },
            // Kits
            { id: 'kits', name: 'Kits', icon: '🧰', desc: 'Kit manager', category: 'items', module: 'kits', tab: 'kits' },
            // Vehicles
            { id: 'vehicles', name: 'Vehicles', icon: '🚗', desc: 'Vehicle spawner', category: 'vehicles', module: 'vehicles', tab: 'vehicles' },
            // Teleport
            { id: 'teleport', name: 'Teleport', icon: '📍', desc: 'Teleport manager', category: 'world', module: 'teleport', tab: 'teleport' },
            // Events
            { id: 'events', name: 'Events', icon: '🎉', desc: 'Event manager', category: 'world', module: 'events', tab: 'events' },
            // Decay
            { id: 'decay', name: 'Decay', icon: '⏳', desc: 'Decay settings', category: 'build', module: 'decay', tab: 'decay' },
            // Explosives
            { id: 'explosives', name: 'Explosives', icon: '💣', desc: 'Raid balancing', category: 'combat', module: 'explosives', tab: 'explosives' },
            // Traps
            { id: 'traps', name: 'Traps', icon: '🪤', desc: 'Trap controls', category: 'combat', module: 'traps', tab: 'traps' },
            // Underwater
            { id: 'underwater', name: 'Underwater', icon: '🌊', desc: 'Underwater controls', category: 'world', module: 'underwater', tab: 'underwater' },
            // Halloween
            { id: 'halloween', name: 'Halloween', icon: '🎃', desc: 'Halloween event', category: 'seasonal', module: 'halloween', tab: 'halloween' },
            // Helicopter
            { id: 'heli', name: 'Helicopter', icon: '🚁', desc: 'Helicopter controls', category: 'vehicles', module: 'heli', tab: 'heli' },
            // Kit Vending
            { id: 'kitVending', name: 'Kit Vending', icon: '🏪', desc: 'Kit vending machines', category: 'items', module: 'kitVending', tab: 'kitVending' },
            // Modifiers
            { id: 'modifiers', name: 'Modifiers', icon: '⚙️', desc: 'Item modifiers', category: 'items', module: 'modifiers', tab: 'modifiers' },
            // Animals
            { id: 'animals', name: 'Animals', icon: '🐻', desc: 'Animal controls', category: 'world', module: 'animals', tab: 'animals' },
            // AutoMod
            { id: 'autoMod', name: 'AutoMod', icon: '🛡️', desc: 'Auto-moderation', category: 'admin', module: 'autoMod', tab: 'autoMod' }
        ];
    }

    renderCategories(filter = '') {
        const grid = document.getElementById('game-mechanics-grid');
        if (!grid) return;

        const tools = this.getTools();
        const filtered = filter ? tools.filter(t => 
            t.name.toLowerCase().includes(filter) || 
            t.desc.toLowerCase().includes(filter)
        ) : tools;

        // Group by category
        const categories = {
            items: { name: '📦 Items & Kits', icon: '📦', tools: [] },
            vehicles: { name: '🚗 Vehicles', icon: '🚗', tools: [] },
            world: { name: '🌍 World', icon: '🌍', tools: [] },
            combat: { name: '⚔️ Combat', icon: '⚔️', tools: [] },
            build: { name: '🏗️ Building', icon: '🏗️', tools: [] },
            seasonal: { name: '🎉 Seasonal', icon: '🎉', tools: [] },
            admin: { name: '⚙️ Admin', icon: '⚙️', tools: [] }
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
        document.getElementById('game-mechanics-search')?.addEventListener('input', (e) => {
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
        document.getElementById('game-mechanics-modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });
        document.getElementById('game-mechanics-modal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    async openFeature(toolId, moduleName, tabName) {
        const modal = document.getElementById('game-mechanics-modal');
        const title = document.getElementById('game-mechanics-modal-title');
        const body = document.getElementById('game-mechanics-modal-body');

        title.innerText = toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        body.innerHTML = '<div class="loading">Loading...</div>';
        modal.classList.remove('hidden');

        // Get the original tab content and clone it into the modal
        const originalTab = document.getElementById(`tab-${tabName}`);
        if (originalTab) {
            const clone = originalTab.cloneNode(true);
            clone.id = `modal-${toolId}`;
            clone.classList.remove('hidden');
            body.innerHTML = '';
            body.appendChild(clone);

            const module = window[moduleName];
            if (module && typeof module.refresh === 'function') {
                module.refresh();
            }
        } else {
            body.innerHTML = '<div class="error">Feature not available</div>';
        }
    }

    closeModal() {
        const modal = document.getElementById('game-mechanics-modal');
        modal.classList.add('hidden');
        document.getElementById('game-mechanics-modal-body').innerHTML = '';
    }

    refresh() {
        this.renderCategories(this.searchQuery);
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.gameMechanics = new GameMechanics();
});