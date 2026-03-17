// server-management.js – DRAINED TABLET ULTIMATE v7.0.0
// Consolidated page for all server management tools.

class ServerManagement {
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
            if (e.detail.tab === 'server-management') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-server-management');
        if (!tab) return;
        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="page-container">
                <div class="page-header">
                    <h2>🖥️ Server Management</h2>
                    <p>All server control tools in one place</p>
                </div>
                <div class="search-bar">
                    <input type="text" id="server-management-search" placeholder="Search tools...">
                </div>
                <div class="category-grid" id="server-management-grid">
                    <!-- Categories will be injected here -->
                </div>
            </div>

            <!-- Modal for loading feature content -->
            <div id="server-management-modal" class="modal hidden">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 id="server-management-modal-title">Feature</h3>
                        <button id="server-management-modal-close" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <div id="server-management-modal-body" style="max-height: 70vh; overflow-y: auto;"></div>
                </div>
            </div>
        `;

        this.renderCategories();
    }

    getTools() {
        return [
            // Master Control
            { id: 'master-control', name: 'Master Control', icon: '👑', desc: 'Full server control panel', category: 'core', module: 'masterControl', tab: 'master' },
            // Economy
            { id: 'economy', name: 'Economy', icon: '💰', desc: 'Economy management', category: 'core', module: 'economy', tab: 'economy' },
            // World
            { id: 'world', name: 'World', icon: '🌍', desc: 'World controls', category: 'world', module: 'world', tab: 'world' },
            // Monuments
            { id: 'monuments', name: 'Monuments', icon: '🏛️', desc: 'Monument controls', category: 'world', module: 'monuments', tab: 'monuments' },
            // Zones
            { id: 'zones', name: 'Zones', icon: '🗺️', desc: 'Custom zone management', category: 'world', module: 'zones', tab: 'zones' },
            // Entities
            { id: 'entities', name: 'Entities', icon: '🚗', desc: 'Entity spawn/management', category: 'world', module: 'entities', tab: 'entities' },
            // Spawn
            { id: 'spawn', name: 'Spawn', icon: '🎯', desc: 'Spawn items/entities', category: 'world', module: 'spawn', tab: 'spawn' },
            // Backups
            { id: 'backups', name: 'Backups', icon: '💾', desc: 'Backup/restore', category: 'admin', module: 'backups', tab: 'backups' },
            // Logs
            { id: 'logs', name: 'Logs', icon: '📜', desc: 'Server logs', category: 'admin', module: 'logs', tab: 'logs' },
            // Console
            { id: 'console', name: 'Console', icon: '🖥️', desc: 'RCON console', category: 'admin', module: 'consoleView', tab: 'console' },
            // GPortal
            { id: 'gportal', name: 'GPortal', icon: '🔌', desc: 'GPortal connector', category: 'hosting', module: 'gportalConnector', tab: 'gportal' },
            // Recovery
            { id: 'recovery', name: 'Recovery', icon: '🔄', desc: 'Auto-recovery', category: 'admin', module: 'autoRecovery', tab: 'recovery' },
            // Performance Metrics
            { id: 'performance', name: 'Performance', icon: '📊', desc: 'Performance monitor', category: 'monitoring', module: 'performanceMetrics', tab: 'performance' },
            // Connection Health
            { id: 'health', name: 'Health', icon: '📡', desc: 'Connection health', category: 'monitoring', module: 'connectionHealth', tab: 'health' },
            // Status
            { id: 'status', name: 'Status', icon: '📊', desc: 'Server status overview', category: 'monitoring', module: 'status', tab: 'status' }
        ];
    }

    renderCategories(filter = '') {
        const grid = document.getElementById('server-management-grid');
        if (!grid) return;

        const tools = this.getTools();
        const filtered = filter ? tools.filter(t => 
            t.name.toLowerCase().includes(filter) || 
            t.desc.toLowerCase().includes(filter)
        ) : tools;

        // Group by category
        const categories = {
            core: { name: '👑 Core Controls', icon: '👑', tools: [] },
            world: { name: '🌍 World Management', icon: '🌍', tools: [] },
            admin: { name: '⚙️ Administration', icon: '⚙️', tools: [] },
            hosting: { name: '🔌 Hosting', icon: '🔌', tools: [] },
            monitoring: { name: '📡 Monitoring', icon: '📡', tools: [] }
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
        document.getElementById('server-management-search')?.addEventListener('input', (e) => {
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
        document.getElementById('server-management-modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });
        document.getElementById('server-management-modal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    async openFeature(toolId, moduleName, tabName) {
        const modal = document.getElementById('server-management-modal');
        const title = document.getElementById('server-management-modal-title');
        const body = document.getElementById('server-management-modal-body');

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
        const modal = document.getElementById('server-management-modal');
        modal.classList.add('hidden');
        document.getElementById('server-management-modal-body').innerHTML = '';
    }

    refresh() {
        this.renderCategories(this.searchQuery);
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.serverManagement = new ServerManagement();
});