// sidebar-config.js – DRAINED TABLET ULTIMATE v7.0.0 (with permission filtering)

class SidebarManager {
    constructor() {
        this.allTabs = [
            { id: "home", name: "Home", icon: "🏠", requiredRole: "user", permission: "tab:home" },
            { id: "profile", name: "Profile", icon: "👤", requiredRole: "user", permission: "tab:profile" },
            { id: "drained-bases", name: "Drained Bases", icon: "🏕️", requiredRole: "user", permission: "tab:drained-bases" },
            { id: "shop", name: "Shop", icon: "🏪", requiredRole: "user", permission: "tab:shop" },
            { id: "claims", name: "Claims", icon: "📦", requiredRole: "user", permission: "tab:claims" },
            { id: "garage", name: "Motorpool", icon: "🏍️", requiredRole: "user", permission: "tab:garage" },
            { id: "horde", name: "Horde", icon: "🧟", requiredRole: "master", permission: "tab:horde" },
            { id: "combatlog", name: "Combat Log", icon: "⚔️", requiredRole: "user", permission: "tab:combatlog" },
            { id: "idcard", name: "ID Card", icon: "🪪", requiredRole: "user", permission: "tab:idcard" },
            { id: "resources", name: "Knowledge Base", icon: "📚", requiredRole: "master", permission: "tab:resources" },
            { id: "settings", name: "Settings", icon: "⚙️", requiredRole: "user", permission: "tab:settings" },
            { id: "more", name: "More Tools", icon: "📊", requiredRole: "user", permission: "tab:more" },
            { id: "players", name: "Players", icon: "👥", requiredRole: "master", permission: "tab:players" },
            { id: "master", name: "Master Control", icon: "👑", requiredRole: "user", permission: "tab:master-control" },
            { id: "economy", name: "Economy", icon: "💰", requiredRole: "user", permission: "tab:economy" },
            { id: "livemap", name: "Live Map", icon: "🗺️", requiredRole: "user", permission: "tab:livemap" },
            { id: "vehicles", name: "Vehicles", icon: "🚗", requiredRole: "user", permission: "tab:vehicles" },
            { id: "teleport", name: "Teleport", icon: "📍", requiredRole: "user", permission: "tab:teleport" },
            { id: "events", name: "Events", icon: "🎉", requiredRole: "user", permission: "tab:events" },
            { id: "items", name: "Items", icon: "📦", requiredRole: "user", permission: "tab:items" },
            { id: "kits", name: "Kits", icon: "🧰", requiredRole: "user", permission: "tab:kits" },
            { id: "world", name: "World", icon: "🌍", requiredRole: "user", permission: "tab:world" },
            { id: "backups", name: "Backups", icon: "💾", requiredRole: "user", permission: "tab:backups" },
            { id: "logs", name: "Logs", icon: "📜", requiredRole: "user", permission: "tab:logs" },
            { id: "console", name: "Console", icon: "🖥️", requiredRole: "user", permission: "tab:console" },
            { id: "gportal", name: "GPortal", icon: "🔌", requiredRole: "user", permission: "tab:gportal" },
            { id: "health", name: "Health", icon: "📡", requiredRole: "master", permission: "tab:health" },
            { id: "recovery", name: "Recovery", icon: "🔄", requiredRole: "user", permission: "tab:recovery" },
            { id: "performance", name: "Performance", icon: "📊", requiredRole: "user", permission: "tab:performance" },
            { id: "deepseek", name: "DeepSeek AI", icon: "🤖", requiredRole: "user", permission: "tab:deepseek" }
        ];
        this.defaultSelectedIds = ["home", "profile", "drained-bases", "more", "settings", "garage"];
        this.maxTabs = 6;
        this.selectedIds = [];
        this.access = window.accessControl;
        this.init();
    }

    init() {
        this.loadSelection();
        this.renderSidebar();
        this.addEventDelegation();
        window.addEventListener('tab-changed', () => this.highlightActiveTab());
    }

