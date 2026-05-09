// sidebar-config.js – DRAINED TABLET ULTIMATE v7.0.0
// Customizable sidebar navigation with corrosion dissolve animation, cleaned selection UI, and Clear All option.

class SidebarManager {
    constructor() {
        this.allTabs = [
            { id: "home", name: "Home", icon: "🏠", requiredRole: "user" },
            { id: "profile", name: "Profile", icon: "👤", requiredRole: "user" },
            { id: "drained-bases", name: "Drained Bases", icon: "🏕️", requiredRole: "user" },
            { id: "shop", name: "Shop", icon: "🏪", requiredRole: "user" },
            { id: "claims", name: "Claims", icon: "📦", requiredRole: "user" },
            { id: "combatlog", name: "Combat Log", icon: "⚔️", requiredRole: "user" },
            { id: "idcard", name: "ID Card", icon: "🪪", requiredRole: "user" },
            { id: "resources", name: "Knowledge Base", icon: "📚", requiredRole: "user" },
            { id: "settings", name: "Settings", icon: "⚙️", requiredRole: "master" },
            { id: "more", name: "More Tools", icon: "📊", requiredRole: "master" },
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
            { id: "backups", name: "Backups", icon: "💾", requiredRole: "master" },
            { id: "logs", name: "Logs", icon: "📜", requiredRole: "master" },
            { id: "console", name: "Console", icon: "🖥️", requiredRole: "master" },
            { id: "gportal", name: "GPortal", icon: "🔌", requiredRole: "master" },
            { id: "health", name: "Health", icon: "📡", requiredRole: "master" },
            { id: "recovery", name: "Recovery", icon: "🔄", requiredRole: "master" },
            { id: "performance", name: "Performance", icon: "📊", requiredRole: "master" },
            { id: "deepseek", name: "DeepSeek AI", icon: "🤖", requiredRole: "master" }
        ];
        this.defaultSelectedIds = ["home", "profile", "drained-bases", "shop", "settings", "more"];
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
                if (!parsed.includes('settings') || !parsed.includes('more')) {
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
            console.warn('Error loading sidebar selection, using defaults', e);
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
        return this.allTabs.filter(tab => {
            if (effectiveRole === 'user') return tab.requiredRole === 'user';
            if (tab.requiredRole === 'user') return true;
            if (tab.requiredRole === 'master') return effectiveRole === 'master' || effectiveRole === 'owner';
            if (tab.requiredRole === 'owner') return effectiveRole === 'owner';
            return false;
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
                item.classList.add('click-animation');
                setTimeout(() => item.classList.remove('click-animation'), 350);
                const tabId = item.dataset.tab;
                window.switchTab(tabId);
            }
        });
    }

    getSelectionUI() {
        const available = this.getAvailableTabs();
        const selectedCount = this.selectedIds.length;
        const remaining = this.maxTabs - selectedCount;
        
        let html = `
            <div class="sidebar-customizer">
                <div class="customizer-header">
                    <h3>📑 Customize Sidebar Tabs</h3>
                    <div class="selection-info">
                        <span class="selected-count">${selectedCount}</span> / <span class="max-count">${this.maxTabs}</span> tabs selected
                        ${remaining > 0 ? `<span class="remaining"> (${remaining} remaining)</span>` : '<span class="full"> (max reached)</span>'}
                    </div>
                </div>
                <div class="tab-selection-grid">
        `;
        
        available.forEach(tab => {
            const isChecked = this.selectedIds.includes(tab.id);
            const disabled = this.selectedIds.length >= this.maxTabs && !isChecked;
            html += `
                <label class="tab-card ${isChecked ? 'checked' : ''} ${disabled ? 'disabled' : ''}" data-tab="${tab.id}">
                    <input type="checkbox" value="${tab.id}" ${isChecked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
                    <div class="tab-card-icon">${tab.icon}</div>
                    <div class="tab-card-name">${tab.name}</div>
                    <div class="tab-card-check">${isChecked ? '✓' : ''}</div>
                </label>
            `;
        });
        
        html += `
                </div>
                <div class="customizer-actions">
                    <button id="clear-sidebar-tabs" class="settings-btn warning">🗑️ Clear All</button>
                    <button id="save-sidebar-tabs" class="settings-btn primary">💾 Save Sidebar Tabs</button>
                    <button id="reset-sidebar-tabs" class="settings-btn">↺ Reset to Default</button>
                </div>
            </div>
        `;
        return html;
    }

    attachSettingsEvents() {
        const saveBtn = document.getElementById('save-sidebar-tabs');
        const resetBtn = document.getElementById('reset-sidebar-tabs');
        const clearBtn = document.getElementById('clear-sidebar-tabs');
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all selected tabs? The sidebar will become empty until you select new tabs.')) {
                    this.selectedIds = [];
                    this.saveSelection();
                    this.renderSidebar();
                    // Refresh the UI in Settings tab
                    const customizerDiv = document.querySelector('.sidebar-customizer');
                    if (customizerDiv) {
                        customizerDiv.innerHTML = this.getSelectionUI();
                        this.attachSettingsEvents();
                    }
                    toast.info('All tabs cleared. Select tabs and save to restore.');
                }
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const checkboxes = document.querySelectorAll('.tab-card input:checked');
                const newIds = Array.from(checkboxes).map(cb => cb.value);
                if (newIds.length > this.maxTabs) {
                    toast.error(`You can only select up to ${this.maxTabs} tabs`);
                    return;
                }
                this.selectedIds = newIds;
                this.saveSelection();
                this.renderSidebar();
                // Refresh the UI in Settings tab
                const customizerDiv = document.querySelector('.sidebar-customizer');
                if (customizerDiv) {
                    customizerDiv.innerHTML = this.getSelectionUI();
                    this.attachSettingsEvents();
                }
                toast.success('Sidebar updated');
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSidebarTabs());
        }
    }

    resetSidebarTabs() {
        this.selectedIds = [...this.defaultSelectedIds];
        this.saveSelection();
        this.renderSidebar();
        const settingsTab = document.getElementById('tab-settings');
        if (settingsTab && settingsTab.classList.contains('active')) {
            const customizerDiv = document.querySelector('.sidebar-customizer');
            if (customizerDiv) {
                customizerDiv.innerHTML = this.getSelectionUI();
                this.attachSettingsEvents();
            }
        }
        toast.success('Sidebar tabs reset to default');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});