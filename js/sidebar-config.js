// sidebar-config.js – DRAINED TABLET ULTIMATE v7.0.0
// Manages customizable sidebar navigation. For regular users, only player tabs appear.

class SidebarManager {
    constructor() {
        // All possible tabs with required role
        this.allTabs = [
            { id: "home", name: "Home", icon: "🏠", requiredRole: "user" },
            // Player tabs (visible to everyone)
            { id: "profile", name: "Profile", icon: "👤", requiredRole: "user" },
            { id: "drained-bases", name: "Drained Bases", icon: "🏕️", requiredRole: "user" },
            { id: "shop", name: "Shop", icon: "🏪", requiredRole: "user" },
            { id: "claims", name: "Claims", icon: "📦", requiredRole: "user" },
            { id: "combatlog", name: "Combat Log", icon: "⚔️", requiredRole: "user" },
            { id: "idcard", name: "ID Card", icon: "🪪", requiredRole: "user" },
            { id: "resources", name: "Knowledge Base", icon: "📚", requiredRole: "user" },
            { id: "more", name: "More Tools", icon: "📊", requiredRole: "user" }, // Only master sees More Tools
            // Admin/master tabs (hidden for regular users)
            { id: "players", name: "Players", icon: "👥", requiredRole: "master" },
            { id: "master", name: "Master Control", icon: "👑", requiredRole: "master" },
            { id: "economy", name: "Economy", icon: "💰", requiredRole: "master" },
            { id: "livemap", name: "Live Map", icon: "🗺️", requiredRole: "master" },
            { id: "vehicles", name: "Vehicles", icon: "🚗", requiredRole: "master" },
            { id: "teleport", name: "Teleport", icon: "📍", requiredRole: "master" },
            { id: "events", name: "Events", icon: "🎉", requiredRole: "master" },
            { id: "items", name: "Items", icon: "📦", requiredRole: "master" },
            { id: "kits", name: "Kits", icon: "🧰", requiredRole: "master" },
            { id: "world", name: "World", icon: "🌍", requiredRole: "master" },
            { id: "backups", name: "Backups", icon: "💾", requiredRole: "owner" },
            { id: "logs", name: "Logs", icon: "📜", requiredRole: "master" },
            { id: "console", name: "Console", icon: "🖥️", requiredRole: "master" },
            { id: "gportal", name: "GPortal", icon: "🔌", requiredRole: "owner" },
            { id: "health", name: "Health", icon: "📡", requiredRole: "master" },
            { id: "recovery", name: "Recovery", icon: "🔄", requiredRole: "owner" },
            { id: "performance", name: "Performance", icon: "📊", requiredRole: "master" },
            { id: "deepseek", name: "DeepSeek AI", icon: "🤖", requiredRole: "master" },
            { id: "settings", name: "Settings", icon: "⚙️", requiredRole: "user" }
        ];
        this.defaultSelectedIds = ["home", "profile", "drained-bases", "settings", "more"];
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
        const saved = localStorage.getItem('tdl_selected_tabs');
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
    }

    saveSelection() {
        localStorage.setItem('tdl_selected_tabs', JSON.stringify(this.selectedIds));
    }

    getAvailableTabs() {
        const role = AppState.user?.role || 'user';
        // For regular users (role 'user'), only show tabs with requiredRole 'user'
        // For master/owner, show all tabs they have permission for
        return this.allTabs.filter(tab => {
            if (role === 'user') {
                return tab.requiredRole === 'user';
            }
            if (tab.requiredRole === 'user') return true;
            if (tab.requiredRole === 'master') return role === 'master' || role === 'owner';
            if (tab.requiredRole === 'owner') return role === 'owner';
            return false;
        });
    }

    renderSidebar() {
        const container = document.getElementById('sidebar-nav-container');
        if (!container) return;

        let html = '';
        for (const id of this.selectedIds) {
            const tab = this.allTabs.find(t => t.id === id);
            // Only show if tab is available for current role
            if (tab && this.getAvailableTabs().find(t => t.id === id)) {
                html += `<a href="#" class="nav-item" data-tab="${tab.id}"><span class="nav-icon">${tab.icon}</span> <span class="nav-text">${tab.name}</span></a>`;
            }
        }
        // Settings only shown for master/owner
        if (this.getAvailableTabs().find(t => t.id === 'settings')) {
            html += `<a href="#" class="nav-item" data-tab="settings"><span class="nav-icon">⚙️</span> <span class="nav-text">Settings</span></a>`;
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
        const filtered = available.filter(t => t.id !== 'settings');
        let html = `<div class="sidebar-customizer"><h3>Select up to ${this.maxTabs} sidebar tabs</h3>`;
        html += '<div class="tab-selection-list">';
        filtered.forEach(tab => {
            const isChecked = this.selectedIds.includes(tab.id);
            html += `
                <label class="tab-checkbox">
                    <input type="checkbox" value="${tab.id}" ${isChecked ? 'checked' : ''} ${this.selectedIds.length >= this.maxTabs && !isChecked ? 'disabled' : ''}>
                    <span class="tab-icon">${tab.icon}</span> ${tab.name}
                </label>
            `;
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