    loadSelection() {
        try {
            const username = AppState.user?.username || localStorage.getItem('tdl_username');
            const isMasterUser = username === 'CooseTheGeek';
            const saved = localStorage.getItem('tdl_selected_tabs');
            if (saved && isMasterUser) {
                const parsed = JSON.parse(saved);
                if (!parsed.includes('settings') || !parsed.includes('garage')) {
                    localStorage.removeItem('tdl_selected_tabs');
                    this.selectedIds = [...this.defaultSelectedIds];
                    this.saveSelection();
                    return;
                }
            }
            if (saved) {
                this.selectedIds = JSON.parse(saved);
                if (this.selectedIds.length > this.maxTabs) {
                    this.selectedIds = this.selectedIds.slice(0, this.maxTabs);
                    this.saveSelection();
                }
            } else {
                this.selectedIds = [...this.defaultSelectedIds];
                this.saveSelection();
            }
        } catch (e) {
            this.selectedIds = [...this.defaultSelectedIds];
            this.saveSelection();
        }
    }

    saveSelection() {
        localStorage.setItem('tdl_selected_tabs', JSON.stringify(this.selectedIds));
    }

    getAvailableTabs() {
        const username = AppState.user?.username || localStorage.getItem('tdl_username');
        const isMasterUser = username === 'CooseTheGeek';
        if (isMasterUser && AppState.user) {
            AppState.user.role = 'master';
            localStorage.setItem('tdl_role', 'master');
        }
        const role = AppState.user?.role || 'user';
        const effectiveRole = isMasterUser ? 'master' : role;
        const access = this.access;
        return this.allTabs.filter(tab => {
            // Role check
            if (effectiveRole === 'user' && tab.requiredRole !== 'user') return false;
            if (tab.requiredRole === 'master' && effectiveRole !== 'master' && effectiveRole !== 'owner') return false;
            if (tab.requiredRole === 'owner' && effectiveRole !== 'owner') return false;
            // Permission check (if access controller loaded)
            if (access && access.hasPermission && !access.hasPermission('tab', tab.id) && !isMasterUser) {
                return false;
            }
            return true;
        });
    }

    renderSidebar() {
        const container = document.getElementById('sidebar-nav-container');
        if (!container) return;
        let html = '';
        for (const id of this.selectedIds) {
            const tab = this.allTabs.find(t => t.id === id);
            if (tab && this.getAvailableTabs().find(t => t.id === id)) {
                html += `<a href="#" class="nav-item" data-tab="${tab.id}"><span class="nav-icon">${tab.icon}</span> <span class="nav-text">${tab.name}</span></a>`;
            }
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
                const tabId = item.dataset.tab;
                window.switchTab(tabId);
            }
        });
    }

    getSelectionUI() {
        const available = this.getAvailableTabs();
        let html = `<div class="sidebar-customizer"><h3>Select up to ${this.maxTabs} sidebar tabs</h3><div class="tab-selection-list">`;
        available.forEach(tab => {
            const isChecked = this.selectedIds.includes(tab.id);
            html += `<label class="tab-checkbox"><input type="checkbox" value="${tab.id}" ${isChecked ? 'checked' : ''} ${this.selectedIds.length >= this.maxTabs && !isChecked ? 'disabled' : ''}><span class="tab-icon">${tab.icon}</span> ${tab.name}</label>`;
        });
        html += '</div><button id="save-sidebar-tabs" class="settings-btn primary">Save Sidebar Tabs</button></div>';
        return html;
    }

    attachSettingsEvents() {
        const saveBtn = document.getElementById('save-sidebar-tabs');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const checkboxes = document.querySelectorAll('.tab-checkbox input:checked');
                const newIds = Array.from(checkboxes).map(cb => cb.value);
                if (newIds.length > this.maxTabs) {
                    toast.error(`You can only select up to ${this.maxTabs} tabs`);
                    return;
                }
                this.selectedIds = newIds;
                this.saveSelection();
                this.renderSidebar();
                toast.success('Sidebar updated');
                const allCbs = document.querySelectorAll('.tab-checkbox input');
                allCbs.forEach(cb => {
                    cb.disabled = this.selectedIds.length >= this.maxTabs && !cb.checked;
                });
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});