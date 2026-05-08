// more.js – DRAINED TABLET ULTIMATE v7.0.0
// Redesigned: categorized grid with search, cleaner layout

class More {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'more') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-more');
        if (!tab) return;

        tab.innerHTML = `
            <div class="more-container">
                <div class="more-header">
                    <h2>📊 MORE TOOLS</h2>
                    <p>All additional dashboard features, organized by category</p>
                    <div class="more-search">
                        <input type="text" id="more-search" placeholder="Search tools...">
                    </div>
                </div>
                <div class="more-categories" id="more-categories">
                    <div class="loading">Loading tools...</div>
                </div>
            </div>
        `;
        this.renderCategories();
    }

    attachEvents() {
        document.getElementById('more-search')?.addEventListener('input', (e) => {
            this.filterTools(e.target.value.toLowerCase());
        });
    }

    getTools() {
        return [
            // Server Management
            { tab: 'status', icon: '📊', name: 'Status', desc: 'Server status overview', category: 'server' },
            { tab: 'performance', icon: '📊', name: 'Performance', desc: 'Performance monitor', category: 'server' },
            { tab: 'backups', icon: '💾', name: 'Backup', desc: 'Backup/restore', category: 'server' },
            { tab: 'logs', icon: '📜', name: 'Logs', desc: 'Server logs', category: 'server' },
            { tab: 'scheduler', icon: '📅', name: 'Scheduler', desc: 'Scheduled actions', category: 'server' },
            { tab: 'console', icon: '🖥️', name: 'Console', desc: 'RCON console', category: 'server' },
            { tab: 'gportal', icon: '🔌', name: 'GPortal', desc: 'GPortal connector', category: 'server' },
            { tab: 'health', icon: '📡', name: 'Health', desc: 'Connection health', category: 'server' },
            { tab: 'recovery', icon: '🔄', name: 'Recovery', desc: 'Auto-recovery', category: 'server' },
            // Player Management
            { tab: 'playerHub', icon: '📊', name: 'Player Hub', desc: 'Player statistics hub', category: 'player' },
            { tab: 'profiling', icon: '🎯', name: 'Profiling', desc: 'Player profiling', category: 'player' },
            { tab: 'psych', icon: '🧠', name: 'Psychological', desc: 'Psychological profiling', category: 'player' },
            { tab: 'predictive', icon: '📈', name: 'Predictive', desc: 'Predictive analytics', category: 'player' },
            { tab: 'playerActions', icon: '👢', name: 'Player Actions', desc: 'Warn/kick/ban', category: 'player' },
            { tab: 'clans', icon: '👥', name: 'Clans', desc: 'Clan management', category: 'player' },
            { tab: 'autoMod', icon: '🛡️', name: 'Auto-Mod', desc: 'Auto-moderation', category: 'player' },
            { tab: 'polls', icon: '🗳️', name: 'Polls', desc: 'Community polls', category: 'player' },
            { tab: 'trading', icon: '💰', name: 'Trading', desc: 'Trading floor', category: 'player' },
            { tab: 'defense', icon: '🛡️', name: 'Defense', desc: 'Base defense simulator', category: 'player' },
            { tab: 'alliance', icon: '🤝', name: 'Alliance', desc: 'Alliance network', category: 'player' },
            // World Management
            { tab: 'world', icon: '🌍', name: 'World', desc: 'World controls', category: 'world' },
            { tab: 'monuments', icon: '🏛️', name: 'Monuments', desc: 'Monument controls', category: 'world' },
            { tab: 'zones', icon: '🗺️', name: 'Zones', desc: 'Zone management', category: 'world' },
            { tab: 'zorp', icon: '🎮', name: 'ZORP', desc: 'ZORP zones', category: 'world' },
            { tab: 'entities', icon: '🚗', name: 'Entities', desc: 'Entity spawn/management', category: 'world' },
            { tab: 'spawn', icon: '🎯', name: 'Spawn', desc: 'Spawn items/entities', category: 'world' },
            { tab: 'heatmap', icon: '🔥', name: 'Heatmap', desc: 'Activity heatmap', category: 'world' },
            { tab: 'map3d', icon: '🏔️', name: '3D Map', desc: '3D map view', category: 'world' },
            { tab: 'livemap', icon: '🗺️', name: 'Live Map', desc: 'Live player map', category: 'world' },
            // Game Mechanics
            { tab: 'decay', icon: '⏳', name: 'Decay', desc: 'Decay & upkeep settings', category: 'mechanics' },
            { tab: 'modifiers', icon: '⚙️', name: 'Modifiers', desc: 'Item modifiers', category: 'mechanics' },
            { tab: 'explosives', icon: '💣', name: 'Explosives', desc: 'Raid balancing', category: 'mechanics' },
            { tab: 'traps', icon: '🪤', name: 'Traps', desc: 'Trap controls', category: 'mechanics' },
            { tab: 'items', icon: '📦', name: 'Items', desc: 'Item database', category: 'mechanics' },
            { tab: 'economy', icon: '💰', name: 'Economy', desc: 'Economy system', category: 'mechanics' },
            { tab: 'raid', icon: '⚡', name: 'Raid Detector', desc: 'Raid detection', category: 'mechanics' },
            { tab: 'animals', icon: '🐻', name: 'Animals', desc: 'Animal controls', category: 'mechanics' },
            { tab: 'heli', icon: '🚁', name: 'Helicopter', desc: 'Helicopter controls', category: 'mechanics' },
            { tab: 'underwater', icon: '🌊', name: 'Underwater', desc: 'Underwater controls', category: 'mechanics' },
            { tab: 'halloween', icon: '🎃', name: 'Halloween', desc: 'Halloween event', category: 'mechanics' },
            // Integration & Settings
            { tab: 'discord', icon: '🔗', name: 'Discord', desc: 'Discord integration', category: 'integration' },
            { tab: 'voice', icon: '🎤', name: 'Voice', desc: 'Voice commands', category: 'integration' },
            { tab: 'mobile', icon: '📱', name: 'Mobile', desc: 'Mobile sync', category: 'integration' },
            { tab: 'settings', icon: '⚙️', name: 'Dashboard Settings', desc: 'Dashboard preferences', category: 'integration' },
            { tab: 'theme', icon: '🎨', name: 'Theme Studio', desc: 'Custom themes', category: 'integration' },
            { tab: 'branding', icon: '🏷️', name: 'Branding', desc: 'Server branding', category: 'integration' },
            { tab: 'profile', icon: '👤', name: 'Profile', desc: 'User profile', category: 'integration' },
            { tab: 'idcard', icon: '🪪', name: 'ID Card', desc: 'ID card generator', category: 'integration' },
            { tab: 'claims', icon: '📦', name: 'Claims', desc: 'Claim center', category: 'integration' },
            { tab: 'combatlog', icon: '⚔️', name: 'Combat Log', desc: 'Combat log viewer', category: 'integration' },
            { tab: 'audit', icon: '📋', name: 'Audit Log', desc: 'Admin action log', category: 'integration' },
            { tab: 'user-management', icon: '👥', name: 'User Management', desc: 'Manage dashboard users', category: 'integration' }
        ];
    }

    renderCategories(filter = '') {
        const container = document.getElementById('more-categories');
        if (!container) return;

        const tools = this.getTools();
        const filtered = filter ? tools.filter(t => 
            t.name.toLowerCase().includes(filter) || 
            t.desc.toLowerCase().includes(filter)
        ) : tools;

        const categories = {
            server: { name: '🖥️ Server Management', icon: '🖥️', tools: [] },
            player: { name: '👥 Player Management', icon: '👥', tools: [] },
            world: { name: '🌍 World Management', icon: '🌍', tools: [] },
            mechanics: { name: '⚙️ Game Mechanics', icon: '⚙️', tools: [] },
            integration: { name: '🔧 Integration & Settings', icon: '🔧', tools: [] }
        };

        filtered.forEach(tool => {
            if (categories[tool.category]) categories[tool.category].tools.push(tool);
        });

        let html = '';
        for (let [key, cat] of Object.entries(categories)) {
            if (cat.tools.length === 0) continue;
            html += `
                <div class="more-category">
                    <h3>${cat.icon} ${cat.name}</h3>
                    <div class="more-grid">
                        ${cat.tools.map(tool => `
                            <div class="more-card" data-tab="${tool.tab}">
                                <div class="card-icon">${tool.icon}</div>
                                <div class="card-name">${tool.name}</div>
                                <div class="card-desc">${tool.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (filtered.length === 0) html = '<div class="no-results">No tools match your search</div>';
        container.innerHTML = html;

        container.querySelectorAll('.more-card').forEach(card => {
            card.addEventListener('click', () => {
                const tab = card.dataset.tab;
                if (tab && window.switchTab) window.switchTab(tab);
                else toast.error(`Tab "${tab}" not found`);
            });
        });
    }

    filterTools(query) {
        this.renderCategories(query);
    }

    refresh() {
        this.renderCategories();
        toast.success('More tools refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.more = new More();
});