// sidebar-config.js – DRAINED TABLET ULTIMATE v7.0.0
// Manages top horizontal tabs: user selects up to 4 tabs, Settings is always the 5th.

class SidebarManager {
    constructor() {
        this.allTabs = [
            { id: "home", name: "Home", icon: "🏠", requiredRole: "user" },
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
            { id: "profile", name: "Profile", icon: "👤", requiredRole: "user" },
            { id: "resources", name: "Knowledge Base", icon: "📚", requiredRole: "master" },
            { id: "shop", name: "Shop", icon: "🏪", requiredRole: "user" },
            { id: "more", name: "More Tools", icon: "📊", requiredRole: "master" },
            { id: "settings", name: "Settings", icon: "⚙️", requiredRole: "master" }
        ];
        this.maxUserTabs = 4;   // user can select up to 4, Settings is fixed as 5th
        this.selectedIds = [];
        this.access = window.accessControl;
        this.init();
    }

    init() {
        this.loadSelection();
        this.renderTopTabs();
        this.attachSettingsEvents();
        window.addEventListener('tab-changed', () => this.highlightActiveTab());
        window.addEventListener('user-role-changed', () => this.renderTopTabs());
    }

    loadSelection() {
        const saved = localStorage.getItem('tdl_selected_tabs');
        if (saved) {
            this.selectedIds = JSON.parse(saved);
            if (this.selectedIds.length > this.maxUserTabs) {
                this.selectedIds = this.selectedIds.slice(0, this.maxUserTabs);
                this.saveSelection();
            }
        } else {
            // Default: home, players, livemap, items
            this.selectedIds = ["home", "players", "livemap", "items"];
            this.saveSelection();
        }
    }

    saveSelection() {
        localStorage.setItem('tdl_selected_tabs', JSON.stringify(this.selectedIds));
    }

    getAvailableTabs() {
        const role = AppState.user?.role || 'user';
        return this.allTabs.filter(tab => {
            if (tab.id === 'settings') return false; // settings handled separately
            if (tab.requiredRole === 'user') return true;
            if (tab.requiredRole === 'master') return this.access.hasRole('master');
            if (tab.requiredRole === 'owner') return this.access.hasRole('owner');
            return false;
        });
    }

    renderTopTabs() {
        const container = document.getElementById('top-tab-bar');
        if (!container) return;

        let html = '';
        // Add user-selected tabs
        for (const id of this.selectedIds) {
            const tab = this.allTabs.find(t => t.id === id);
            if (tab && (tab.requiredRole === 'user' || this.access.hasRole(tab.requiredRole))) {
                html += `<button class="tab-btn" data-tab="${tab.id}">${tab.icon} ${tab.name}</button>`;
            }
        }
        // Always add Settings if user has master role (or if CooseTheGeek)
        if (this.access.hasRole('master') || (AppState.user?.username === 'CooseTheGeek')) {
            html += `<button class="tab-btn" data-tab="settings">⚙️ Settings</button>`;
        }
        // Ensure Master Control is shown for CooseTheGeek (override)
        if (AppState.user?.username === 'CooseTheGeek' && !this.selectedIds.includes('master')) {
            // Prepend master control as first tab
            html = `<button class="tab-btn" data-tab="master">👑 Master Control</button>` + html;
        }
        container.innerHTML = html;

        this.highlightActiveTab();
    }

    highlightActiveTab() {
        const activeTabId = document.querySelector('.tab-pane.active')?.id?.replace('tab-', '');
        if (!activeTabId) return;
        document.querySelectorAll('.tab-btn').forEach(btn => {
            if (btn.dataset.tab === activeTabId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    getSelectionUI() {
        const available = this.getAvailableTabs();
        let html = `<div class="sidebar-customizer"><h3>Select up to ${this.maxUserTabs} tabs for the top bar (Settings is always added)</h3>`;
        html += '<div class="tab-selection-list" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(180px,1fr)); gap:0.8rem;">';
        available.forEach(tab => {
            const isChecked = this.selectedIds.includes(tab.id);
            html += `
                <label class="tab-checkbox" style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                    <input type="checkbox" value="${tab.id}" ${isChecked ? 'checked' : ''} ${this.selectedIds.length >= this.maxUserTabs && !isChecked ? 'disabled' : ''}>
                    <span class="tab-icon">${tab.icon}</span> ${tab.name}
                </label>
            `;
        });
        html += '</div><button id="save-sidebar-tabs" class="settings-btn primary" style="margin-top:1rem;">Save Top Tabs</button></div>';
        return html;
    }

    attachSettingsEvents() {
        const saveBtn = document.getElementById('save-sidebar-tabs');
        if (saveBtn) {
            // Remove old listener to avoid duplicates
            const newBtn = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(newBtn, saveBtn);
            newBtn.addEventListener('click', () => {
                const checkboxes = document.querySelectorAll('.tab-checkbox input:checked');
                const newIds = Array.from(checkboxes).map(cb => cb.value);
                if (newIds.length > this.maxUserTabs) {
                    toast.error(`You can only select up to ${this.maxUserTabs} tabs`);
                    return;
                }
                this.selectedIds = newIds;
                this.saveSelection();
                this.renderTopTabs();
                toast.success('Top tabs updated');
                // Update disabled states
                const allCbs = document.querySelectorAll('.tab-checkbox input');
                allCbs.forEach(cb => {
                    cb.disabled = this.selectedIds.length >= this.maxUserTabs && !cb.checked;
                });
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});