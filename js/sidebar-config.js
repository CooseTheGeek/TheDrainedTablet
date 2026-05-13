// sidebar-config.js – DRAINED TABLET ULTIMATE v7.0.0
// Customizable sidebar navigation with corrosion animation, card grid, Clear All, Reset, and Save.

class SidebarManager {
    constructor() {
        this.allTabs = [
            { id: "horde", name: "Horde", icon: "🧟", requiredRole: "user" },
            { id: "garage", name: "Motorpool", icon: "🏍️", requiredRole: "user" },
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
        this.defaultSelectedIds = ["home", "profile", "drained-bases", "garage", "settings", "more"];
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
            // No disabled attribute – we enforce limit on save only
            html += `
                <label class="tab-card ${isChecked ? 'checked' : ''}" data-tab-id="${tab.id}">
                    <input type="checkbox" value="${tab.id}" ${isChecked ? 'checked' : ''}>
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
        const clearBtn = document.getElementById('clear-sidebar-tabs');
        const saveBtn = document.getElementById('save-sidebar-tabs');
        const resetBtn = document.getElementById('reset-sidebar-tabs');
        
        // Helper to refresh the customizer UI after changes
        const refreshCustomizer = () => {
            const customizerDiv = document.querySelector('.sidebar-customizer');
            if (customizerDiv) {
                customizerDiv.innerHTML = this.getSelectionUI();
                this.attachSettingsEvents(); // re-bind buttons
            }
        };
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Clear all selected tabs? Your sidebar will become empty.')) {
                    this.selectedIds = [];
                    this.saveSelection();
                    this.renderSidebar();
                    refreshCustomizer();
                    toast.info('All tabs cleared. Use the checkboxes to select new tabs, then Save.');
                }
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                // Gather checked values from the current UI
                const checkboxes = document.querySelectorAll('.tab-card input:checked');
                const newIds = Array.from(checkboxes).map(cb => cb.value);
                if (newIds.length > this.maxTabs) {
                    toast.error(`You can only select up to ${this.maxTabs} tabs. Currently selected: ${newIds.length}`);
                    return;
                }
                this.selectedIds = newIds;
                this.saveSelection();
                this.renderSidebar();
                refreshCustomizer();
                toast.success('Sidebar updated');
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.selectedIds = [...this.defaultSelectedIds];
                this.saveSelection();
                this.renderSidebar();
                refreshCustomizer();
                toast.success('Sidebar tabs reset to default');
            });
        }
        
        // Also re-attach checkbox change events? Not needed because clicking label toggles checkbox naturally.
        // But we need to update the visual "checked" state and the counter when checkboxes are clicked.
        // We'll add a live counter update on checkbox click.
        const updateCounterFromCheckboxes = () => {
            const checkboxes = document.querySelectorAll('.tab-card input:checked');
            const count = checkboxes.length;
            const infoDiv = document.querySelector('.selection-info');
            if (infoDiv) {
                const remaining = this.maxTabs - count;
                infoDiv.innerHTML = `
                    <span class="selected-count">${count}</span> / <span class="max-count">${this.maxTabs}</span> tabs selected
                    ${remaining > 0 ? `<span class="remaining"> (${remaining} remaining)</span>` : '<span class="full"> (max reached)</span>'}
                `;
            }
            // Update visual card styles
            document.querySelectorAll('.tab-card').forEach(card => {
                const cb = card.querySelector('input');
                if (cb.checked) {
                    card.classList.add('checked');
                    card.querySelector('.tab-card-check').innerText = '✓';
                } else {
                    card.classList.remove('checked');
                    card.querySelector('.tab-card-check').innerText = '';
                }
            });
        };
        
        // Attach change event to all checkboxes (they may be recreated, so use delegation)
        const grid = document.querySelector('.tab-selection-grid');
        if (grid) {
            grid.addEventListener('change', (e) => {
                if (e.target && e.target.type === 'checkbox') {
                    updateCounterFromCheckboxes();
                }
            });
        }
        
        // Initial counter update
        updateCounterFromCheckboxes();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});