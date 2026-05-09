// more.js – DRAINED TABLET ULTIMATE v7.0.0
// Hamburger collapsible categories style (previously working)

class More {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.build());
        } else {
            this.build();
        }
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'more') this.refresh();
        });
    }

    build() {
        this.createHTML();
        this.attachEvents();
    }

    createHTML() {
        const tab = document.getElementById('tab-more');
        if (!tab) return;
        tab.innerHTML = `
            <div class="more-container">
                <div class="more-header">
                    <h2>📊 MORE TOOLS</h2>
                    <p>Click a category to expand, then any tool to open</p>
                </div>
                <div id="more-tools-categories"></div>
            </div>
        `;
        this.renderCategories();
    }

    attachEvents() {
        // Event delegation for category toggles (hamburger)
        document.addEventListener('click', (e) => {
            const header = e.target.closest('.more-tools-category-header');
            if (header && this.isMoreTabActive()) {
                const content = header.parentElement.querySelector('.more-tools-category-content');
                const toggle = header.querySelector('.category-toggle');
                if (content.classList.contains('open')) {
                    content.classList.remove('open');
                    if (toggle) toggle.textContent = '▼';
                } else {
                    content.classList.add('open');
                    if (toggle) toggle.textContent = '▲';
                }
            }
            const item = e.target.closest('.more-tools-item');
            if (item && this.isMoreTabActive()) {
                const tab = item.dataset.tab;
                if (tab && window.switchTab) window.switchTab(tab);
                else toast.error(`Tab "${tab}" not found`);
            }
        });
    }

    isMoreTabActive() {
        const activePane = document.querySelector('.tab-pane.active');
        return activePane && activePane.id === 'tab-more';
    }

    getTools() {
        return {
            server: { name: "🖥️ Server Management", tools: [
                { tab: 'status', icon: '📊', name: 'Status', desc: 'Server status' },
                { tab: 'performance', icon: '📊', name: 'Performance', desc: 'Performance' },
                { tab: 'backups', icon: '💾', name: 'Backup', desc: 'Backup/restore' },
                { tab: 'logs', icon: '📜', name: 'Logs', desc: 'Server logs' },
                { tab: 'scheduler', icon: '📅', name: 'Scheduler', desc: 'Schedule actions' },
                { tab: 'console', icon: '🖥️', name: 'Console', desc: 'RCON console' },
                { tab: 'gportal', icon: '🔌', name: 'GPortal', desc: 'GPortal connector' },
                { tab: 'health', icon: '📡', name: 'Health', desc: 'Connection health' },
                { tab: 'recovery', icon: '🔄', name: 'Recovery', desc: 'Auto-recovery' }
            ] },
            player: { name: "👥 Player Management", tools: [
                { tab: 'playerHub', icon: '📊', name: 'Player Hub', desc: 'Player stats hub' },
                { tab: 'profiling', icon: '🎯', name: 'Profiling', desc: 'Risk assessment' },
                { tab: 'psych', icon: '🧠', name: 'Psychological', desc: 'Playstyle analysis' },
                { tab: 'predictive', icon: '📈', name: 'Predictive', desc: 'Analytics' },
                { tab: 'playerActions', icon: '👢', name: 'Player Actions', desc: 'Warn/kick/ban' },
                { tab: 'clans', icon: '👥', name: 'Clans', desc: 'Clan management' },
                { tab: 'autoMod', icon: '🛡️', name: 'Auto-Mod', desc: 'Auto-moderation' },
                { tab: 'polls', icon: '🗳️', name: 'Polls', desc: 'Community polls' },
                { tab: 'trading', icon: '💰', name: 'Trading', desc: 'Trading floor' },
                { tab: 'defense', icon: '🛡️', name: 'Defense', desc: 'Base defense sim' },
                { tab: 'alliance', icon: '🤝', name: 'Alliance', desc: 'Alliance network' }
            ] },
            world: { name: "🌍 World Management", tools: [
                { tab: 'world', icon: '🌍', name: 'World', desc: 'World controls' },
                { tab: 'monuments', icon: '🏛️', name: 'Monuments', desc: 'Monument controls' },
                { tab: 'zones', icon: '🗺️', name: 'Zones', desc: 'Zone management' },
                { tab: 'zorp', icon: '🎮', name: 'ZORP', desc: 'ZORP zones' },
                { tab: 'entities', icon: '🚗', name: 'Entities', desc: 'Entity spawn' },
                { tab: 'spawn', icon: '🎯', name: 'Spawn', desc: 'Spawn items' },
                { tab: 'heatmap', icon: '🔥', name: 'Heatmap', desc: 'Activity heatmap' },
                { tab: 'map3d', icon: '🏔️', name: '3D Map', desc: '3D map view' },
                { tab: 'livemap', icon: '🗺️', name: 'Live Map', desc: 'Live player map' }
            ] },
            mechanics: { name: "⚙️ Game Mechanics", tools: [
                { tab: 'decay', icon: '⏳', name: 'Decay', desc: 'Decay settings' },
                { tab: 'modifiers', icon: '⚙️', name: 'Modifiers', desc: 'Item modifiers' },
                { tab: 'explosives', icon: '💣', name: 'Explosives', desc: 'Raid balancing' },
                { tab: 'traps', icon: '🪤', name: 'Traps', desc: 'Trap controls' },
                { tab: 'items', icon: '📦', name: 'Items', desc: 'Item database' },
                { tab: 'economy', icon: '💰', name: 'Economy', desc: 'Economy system' },
                { tab: 'raid', icon: '⚡', name: 'Raid Detector', desc: 'Raid detection' },
                { tab: 'animals', icon: '🐻', name: 'Animals', desc: 'Animal controls' },
                { tab: 'heli', icon: '🚁', name: 'Helicopter', desc: 'Heli controls' },
                { tab: 'underwater', icon: '🌊', name: 'Underwater', desc: 'Underwater' },
                { tab: 'halloween', icon: '🎃', name: 'Halloween', desc: 'Halloween event' }
            ] },
            integration: { name: "🔧 Integration & Settings", tools: [
                { tab: 'discord', icon: '🔗', name: 'Discord', desc: 'Discord sync' },
                { tab: 'voice', icon: '🎤', name: 'Voice', desc: 'Voice commands' },
                { tab: 'mobile', icon: '📱', name: 'Mobile', desc: 'Mobile sync' },
                { tab: 'settings', icon: '⚙️', name: 'Settings', desc: 'Dashboard prefs' },
                { tab: 'theme', icon: '🎨', name: 'Theme Studio', desc: 'Custom themes' },
                { tab: 'branding', icon: '🏷️', name: 'Branding', desc: 'Server branding' },
                { tab: 'profile', icon: '👤', name: 'Profile', desc: 'User profile' },
                { tab: 'idcard', icon: '🪪', name: 'ID Card', desc: 'ID card gen' },
                { tab: 'claims', icon: '📦', name: 'Claims', desc: 'Claim center' },
                { tab: 'combatlog', icon: '⚔️', name: 'Combat Log', desc: 'Combat log viewer' },
                { tab: 'audit', icon: '📋', name: 'Audit Log', desc: 'Admin log' },
                { tab: 'user-management', icon: '👥', name: 'User Management', desc: 'Manage users' }
            ] }
        };
    }

    renderCategories() {
        const container = document.getElementById('more-tools-categories');
        if (!container) return;
        const tools = this.getTools();
        let html = '';
        for (const [key, cat] of Object.entries(tools)) {
            html += `
                <div class="more-tools-category" data-category="${key}">
                    <div class="more-tools-category-header">
                        <span>${cat.name}</span>
                        <span class="category-toggle">▼</span>
                    </div>
                    <div class="more-tools-category-content">
                        ${cat.tools.map(tool => `
                            <div class="more-tools-item" data-tab="${tool.tab}">
                                <div class="item-icon">${tool.icon}</div>
                                <div class="item-name">${tool.name}</div>
                                <div class="item-desc" style="font-size:0.7rem; color:var(--text-secondary);">${tool.desc}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        container.innerHTML = html;
    }

    refresh() {
        this.renderCategories();
        toast.success('More tools refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.more = new More();
});