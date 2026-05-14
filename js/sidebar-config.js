// sidebar-config.js – DRAINED TABLET v7.0.0 (User/Mode sidebar)

class SidebarManager {
    constructor() {
        // User tabs (shown when UI mode = 'user')
        this.userTabs = [
            { id: "home", name: "Home", icon: "🏠", requiredRole: "user" },
            { id: "profile", name: "Profile", icon: "👤", requiredRole: "user" },
            { id: "drained-bases", name: "Drained Bases", icon: "🏕️", requiredRole: "user" },
            { id: "shop", name: "Shop", icon: "🏪", requiredRole: "user" },
            { id: "claims", name: "Claims", icon: "📦", requiredRole: "user" },
            { id: "garage", name: "Motorpool", icon: "🏍️", requiredRole: "user" },
            { id: "combatlog", name: "Combat Log", icon: "⚔️", requiredRole: "user" },
            { id: "defense", name: "Base Defense", icon: "🛡️", requiredRole: "user" },
            { id: "clans", name: "Clans", icon: "👥", requiredRole: "user" },
            { id: "polls", name: "Polls", icon: "🗳️", requiredRole: "user" },
            { id: "trading", name: "Trading Floor", icon: "💰", requiredRole: "user" },
            { id: "raid", name: "Raid Detector", icon: "🎮", requiredRole: "user" },
            { id: "playerHub", name: "Player Stats", icon: "📈", requiredRole: "user" },
            { id: "livemap", name: "Live Map", icon: "🗺️", requiredRole: "user" },
            { id: "resources", name: "Knowledge Base", icon: "📚", requiredRole: "user" },
            { id: "more", name: "More Tools", icon: "🔧", requiredRole: "user" },
            { id: "settings", name: "Settings", icon: "⚙️", requiredRole: "user" }
        ];

        // Full admin tabs (original 90+ tabs)
        this.adminTabs = [
            { id: "home", name: "Home", icon: "🏠", requiredRole: "user" },
            { id: "players", name: "Players", icon: "👥", requiredRole: "master" },
            { id: "master", name: "Master Control", icon: "👑", requiredRole: "master" },
            { id: "horde", name: "Horde", icon: "🧟", requiredRole: "master" },
            { id: "garage", name: "Motorpool", icon: "🏍️", requiredRole: "user" },
            { id: "economy", name: "Economy", icon: "💰", requiredRole: "master" },
            { id: "livemap", name: "Live Map", icon: "🗺️", requiredRole: "user" },
            { id: "teleport", name: "Teleport", icon: "📍", requiredRole: "master" },
            { id: "events", name: "Events", icon: "🎉", requiredRole: "master" },
            { id: "items", name: "Items", icon: "📦", requiredRole: "master" },
            { id: "kits", name: "Kits", icon: "🧰", requiredRole: "master" },
            { id: "world", name: "World", icon: "🌍", requiredRole: "master" },
            { id: "backups", name: "Backups", icon: "💾", requiredRole: "master" },
            { id: "logs", name: "Logs", icon: "📜", requiredRole: "master" },
            { id: "console", name: "Console", icon: "🖥️", requiredRole: "master" },
            { id: "gportal", name: "GPortal", icon: "🔌", requiredRole: "master" },
            { id: "health", name: "Health", icon: "📡", requiredRole: "master" },
            { id: "recovery", name: "Recovery", icon: "🔄", requiredRole: "master" },
            { id: "performance", name: "Performance", icon: "📊", requiredRole: "master" },
            { id: "deepseek", name: "DeepSeek AI", icon: "🤖", requiredRole: "master" },
            { id: "profile", name: "Profile", icon: "👤", requiredRole: "user" },
            { id: "settings", name: "Settings", icon: "⚙️", requiredRole: "user" },
            { id: "more", name: "More Tools", icon: "🔧", requiredRole: "user" },
            { id: "resources", name: "Knowledge Base", icon: "📚", requiredRole: "user" },
            { id: "drained-bases", name: "Drained Bases", icon: "🏕️", requiredRole: "user" },
            { id: "animals", name: "Animals", icon: "🐻", requiredRole: "master" },
            { id: "autoMod", name: "Auto‑Mod", icon: "🛡️", requiredRole: "master" },
            { id: "defense", name: "Base Defense", icon: "🛡️", requiredRole: "user" },
            { id: "clans", name: "Clans", icon: "👥", requiredRole: "user" },
            { id: "claims", name: "Claims", icon: "📦", requiredRole: "user" },
            { id: "polls", name: "Polls", icon: "🗳️", requiredRole: "user" },
            { id: "zones", name: "Zones", icon: "🗺️", requiredRole: "master" },
            { id: "zorp", name: "ZORP Zones", icon: "🎮", requiredRole: "master" },
            { id: "combatlog", name: "Combat Log", icon: "⚔️", requiredRole: "user" },
            { id: "idcard", name: "ID Card", icon: "🪪", requiredRole: "user" },
            { id: "audit", name: "Audit Log", icon: "📋", requiredRole: "master" },
            { id: "orchestrator", name: "Event Orchestrator", icon: "🎭", requiredRole: "master" },
            { id: "discord", name: "Discord Sync", icon: "🔗", requiredRole: "master" },
            { id: "voice", name: "Voice Commands", icon: "🎤", requiredRole: "user" },
            { id: "trading", name: "Trading Floor", icon: "💰", requiredRole: "user" },
            { id: "raid", name: "Raid Detector", icon: "⚡", requiredRole: "user" },
            { id: "map3d", name: "3D Map", icon: "🏔️", requiredRole: "user" },
            { id: "drainedAI", name: "Drained AI", icon: "🤖", requiredRole: "master" },
            { id: "inventoryViewer", name: "Inventory Viewer", icon: "👁️", requiredRole: "master" },
            { id: "psych", name: "Psychological", icon: "🧠", requiredRole: "master" },
            { id: "predictive", name: "Predictive", icon: "📈", requiredRole: "master" },
            { id: "profiling", name: "Profiling", icon: "🎯", requiredRole: "master" },
            { id: "playerHub", name: "Player Hub", icon: "📊", requiredRole: "user" },
            { id: "playerActions", name: "Player Actions", icon: "👢", requiredRole: "master" },
            { id: "modifiers", name: "Modifiers", icon: "⚙️", requiredRole: "master" },
            { id: "entities", name: "Entities", icon: "🚗", requiredRole: "master" },
            { id: "spawn", name: "Spawn", icon: "🎯", requiredRole: "master" },
            { id: "kitVending", name: "Kit Vending", icon: "🏪", requiredRole: "master" },
            { id: "heli", name: "Helicopter", icon: "🚁", requiredRole: "master" },
            { id: "explosives", name: "Explosives", icon: "💣", requiredRole: "user" },
            { id: "traps", name: "Traps", icon: "🪤", requiredRole: "master" },
            { id: "underwater", name: "Underwater", icon: "🌊", requiredRole: "master" },
            { id: "halloween", name: "Halloween", icon: "🎃", requiredRole: "master" },
            { id: "decay", name: "Decay", icon: "⏳", requiredRole: "master" },
            { id: "scheduler", name: "Scheduler", icon: "📅", requiredRole: "master" },
            { id: "monuments", name: "Monuments", icon: "🏛️", requiredRole: "master" },
            { id: "global", name: "Global", icon: "🌍", requiredRole: "master" },
            { id: "status", name: "Status", icon: "📊", requiredRole: "user" },
            { id: "mobile", name: "Mobile Sync", icon: "📱", requiredRole: "master" },
            { id: "heatmap", name: "Heatmap", icon: "🔥", requiredRole: "user" },
            { id: "alliance", name: "Alliance", icon: "🤝", requiredRole: "user" },
            { id: "shop", name: "Shop", icon: "🏪", requiredRole: "user" },
            { id: "theme", name: "Theme Studio", icon: "🎨", requiredRole: "user" },
            { id: "branding", name: "Branding", icon: "🏷️", requiredRole: "master" },
            { id: "serverConnect", name: "Server Connect", icon: "🔌", requiredRole: "master" }
        ];

        this.selectedIds = [];
        this.maxTabs = 12;
        this.access = window.accessControl;
        this.init();
    }

