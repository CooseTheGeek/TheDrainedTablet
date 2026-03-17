// tools-integration.js – DRAINED TABLET ULTIMATE v7.0.0
// Consolidated page for all tools and integration features.

class ToolsIntegration {
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
            if (e.detail.tab === 'tools-integration') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-tools-integration');
        if (!tab) return;
        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="page-container">
                <div class="page-header">
                    <h2>🔧 Tools & Integration</h2>
                    <p>All additional tools and integrations in one place</p>
                </div>
                <div class="search-bar">
                    <input type="text" id="tools-integration-search" placeholder="Search tools...">
                </div>
                <div class="category-grid" id="tools-integration-grid">
                    <!-- Categories will be injected here -->
                </div>
            </div>

            <!-- Modal for loading feature content -->
            <div id="tools-integration-modal" class="modal hidden">
                <div class="modal-content" style="max-width: 800px;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 id="tools-integration-modal-title">Feature</h3>
                        <button id="tools-integration-modal-close" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
                    </div>
                    <div id="tools-integration-modal-body" style="max-height: 70vh; overflow-y: auto;"></div>
                </div>
            </div>
        `;

        this.renderCategories();
    }

    getTools() {
        return [
            // Knowledge Base
            { id: 'resources', name: 'Knowledge Base', icon: '📚', desc: 'Build costs, raid costs, monuments', category: 'reference', module: 'resources', tab: 'resources' },
            // ID Card Generator
            { id: 'idcard', name: 'ID Card Generator', icon: '🪪', desc: 'Customize and download ID cards', category: 'profile', module: 'idCardGenerator', tab: 'idcard' },
            // Combat Log
            { id: 'combatlog', name: 'Combat Log', icon: '⚔️', desc: 'Player combat logs', category: 'analytics', module: 'combatLog', tab: 'combatlog' },
            // Audit Log
            { id: 'audit', name: 'Audit Log', icon: '📋', desc: 'Admin action log', category: 'admin', module: 'auditLog', tab: 'audit' },
            // User Management
            { id: 'user-management', name: 'User Management', icon: '👥', desc: 'Manage dashboard users', category: 'admin', module: 'userManagement', tab: 'user-management' },
            // Discord Sync
            { id: 'discord', name: 'Discord Sync', icon: '🔗', desc: 'Discord integration', category: 'integration', module: 'discordSync', tab: 'discord' },
            // Voice Commands
            { id: 'voice', name: 'Voice Commands', icon: '🎤', desc: 'Voice control', category: 'integration', module: 'voiceCommands', tab: 'voice' },
            // 3D Map
            { id: 'map3d', name: '3D Map', icon: '🏔️', desc: '3D map view', category: 'visualization', module: 'map3d', tab: 'map3d' },
            // Heatmap
            { id: 'heatmap', name: 'Heatmap', icon: '🔥', desc: 'Activity heatmap', category: 'visualization', module: 'heatmap', tab: 'heatmap' },
            // Shop System
            { id: 'shop', name: 'Shop System', icon: '🏪', desc: 'Server shop', category: 'economy', module: 'shopSystem', tab: 'shop' },
            // Theme Studio
            { id: 'theme', name: 'Theme Studio', icon: '🎨', desc: 'Custom themes', category: 'customization', module: 'themeStudio', tab: 'theme' },
            // Branding
            { id: 'branding', name: 'Branding', icon: '🏷️', desc: 'Server branding', category: 'customization', module: 'branding', tab: 'branding' },
            // Mobile Sync
            { id: 'mobile', name: 'Mobile Sync', icon: '📱', desc: 'Mobile device sync', category: 'integration', module: 'mobileSync', tab: 'mobile' },
            // Raid Detector
            { id: 'raid', name: 'Raid Detector', icon: '⚡', desc: 'Raid detection', category: 'monitoring', module: 'raidDetector', tab: 'raid' },
            // Inventory Viewer
            { id: 'inventoryViewer', name: 'Inventory Viewer', icon: '👁️', desc: 'Live player inventory', category: 'monitoring', module: 'inventoryViewer', tab: 'inventoryViewer' }
        ];
    }

    renderCategories(filter = '') {
        const grid = document.getElementById('tools-integration-grid');
        if (!grid) return;

        const tools = this.getTools();
        const filtered = filter ? tools.filter(t => 
            t.name.toLowerCase().includes(filter) || 
            t.desc.toLowerCase().includes(filter)
        ) : tools;

        // Group by category
        const categories = {
            reference: { name: '📚 Reference', icon: '📚', tools: [] },
            profile: { name: '🪪 Profile', icon: '🪪', tools: [] },
            analytics: { name: '📊 Analytics', icon: '📊', tools: [] },
            admin: { name: '👑 Administration', icon: '👑', tools: [] },
            integration: { name: '🔗 Integration', icon: '🔗', tools: [] },
            visualization: { name: '🗺️ Visualization', icon: '🗺️', tools: [] },
            economy: { name: '💰 Economy', icon: '💰', tools: [] },
            customization: { name: '🎨 Customization', icon: '🎨', tools: [] },
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
        document.getElementById('tools-integration-search')?.addEventListener('input', (e) => {
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
        document.getElementById('tools-integration-modal-close')?.addEventListener('click', () => {
            this.closeModal();
        });
        document.getElementById('tools-integration-modal')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal();
            }
        });
    }

    async openFeature(toolId, moduleName, tabName) {
        const modal = document.getElementById('tools-integration-modal');
        const title = document.getElementById('tools-integration-modal-title');
        const body = document.getElementById('tools-integration-modal-body');

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
        const modal = document.getElementById('tools-integration-modal');
        modal.classList.add('hidden');
        document.getElementById('tools-integration-modal-body').innerHTML = '';
    }

    refresh() {
        this.renderCategories(this.searchQuery);
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.toolsIntegration = new ToolsIntegration();
});