// sidebar-config.js – DRAINED TABLET v7.0.0 (Avatar above, 6‑pack tabs)

class SidebarManager {
    constructor() {
        // All user-available tabs (for selection)
        this.userAvailableTabs = [
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

        // Full admin tabs (original all)
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

        this.userSelectedIds = [];
        this.maxUserTabs = 6;
        this.access = window.accessControl;
        this.init();
    }

    init() {
        this.loadUserSelection();
        this.renderSidebar();
        this.addEventDelegation();
        window.addEventListener('tab-changed', () => this.highlightActiveTab());
        window.addEventListener('mode-changed', () => this.renderSidebar());
        window.addEventListener('profile-updated', () => this.updateSidebarUserInfo());
        this.updateSidebarUserInfo();
    }

    loadUserSelection() {
        const saved = localStorage.getItem('tdl_user_selected_tabs');
        if (saved) {
            this.userSelectedIds = JSON.parse(saved);
            if (this.userSelectedIds.length !== this.maxUserTabs) {
                this.userSelectedIds = ["home", "profile", "drained-bases", "shop", "garage", "claims"];
                this.saveUserSelection();
            }
        } else {
            this.userSelectedIds = ["home", "profile", "drained-bases", "shop", "garage", "claims"];
            this.saveUserSelection();
        }
    }

    saveUserSelection() {
        localStorage.setItem('tdl_user_selected_tabs', JSON.stringify(this.userSelectedIds));
    }

    getCurrentTabs() {
        const mode = this.access.getUIMode();
        if (mode === 'user') {
            return this.userAvailableTabs.filter(tab => this.userSelectedIds.includes(tab.id));
        } else {
            return this.adminTabs;
        }
    }

    renderSidebar() {
        const container = document.getElementById('sidebar-tabs-container');
        if (!container) return;
        const tabs = this.getCurrentTabs();
        let html = '';
        for (const tab of tabs) {
            html += `
                <div class="sidebar-tab" data-tab="${tab.id}">
                    <div class="sidebar-tab-icon">${tab.icon}</div>
                    <div class="sidebar-tab-name">${tab.name}</div>
                </div>
            `;
        }
        container.innerHTML = html;
        this.highlightActiveTab();
        this.updateSidebarUserInfo();
    }

    updateSidebarUserInfo() {
        const avatarImg = document.getElementById('sidebar-avatar')?.querySelector('img');
        const usernameSpan = document.getElementById('sidebar-username');
        const roleSpan = document.getElementById('sidebar-role');
        if (avatarImg) {
            const storedAvatar = localStorage.getItem('tdl_avatar');
            if (storedAvatar && storedAvatar !== 'null') {
                avatarImg.src = storedAvatar;
            } else {
                avatarImg.src = window.DEFAULT_AVATAR || "data:image/svg+xml,%3Csvg xmlns='http%3A//www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='40' r='25' fill='%23333' stroke='%23D4AF37' stroke-width='3'/%3E%3Crect x='30' y='65' width='40' height='30' fill='%23333' stroke='%23D4AF37' stroke-width='3'/%3E%3C/svg%3E";
            }
        }
        if (usernameSpan) {
            usernameSpan.innerText = AppState.user?.username || localStorage.getItem('tdl_username') || 'Survivor';
        }
        if (roleSpan) {
            roleSpan.innerText = (AppState.user?.role || localStorage.getItem('tdl_role') || 'user').toUpperCase();
        }
    }

    highlightActiveTab() {
        const activeTabId = document.querySelector('.tab-pane.active')?.id?.replace('tab-', '');
        if (!activeTabId) return;
        document.querySelectorAll('.sidebar-tab').forEach(item => {
            if (item.dataset.tab === activeTabId) item.classList.add('active');
            else item.classList.remove('active');
        });
    }

    addEventDelegation() {
        const container = document.getElementById('sidebar-tabs-container');
        if (!container) return;
        container.addEventListener('click', (e) => {
            const tab = e.target.closest('.sidebar-tab');
            if (tab && tab.dataset.tab) {
                e.preventDefault();
                window.switchTab(tab.dataset.tab);
            }
        });
    }

    getSelectionUI() {
        let html = `
            <div class="sidebar-customizer">
                <h3>Customize Your Sidebar (User Mode)</h3>
                <p>Select exactly ${this.maxUserTabs} tabs to appear in the sidebar when in User Mode.</p>
                <div class="tab-selection-list" id="user-tab-selection-list">
        `;
        for (const tab of this.userAvailableTabs) {
            const isChecked = this.userSelectedIds.includes(tab.id);
            const disabled = this.userSelectedIds.length >= this.maxUserTabs && !isChecked;
            html += `
                <label class="tab-checkbox" style="display: inline-block; margin: 0.5rem; padding: 0.5rem; background: var(--bg-tertiary); border-radius: 8px;">
                    <input type="checkbox" value="${tab.id}" ${isChecked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
                    <span class="tab-icon">${tab.icon}</span> ${tab.name}
                </label>
            `;
        }
        html += `
                </div>
                <button id="save-user-sidebar-tabs" class="settings-btn primary">Save Sidebar Tabs</button>
            </div>
        `;
        return html;
    }

    attachSettingsEvents() {
        const saveBtn = document.getElementById('save-user-sidebar-tabs');
        if (!saveBtn) return;
        saveBtn.addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('#user-tab-selection-list input:checked');
            const newIds = Array.from(checkboxes).map(cb => cb.value);
            if (newIds.length !== this.maxUserTabs) {
                toast.error(`You must select exactly ${this.maxUserTabs} tabs`);
                return;
            }
            this.userSelectedIds = newIds;
            this.saveUserSelection();
            this.renderSidebar();
            toast.success('Sidebar updated');
            if (window.settings && window.settings.renderSidebarCustomizer) {
                window.settings.renderSidebarCustomizer();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});