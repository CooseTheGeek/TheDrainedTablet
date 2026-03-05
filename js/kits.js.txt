// KITS MANAGER - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class KitManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.kits = this.loadKits();
        this.categories = ['All', 'Starter', 'VIP', 'Admin', 'Event', 'PvP', 'Raid', 'Building'];
        this.groups = ['User', 'VIP', 'Moderator', 'Admin', 'Owner'];
        this.init();
    }

    loadKits() {
        const saved = localStorage.getItem('drained_kits');
        if (saved) return JSON.parse(saved);
        
        // Default kits
        return [
            {
                id: 'kit_starter',
                name: 'Starter Kit',
                description: 'Basic gear for new players',
                icon: '📦',
                category: 'Starter',
                cooldown: 300,
                maxUses: 0,
                autoGrant: true,
                hidden: false,
                groups: ['User'],
                items: [
                    { shortname: 'rock', amount: 1, container: 'belt' },
                    { shortname: 'torch', amount: 1, container: 'belt' },
                    { shortname: 'bandage', amount: 3, container: 'main' },
                    { shortname: 'apple', amount: 2, container: 'main' }
                ],
                created: new Date().toISOString()
            },
            {
                id: 'kit_vip',
                name: 'VIP Kit',
                description: 'Exclusive gear for VIP members',
                icon: '👑',
                category: 'VIP',
                cooldown: 600,
                maxUses: 1,
                autoGrant: true,
                hidden: false,
                groups: ['VIP'],
                items: [
                    { shortname: 'rifle.ak', amount: 1, container: 'belt' },
                    { shortname: 'ammo.rifle', amount: 64, container: 'main' },
                    { shortname: 'metal.facemask', amount: 1, container: 'wear' },
                    { shortname: 'metal.plate.torso', amount: 1, container: 'wear' },
                    { shortname: 'syringe.medical', amount: 5, container: 'main' }
                ],
                created: new Date().toISOString()
            }
        ];
    }

    saveKits() {
        localStorage.setItem('drained_kits', JSON.stringify(this.kits));
    }

    init() {
        this.createKitsHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'kits') {
                this.refresh();
            }
        });
    }

    createKitsHTML() {
        const kitsTab = document.getElementById('tab-kits');
        if (!kitsTab) return;

        kitsTab.innerHTML = `
            <div class="kits-container">
                <div class="kits-header">
                    <h2>🧰 KIT MANAGER</h2>
                    <div class="kits-controls">
                        <button id="create-kit" class="kit-btn primary">+ NEW KIT</button>
                        <button id="refresh-kits" class="kit-btn">🔄 REFRESH</button>
                    </div>
                </div>

                <div class="kits-toolbar">
                    <div class="filter-group">
                        <label>Category:</label>
                        <select id="kit-category-filter">
                            ${this.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Search:</label>
                        <input type="text" id="kit-search" placeholder="Search kits...">
                    </div>
                    <div class="filter-group">
                        <label>Show Hidden:</label>
                        <input type="checkbox" id="show-hidden">
                    </div>
                </div>

                <div class="kits-grid" id="kits-grid"></div>

                <!-- Kit Editor Modal -->
                <div id="kit-modal" class="modal hidden">
                    <div class="modal-content kit-modal">
                        <h2 id="kit-modal-title">CREATE KIT</h2>
                        
                        <div class="kit-form">
                            <div class="form-column">
                                <h3>Kit Details</h3>
                                
                                <div class="form-group">
                                    <label>Kit Name:</label>
                                    <input type="text" id="kit-name" placeholder="e.g., Starter Kit">
                                </div>
                                
                                <div class="form-group">
                                    <label>Description:</label>
                                    <input type="text" id="kit-desc" placeholder="Brief description">
                                </div>
                                
                                <div class="form-group">
                                    <label>Icon:</label>
                                    <select id="kit-icon">
                                        <option value="📦">📦 Box</option>
                                        <option value="👑">👑 Crown</option>
                                        <option value="⚔️">⚔️ Swords</option>
                                        <option value="🛡️">🛡️ Shield</option>
                                        <option value="🔫">🔫 Gun</option>
                                        <option value="💊">💊 Medical</option>
                                        <option value="🏗️">🏗️ Building</option>
                                        <option value="🎁">🎁 Gift</option>
                                    </select>
                                </div>
                                
                                <div class="form-group">
                                    <label>Category:</label>
                                    <select id="kit-category">
                                        ${this.categories.slice(1).map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                                    </select>
                                </div>
                                
                                <h3>Access Settings</h3>
                                
                                <div class="checkbox-group">
                                    ${this.groups.map(group => `
                                        <label>
                                            <input type="checkbox" class="kit-group" value="${group}"> ${group}
                                        </label>
                                    `).join('')}
                                </div>
                                
                                <div class="form-group">
                                    <label>Cooldown (seconds):</label>
                                    <input type="number" id="kit-cooldown" value="300" min="0">
                                </div>
                                
                                <div class="form-group">
                                    <label>Max Uses (0 = unlimited):</label>
                                    <input type="number" id="kit-max-uses" value="0" min="0">
                                </div>
                                
                                <div class="checkbox-group">
                                    <label>
                                        <input type="checkbox" id="kit-auto-grant"> Auto-grant on spawn
                                    </label>
                                    <label>
                                        <input type="checkbox" id="kit-hidden"> Hidden kit
                                    </label>
                                </div>
                            </div>
                            
                            <div class="form-column">
                                <h3>Items</h3>
                                
                                <div class="item-add-form">
                                    <input type="text" id="item-shortname" placeholder="Item shortname">
                                    <input type="number" id="item-amount" placeholder="Amount" value="1" min="1">
                                    <select id="item-container">
                                        <option value="belt">Belt</option>
                                        <option value="main">Main</option>
                                        <option value="wear">Wear</option>
                                    </select>
                                    <input type="number" id="item-condition" placeholder="Condition" value="100" min="0" max="100">
                                    <button id="add-item" class="small-btn">+ ADD</button>
                                </div>
                                
                                <div id="kit-items-list" class="kit-items-list"></div>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button id="save-kit" class="kit-btn primary">SAVE KIT</button>
                            <button id="cancel-kit" class="kit-btn">CANCEL</button>
                        </div>
                    </div>
                </div>

                <!-- Give Kit Modal -->
                <div id="give-kit-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3>GIVE KIT</h3>
                        
                        <div class="form-group">
                            <label>Kit:</label>
                            <select id="give-kit-select"></select>
                        </div>
                        
                        <div class="form-group">
                            <label>Player/Group:</label>
                            <input type="text" id="give-target" placeholder="Player name or @group">
                        </div>
                        
                        <div class="modal-actions">
                            <button id="execute-give" class="kit-btn primary">GIVE</button>
                            <button id="cancel-give" class="kit-btn">CANCEL</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderKits();
    }

    setupEventListeners() {
        document.getElementById('create-kit')?.addEventListener('click', () => this.openKitModal());
        document.getElementById('refresh-kits')?.addEventListener('click', () => this.refresh());
        document.getElementById('save-kit')?.addEventListener('click', () => this.saveKit());
        document.getElementById('cancel-kit')?.addEventListener('click', () => {
            document.getElementById('kit-modal').classList.add('hidden');
        });

        document.getElementById('kit-category-filter')?.addEventListener('change', () => this.renderKits());
        document.getElementById('kit-search')?.addEventListener('input', () => this.renderKits());
        document.getElementById('show-hidden')?.addEventListener('change', () => this.renderKits());

        document.getElementById('add-item')?.addEventListener('click', () => this.addKitItem());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-kit')) {
                const id = e.target.dataset.id;
                this.openKitModal(id);
            }
            if (e.target.classList.contains('delete-kit')) {
                const id = e.target.dataset.id;
                this.deleteKit(id);
            }
            if (e.target.classList.contains('duplicate-kit')) {
                const id = e.target.dataset.id;
                this.duplicateKit(id);
            }
            if (e.target.classList.contains('give-kit')) {
                const id = e.target.dataset.id;
                this.openGiveModal(id);
            }
            if (e.target.classList.contains('preview-kit')) {
                const id = e.target.dataset.id;
                this.previewKit(id);
            }
            if (e.target.classList.contains('remove-item')) {
                const index = e.target.dataset.index;
                this.removeKitItem(index);
            }
        });

        document.getElementById('cancel-give')?.addEventListener('click', () => {
            document.getElementById('give-kit-modal').classList.add('hidden');
        });

        document.getElementById('execute-give')?.addEventListener('click', () => this.giveKit());
    }

    renderKits() {
        const grid = document.getElementById('kits-grid');
        if (!grid) return;

        const category = document.getElementById('kit-category-filter')?.value || 'All';
        const search = document.getElementById('kit-search')?.value.toLowerCase() || '';
        const showHidden = document.getElementById('show-hidden')?.checked || false;

        let filtered = this.kits;

        if (category !== 'All') {
            filtered = filtered.filter(k => k.category === category);
        }

        if (search) {
            filtered = filtered.filter(k => 
                k.name.toLowerCase().includes(search) || 
                k.description.toLowerCase().includes(search)
            );
        }

        if (!showHidden) {
            filtered = filtered.filter(k => !k.hidden);
        }

        if (filtered.length === 0) {
            grid.innerHTML = '<div class="no-kits">No kits found</div>';
            return;
        }

        let html = '';
        filtered.forEach(kit => {
            const groups = kit.groups.join(', ');
            html += `
                <div class="kit-card ${kit.hidden ? 'hidden' : ''}">
                    <div class="kit-header">
                        <span class="kit-icon">${kit.icon || '📦'}</span>
                        <span class="kit-name">${kit.name}</span>
                        ${kit.autoGrant ? '<span class="kit-badge">AUTO</span>' : ''}
                    </div>
                    <div class="kit-body">
                        <div class="kit-desc">${kit.description}</div>
                        <div class="kit-meta">
                            <span>📦 ${kit.items.length} items</span>
                            <span>⏱️ ${kit.cooldown}s</span>
                            <span>🎯 ${kit.maxUses || '∞'} uses</span>
                        </div>
                        <div class="kit-groups">${groups}</div>
                    </div>
                    <div class="kit-actions">
                        <button class="kit-btn small edit-kit" data-id="${kit.id}">✏️</button>
                        <button class="kit-btn small duplicate-kit" data-id="${kit.id}">📋</button>
                        <button class="kit-btn small give-kit" data-id="${kit.id}">🎁</button>
                        <button class="kit-btn small preview-kit" data-id="${kit.id}">👁️</button>
                        <button class="kit-btn small delete-kit" data-id="${kit.id}">🗑️</button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    }

    openKitModal(kitId = null) {
        const modal = document.getElementById('kit-modal');
        const title = document.getElementById('kit-modal-title');
        
        if (kitId) {
            title.innerText = 'EDIT KIT';
            const kit = this.kits.find(k => k.id === kitId);
            if (kit) this.populateKitForm(kit);
        } else {
            title.innerText = 'CREATE KIT';
            this.clearKitForm();
        }

        modal.classList.remove('hidden');
    }

    populateKitForm(kit) {
        document.getElementById('kit-name').value = kit.name || '';
        document.getElementById('kit-desc').value = kit.description || '';
        document.getElementById('kit-icon').value = kit.icon || '📦';
        document.getElementById('kit-category').value = kit.category || 'Starter';
        document.getElementById('kit-cooldown').value = kit.cooldown || 300;
        document.getElementById('kit-max-uses').value = kit.maxUses || 0;
        document.getElementById('kit-auto-grant').checked = kit.autoGrant || false;
        document.getElementById('kit-hidden').checked = kit.hidden || false;

        // Groups
        document.querySelectorAll('.kit-group').forEach(cb => {
            cb.checked = kit.groups?.includes(cb.value) || false;
        });

        // Items
        this.currentKitItems = kit.items || [];
        this.renderKitItems();
    }

    clearKitForm() {
        document.getElementById('kit-name').value = '';
        document.getElementById('kit-desc').value = '';
        document.getElementById('kit-icon').value = '📦';
        document.getElementById('kit-category').value = 'Starter';
        document.getElementById('kit-cooldown').value = '300';
        document.getElementById('kit-max-uses').value = '0';
        document.getElementById('kit-auto-grant').checked = false;
        document.getElementById('kit-hidden').checked = false;

        document.querySelectorAll('.kit-group').forEach(cb => cb.checked = false);
        
        this.currentKitItems = [];
        this.renderKitItems();
    }

    addKitItem() {
        const shortname = document.getElementById('item-shortname').value;
        const amount = parseInt(document.getElementById('item-amount').value);
        const container = document.getElementById('item-container').value;
        const condition = parseInt(document.getElementById('item-condition').value);

        if (!shortname) {
            this.tablet.showError('Enter item shortname');
            return;
        }

        this.currentKitItems.push({
            shortname,
            amount,
            container,
            condition
        });

        this.renderKitItems();
        
        // Clear inputs
        document.getElementById('item-shortname').value = '';
        document.getElementById('item-amount').value = '1';
        document.getElementById('item-condition').value = '100';
    }

    removeKitItem(index) {
        this.currentKitItems.splice(index, 1);
        this.renderKitItems();
    }

    renderKitItems() {
        const container = document.getElementById('kit-items-list');
        
        if (!this.currentKitItems || this.currentKitItems.length === 0) {
            container.innerHTML = '<div class="no-items">No items added</div>';
            return;
        }

        let html = '';
        this.currentKitItems.forEach((item, index) => {
            html += `
                <div class="kit-item">
                    <span>${item.shortname} x${item.amount}</span>
                    <span>(${item.container})</span>
                    <span>${item.condition}%</span>
                    <button class="remove-item small-btn" data-index="${index}">✕</button>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    saveKit() {
        const name = document.getElementById('kit-name').value;
        if (!name) {
            this.tablet.showError('Kit name required');
            return;
        }

        const kit = {
            id: this.editingKitId || 'kit_' + Date.now(),
            name: name,
            description: document.getElementById('kit-desc').value,
            icon: document.getElementById('kit-icon').value,
            category: document.getElementById('kit-category').value,
            cooldown: parseInt(document.getElementById('kit-cooldown').value),
            maxUses: parseInt(document.getElementById('kit-max-uses').value),
            autoGrant: document.getElementById('kit-auto-grant').checked,
            hidden: document.getElementById('kit-hidden').checked,
            groups: Array.from(document.querySelectorAll('.kit-group:checked')).map(cb => cb.value),
            items: this.currentKitItems || [],
            updated: new Date().toISOString()
        };

        if (this.editingKitId) {
            const index = this.kits.findIndex(k => k.id === this.editingKitId);
            if (index !== -1) {
                this.kits[index] = { ...this.kits[index], ...kit };
            }
        } else {
            kit.created = new Date().toISOString();
            this.kits.push(kit);
        }

        this.saveKits();
        this.renderKits();
        document.getElementById('kit-modal').classList.add('hidden');
        this.tablet.showToast(`Kit ${name} saved`, 'success');
    }

    deleteKit(id) {
        this.tablet.showConfirm('Delete this kit?', (confirmed) => {
            if (confirmed) {
                this.kits = this.kits.filter(k => k.id !== id);
                this.saveKits();
                this.renderKits();
                this.tablet.showToast('Kit deleted', 'info');
            }
        });
    }

    duplicateKit(id) {
        const kit = this.kits.find(k => k.id === id);
        if (kit) {
            const newKit = {
                ...kit,
                id: 'kit_' + Date.now(),
                name: kit.name + ' (Copy)',
                created: new Date().toISOString()
            };
            this.kits.push(newKit);
            this.saveKits();
            this.renderKits();
            this.tablet.showToast('Kit duplicated', 'success');
        }
    }

    openGiveModal(kitId) {
        const select = document.getElementById('give-kit-select');
        select.innerHTML = this.kits.map(k => 
            `<option value="${k.id}" ${k.id === kitId ? 'selected' : ''}>${k.name}</option>`
        ).join('');
        
        document.getElementById('give-kit-modal').classList.remove('hidden');
    }

    giveKit() {
        const kitId = document.getElementById('give-kit-select').value;
        const target = document.getElementById('give-target').value;

        if (!target) {
            this.tablet.showError('Enter target player or group');
            return;
        }

        const kit = this.kits.find(k => k.id === kitId);
        this.tablet.showToast(`Gave ${kit.name} to ${target}`, 'success');
        document.getElementById('give-kit-modal').classList.add('hidden');
    }

    previewKit(id) {
        const kit = this.kits.find(k => k.id === id);
        if (!kit) return;

        let items = '';
        kit.items.forEach(item => {
            items += `${item.shortname} x${item.amount} (${item.container})\n`;
        });

        alert(`Kit: ${kit.name}\n\nItems:\n${items}\nCooldown: ${kit.cooldown}s\nMax Uses: ${kit.maxUses || 'Unlimited'}`);
    }

    refresh() {
        this.renderKits();
        this.tablet.showToast('Kits refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kitManager = new KitManager(window.drainedTablet);
});