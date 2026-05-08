// more.js – DRAINED TABLET ULTIMATE v7.0.0
// Redesigned: compact grid that fits on one page, each tool opens its own tab.

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
                    <p>Click any card to open its full dashboard</p>
                    <div class="more-search">
                        <input type="text" id="more-search" placeholder="Search tools...">
                    </div>
                </div>
                <div class="more-categories" id="more-categories"></div>
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
            { tab: 'status', icon: '📊', name: 'Status', desc: 'Server status', category: 'server' },
            { tab: 'performance', icon: '📊', name: 'Performance', desc: 'Performance', category: 'server' },
            { tab: 'backups', icon: '💾', name: 'Backup', desc: 'Backup/restore', category: 'server' },
            { tab: 'logs', icon: '📜', name: 'Logs', desc: 'Server logs', category: 'server' },
            { tab: 'scheduler', icon: '📅', name: 'Scheduler', desc: 'Schedule actions', category: 'server' },
            { tab: 'console', icon: '🖥️', name: 'Console', desc: 'RCON console', category: 'server' },
            { tab: 'gportal', icon: '🔌', name: 'GPortal', desc: 'GPortal connector', category: 'server' },
            { tab: 'health', icon: '📡', name: 'Health', desc: 'Connection health', category: 'server' },
            { tab: 'recovery', icon: '🔄', name: 'Recovery', desc: 'Auto-recovery', category: 'server' },
            // Player Management
            { tab: 'playerHub', icon: '📊', name: 'Player Hub', desc: 'Player stats hub', category: 'player' },
            { tab: 'profiling', icon: '🎯', name: 'Profiling', desc: 'Risk assessment', category: 'player' },
            { tab: 'psych', icon: '🧠', name: 'Psychological', desc: 'Playstyle analysis', category: 'player' },
            { tab: 'predictive', icon: '📈', name: 'Predictive', desc: 'Analytics', category: 'player' },
            { tab: 'playerActions', icon: '👢', name: 'Player Actions', desc: 'Warn/kick/ban', category: 'player' },
            { tab: 'clans', icon: '👥', name: 'Clans', desc: 'Clan management', category: 'player' },
            { tab: 'autoMod', icon: '🛡️', name: 'Auto-Mod', desc: 'Auto-moderation', category: 'player' },
            { tab: 'polls', icon: '🗳️', name: 'Polls', desc: 'Community polls', category: 'player' },
            { tab: 'trading', icon: '💰', name: 'Trading', desc: 'Trading floor', category: 'player' },
            { tab: 'defense', icon: '🛡️', name: 'Defense', desc: 'Base defense sim', category: 'player' },
            { tab: 'alliance', icon: '🤝', name: 'Alliance', desc: 'Alliance network', category: 'player' },
            // World Management
            { tab: 'world', icon: '🌍', name: 'World', desc: 'World controls', category: 'world' },
            { tab: 'monuments', icon: '🏛️', name: 'Monuments', desc: 'Monument controls', category: 'world' },
            { tab: 'zones', icon: '🗺️', name: 'Zones', desc: 'Zone management', category: 'world' },
            { tab: 'zorp', icon: '🎮', name: 'ZORP', desc: 'ZORP zones', category: 'world' },
            { tab: 'entities', icon: '🚗', name: 'Entities', desc: 'Entity spawn', category: 'world' },
            { tab: 'spawn', icon: '🎯', name: 'Spawn', desc: 'Spawn items', category: 'world' },
            { tab: 'heatmap', icon: '🔥', name: 'Heatmap', desc: 'Activity heatmap', category: 'world' },
            { tab: 'map3d', icon: '🏔️', name: '3D Map', desc: '3D map view', category: 'world' },
            { tab: 'livemap', icon: '🗺️', name: 'Live Map', desc: 'Live player map', category: 'world' },
            // Game Mechanics
            { tab: 'decay', icon: '⏳', name: 'Decay', desc: 'Decay settings', category: 'mechanics' },
            { tab: 'modifiers', icon: '⚙️', name: 'Modifiers', desc: 'Item modifiers', category: 'mechanics' },
            { tab: 'explosives', icon: '💣', name: 'Explosives', desc: 'Raid balancing', category: 'mechanics' },
            { tab: 'traps', icon: '🪤', name: 'Traps', desc: 'Trap controls', category: 'mechanics' },
            { tab: 'items', icon: '📦', name: 'Items', desc: 'Item database', category: 'mechanics' },
            { tab: 'economy', icon: '💰', name: 'Economy', desc: 'Economy system', category: 'mechanics' },
            { tab: 'raid', icon: '⚡', name: 'Raid Detector', desc: 'Raid detection', category: 'mechanics' },
            { tab: 'animals', icon: '🐻', name: 'Animals', desc: 'Animal controls', category: 'mechanics' },
            { tab: 'heli', icon: '🚁', name: 'Helicopter', desc: 'Heli controls', category: 'mechanics' },
            { tab: 'underwater', icon: '🌊', name: 'Underwater', desc: 'Underwater', category: 'mechanics' },
            { tab: 'halloween', icon: '🎃', name: 'Halloween', desc: 'Halloween event', category: 'mechanics' },
            // Integration
            { tab: 'discord', icon: '🔗', name: 'Discord', desc: 'Discord sync', category: 'integration' },
            { tab: 'voice', icon: '🎤', name: 'Voice', desc: 'Voice commands', category: 'integration' },
            { tab: 'mobile', icon: '📱', name: 'Mobile', desc: 'Mobile sync', category: 'integration' },
            { tab: 'settings', icon: '⚙️', name: 'Settings', desc: 'Dashboard prefs', category: 'integration' },
            { tab: 'theme', icon: '🎨', name: 'Theme Studio', desc: 'Custom themes', category: 'integration' },
            { tab: 'branding', icon: '🏷️', name: 'Branding', desc: 'Server branding', category: 'integration' },
            { tab: 'profile', icon: '👤', name: 'Profile', desc: 'User profile', category: 'integration' },
            { tab: 'idcard', icon: '🪪', name: 'ID Card', desc: 'ID card gen', category: 'integration' },
            { tab: 'claims', icon: '📦', name: 'Claims', desc: 'Claim center', category: 'integration' },
            { tab: 'combatlog', icon: '⚔️', name: 'Combat Log', desc: 'Combat log viewer', category: 'integration' },
            { tab: 'audit', icon: '📋', name: 'Audit Log', desc: 'Admin log', category: 'integration' },
            { tab: 'user-management', icon: '👥', name: 'User Management', desc: 'Manage users', category: 'integration' }
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
            server: { name: '🖥️ Server', icon: '🖥️', tools: [] },
            player: { name: '👥 Player', icon: '👥', tools: [] },
            world: { name: '🌍 World', icon: '🌍', tools: [] },
            mechanics: { name: '⚙️ Mechanics', icon: '⚙️', tools: [] },
            integration: { name: '🔧 Integration', icon: '🔧', tools: [] }
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
                if (tab && window.switchTab) {
                    window.switchTab(tab);
                } else {
                    toast.error(`Tab "${tab}" not found`);
                }
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