    getCurrentTabs() {
        const mode = this.access.getUIMode();
        if (mode === 'user') {
            return this.userTabs;
        } else {
            return this.adminTabs;
        }
    }

    renderSidebar() {
        const container = document.getElementById('sidebar-nav-container');
        if (!container) return;
        const tabs = this.getCurrentTabs();
        let html = '';
        for (const tab of tabs) {
            html += `<a href="#" class="nav-item" data-tab="${tab.id}"><span class="nav-icon">${tab.icon}</span> <span class="nav-text">${tab.name}</span></a>`;
        }
        container.innerHTML = html;
        this.highlightActiveTab();
    }

    highlightActiveTab() {
        const activeTabId = document.querySelector('.tab-pane.active')?.id?.replace('tab-', '');
        if (!activeTabId) return;
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.dataset.tab === activeTabId) item.classList.add('active');
            else item.classList.remove('active');
        });
    }

    addEventDelegation() {
        const container = document.getElementById('sidebar-nav-container');
        if (!container) return;
        container.addEventListener('click', (e) => {
            const item = e.target.closest('.nav-item');
            if (item && item.dataset.tab) {
                e.preventDefault();
                window.switchTab(item.dataset.tab);
            }
        });
    }

    init() {
        this.renderSidebar();
        this.addEventDelegation();
        window.addEventListener('tab-changed', () => this.highlightActiveTab());
        window.addEventListener('mode-changed', () => this.renderSidebar());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});