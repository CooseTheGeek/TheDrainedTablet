// kits.js – DRAINED TABLET ULTIMATE v7.0.0 (KaosBot‑style kit manager)

class Kits {
    constructor() {
        this.access = window.accessControl;
        this.kits = this.loadKits();
        this.currentKit = null;           // the kit being edited
        this.selectedSlot = null;          // { container, index } of the currently selected slot
        this.filterCategory = 'all';        // current category filter for item gallery
        this.searchQuery = '';              // current search query
        this.init();
    }

    loadKits() {
        const saved = localStorage.getItem('tdl_kits');
        return saved ? JSON.parse(saved) : [];
    }

    saveKits() {
        localStorage.setItem('tdl_kits', JSON.stringify(this.kits));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'kits') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-kits');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="kits-container" style="display: flex; gap: 20px; padding: 20px; height: 100%;">
                <!-- Left panel: Kit list -->
                <div class="kits-left" style="width: 280px; background: var(--glass-bg); border-radius: 12px; padding: 15px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 15px;">My Kits</h3>
                    <button id="create-kit" class="kit-btn primary" style="margin-bottom: 15px;">+ New Kit</button>
                    <div id="kits-list" class="kits-list" style="flex: 1; overflow-y: auto;"></div>
                </div>

                <!-- Right panel: Kit editor -->
                <div class="kits-right" style="flex: 1; background: var(--glass-bg); border-radius: 12px; padding: 20px; overflow-y: auto;">
                    <h2 id="kit-editor-title">Kit Editor</h2>
                    <div id="kit-editor" style="${this.currentKit ? 'display:block' : 'display:none'}">
                        <!-- Top bar: Kit name and category -->
                        <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                            <div style="flex: 2;">
                                <label>Kit Name</label>
                                <input type="text" id="kit-name" class="form-control" placeholder="Type or select a kit name" style="width:100%;">
                            </div>
                            <div style="flex: 1;">
                                <label>Category</label>
                                <select id="item-category-filter" class="form-control" style="width:100%;">
                                    <option value="all">All Categories</option>
                                    <option value="Ammo">Ammo</option>
                                    <option value="Weapons">Weapons</option>
                                    <option value="Construction">Construction</option>
                                    <option value="Items">Items</option>
                                    <option value="Resources">Resources</option>
                                    <option value="Attire">Attire</option>
                                    <option value="Tools">Tools</option>
                                    <option value="Medical">Medical</option>
                                    <option value="Food">Food</option>
                                    <option value="Traps">Traps</option>
                                    <option value="Misc">Misc</option>
                                    <option value="Components">Components</option>
                                    <option value="Electrical">Electrical</option>
                                    <option value="Animals">Animals</option>
                                    <option value="Vehicles">Vehicles</option>
                                    <option value="Vehicle Parts">Vehicle Parts</option>
                                    <option value="Seasonal">Seasonal</option>
                                </select>
                            </div>
                        </div>

                        <!-- Action buttons -->
                        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                            <button id="copy-kit" class="kit-btn">Copy</button>
                            <button id="reset-kit" class="kit-btn">Reset</button>
                            <button id="import-kit" class="kit-btn">Import</button>
                        </div>

                        <!-- Search bar -->
                        <div style="margin-bottom: 15px;">
                            <label>Search items or use format: '5 stone'</label>
                            <input type="text" id="item-search" class="form-control" placeholder="Search items..." style="width:100%;">
                        </div>

                        <!-- Item Gallery -->
                        <h4>Item Gallery</h4>
                        <div id="item-gallery" class="item-gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; max-height: 250px; overflow-y: auto; border: 1px solid #444; padding: 10px; margin-bottom: 20px;"></div>

                        <!-- Equipment slots -->
                        <h3>Equipment</h3>
                        <div style="display: flex; gap: 30px; justify-content: space-around;">
                            <div class="slot-section">
                                <h4>WEAR</h4>
                                <div id="wear-slots" class="slot-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;"></div>
                            </div>
                            <div class="slot-section">
                                <h4>MAIN</h4>
                                <div id="main-slots" class="slot-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;"></div>
                            </div>
                            <div class="slot-section">
                                <h4>BELT</h4>
                                <div id="belt-slots" class="slot-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;"></div>
                            </div>
                        </div>

                        <!-- Save/Cancel -->
                        <div style="display: flex; gap: 10px; margin-top: 30px;">
                            <button id="save-kit" class="kit-btn primary">Save Kit</button>
                            <button id="cancel-edit" class="kit-btn">Cancel</button>
                        </div>
                    </div>
                    <div id="no-kit-selected" style="${this.currentKit ? 'display:none' : 'display:block'}; text-align: center; padding: 50px;">
                        <p>Select a kit or create a new one</p>
                    </div>
                </div>
            </div>

            <!-- Give Kit Modal -->
            <div id="give-kit-modal" class="modal hidden">
                <div class="modal-content">
                    <h3>Give Kit</h3>
                    <div class="form-group">
                        <label>Kit:</label>
                        <select id="give-kit-select" class="form-control"></select>
                    </div>
                    <div class="form-group">
                        <label>Player:</label>
                        <select id="give-player-select" class="form-control">
                            <option value="">Select player...</option>
                            ${(AppState.players || []).map(p => `<option value="${p.name}">${p.name}</option>`).join('')}
                        </select>
                        <input type="text" id="give-player-manual" class="form-control" placeholder="Or type player name" style="margin-top:5px;">
                    </div>
                    <div class="modal-actions">
                        <button id="execute-give" class="kit-btn primary">Give Kit</button>
                        <button id="cancel-give" class="kit-btn">Cancel</button>
                    </div>
                </div>
            </div>
        `;

        this.renderKitList();
        this.renderEquipmentSlots([]);
        this.updateItemGallery();
    }

    renderKitList() {
        const listDiv = document.getElementById('kits-list');
        if (!listDiv) return;
        if (this.kits.length === 0) {
            listDiv.innerHTML = '<p>No kits created.</p>';
            return;
        }
        let html = '';
        this.kits.forEach(kit => {
            html += `
                <div class="kit-list-item" data-id="${kit.id}" style="padding: 10px; margin-bottom: 5px; background: var(--bg-tertiary); border-radius: 5px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <span><strong>${kit.name}</strong> <small>v${kit.version || '1.0'}</small></span>
                    <button class="small-btn give-kit-btn" data-id="${kit.id}" title="Give kit">🎁</button>
                </div>
            `;
        });
        listDiv.innerHTML = html;
        // Kit selection
        listDiv.querySelectorAll('.kit-list-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('give-kit-btn')) return;
                this.loadKit(el.dataset.id);
            });
        });
        // Give buttons
        listDiv.querySelectorAll('.give-kit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openGiveModal(btn.dataset.id);
            });
        });
    }

    loadKit(id) {
        const kit = this.kits.find(k => k.id === id);
        if (!kit) return;
        this.currentKit = kit;
        this.selectedSlot = null;
        document.getElementById('kit-editor').style.display = 'block';
        document.getElementById('no-kit-selected').style.display = 'none';
        document.getElementById('kit-name').value = kit.name || '';
        document.getElementById('item-category-filter').value = this.filterCategory;
        document.getElementById('item-search').value = this.searchQuery;
        this.renderEquipmentSlots(kit.items || []);
        this.updateItemGallery();
    }

    renderEquipmentSlots(items) {
        const belt = document.getElementById('belt-slots');
        const main = document.getElementById('main-slots');
        const wear = document.getElementById('wear-slots');
        if (!belt || !main || !wear) return;
        belt.innerHTML = '';
        main.innerHTML = '';
        wear.innerHTML = '';

        // Helper to create a slot element
        const createSlot = (container, index, item) => {
            const slotDiv = document.createElement('div');
            slotDiv.className = `slot ${item ? 'filled' : 'empty'}`;
            slotDiv.dataset.container = container;
            slotDiv.dataset.index = index;
            slotDiv.style.width = '50px';
            slotDiv.style.height = '50px';
            slotDiv.style.background = '#333';
            slotDiv.style.border = '2px solid #666';
            slotDiv.style.display = 'flex';
            slotDiv.style.alignItems = 'center';
            slotDiv.style.justifyContent = 'center';
            slotDiv.style.borderRadius = '4px';
            slotDiv.style.cursor = 'pointer';
            if (item) {
                slotDiv.innerHTML = `${item.shortname}<br><small>x${item.amount}</small>`;
                slotDiv.dataset.shortname = item.shortname;
                slotDiv.dataset.amount = item.amount;
                slotDiv.dataset.condition = item.condition;
            } else {
                slotDiv.innerHTML = '&nbsp;';
            }
            // Click to select slot
            slotDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectSlot(container, index);
            });
            // Right‑click to remove item
            slotDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (item) {
                    this.removeItemFromSlot(container, index);
                }
            });
            return slotDiv;
        };

        // Populate slots
        for (let i = 0; i < 6; i++) {
            const item = items.find(it => it.container === 'belt' && it.slot === i);
            belt.appendChild(createSlot('belt', i, item));
        }
        for (let i = 0; i < 24; i++) {
            const item = items.find(it => it.container === 'main' && it.slot === i);
            main.appendChild(createSlot('main', i, item));
        }
        for (let i = 0; i < 5; i++) {
            const item = items.find(it => it.container === 'wear' && it.slot === i);
            wear.appendChild(createSlot('wear', i, item));
        }
    }

    selectSlot(container, index) {
        // Clear previous selection highlight
        document.querySelectorAll('.slot').forEach(slot => {
            slot.style.borderColor = '#666';
        });
        // Highlight new selection
        const selectedEl = document.querySelector(`[data-container="${container}"][data-index="${index}"]`);
        if (selectedEl) {
            selectedEl.style.borderColor = '#D4AF37';
            this.selectedSlot = { container, index };
        }
    }

    removeItemFromSlot(container, index) {
        if (!this.currentKit) return;
        this.currentKit.items = this.currentKit.items.filter(item => !(item.container === container && item.slot === index));
        this.renderEquipmentSlots(this.currentKit.items);
    }

    attachEvents() {
        document.getElementById('create-kit')?.addEventListener('click', () => this.createNewKit());
        document.getElementById('save-kit')?.addEventListener('click', () => this.saveCurrentKit());
        document.getElementById('cancel-edit')?.addEventListener('click', () => this.cancelEdit());
        document.getElementById('copy-kit')?.addEventListener('click', () => this.copyKit());
        document.getElementById('reset-kit')?.addEventListener('click', () => this.resetKit());
        document.getElementById('import-kit')?.addEventListener('click', () => this.importKit());
        document.getElementById('item-category-filter')?.addEventListener('change', (e) => {
            this.filterCategory = e.target.value;
            this.updateItemGallery();
        });
        document.getElementById('item-search')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.updateItemGallery();
        });
        document.getElementById('execute-give')?.addEventListener('click', () => this.giveKit());
        document.getElementById('cancel-give')?.addEventListener('click', () => {
            document.getElementById('give-kit-modal').classList.add('hidden');
        });
    }

    createNewKit() {
        const newKit = {
            id: 'kit_' + Date.now(),
            name: 'New Kit',
            version: '1.0',
            items: [],
            cooldown: 300,
            maxUses: 0,
            automation: 0,
            inventorySizes: '',
            headerItems: '',
            general: {},
            teams: []
        };
        this.kits.push(newKit);
        this.saveKits();
        this.renderKitList();
        this.loadKit(newKit.id);
    }

    saveCurrentKit() {
        if (!this.currentKit) return;
        this.currentKit.name = document.getElementById('kit-name').value;
        // Additional fields like version, cooldown etc. could be added later
        this.saveKits();
        this.renderKitList();
        toast.success('Kit saved');
    }

    cancelEdit() {
        this.currentKit = null;
        this.selectedSlot = null;
        document.getElementById('kit-editor').style.display = 'none';
        document.getElementById('no-kit-selected').style.display = 'block';
    }

    copyKit() {
        if (!this.currentKit) return;
        const newKit = {
            ...this.currentKit,
            id: 'kit_' + Date.now(),
            name: this.currentKit.name + ' (Copy)'
        };
        this.kits.push(newKit);
        this.saveKits();
        this.renderKitList();
        toast.success('Kit duplicated');
    }

    resetKit() {
        if (!this.currentKit) return;
        if (confirm('Reset kit to last saved version?')) {
            // Reload from storage
            const original = this.kits.find(k => k.id === this.currentKit.id);
            this.currentKit = { ...original };
            this.renderEquipmentSlots(this.currentKit.items || []);
            document.getElementById('kit-name').value = this.currentKit.name;
            toast.info('Kit reset');
        }
    }

    importKit() {
        toast.info('Import not implemented yet');
        // Could prompt for JSON and merge
    }

    updateItemGallery() {
        const gallery = document.getElementById('item-gallery');
        if (!gallery || !window.itemsDatabase) return;

        let items = window.itemsDatabase;
        // Filter by category
        if (this.filterCategory !== 'all') {
            items = items.filter(item => item.category === this.filterCategory);
        }
        // Filter by search
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            items = items.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.shortname.toLowerCase().includes(query)
            );
        }
        // Limit to first 100 for performance
        items = items.slice(0, 100);

        gallery.innerHTML = items.map(item => `
            <div class="gallery-item" data-shortname="${item.shortname}" style="padding: 8px; background: #2a2a2a; border-radius: 4px; cursor: pointer; text-align: center; border: 1px solid #444;">
                <div>${item.name}</div>
                <small>${item.shortname}</small>
            </div>
        `).join('');

        gallery.querySelectorAll('.gallery-item').forEach(el => {
            el.addEventListener('click', () => this.addItemToSelectedSlot(el.dataset.shortname));
        });
    }

    addItemToSelectedSlot(shortname) {
        if (!this.currentKit) {
            toast.error('Select a kit first');
            return;
        }
        if (!this.selectedSlot) {
            toast.error('Select a slot first (click on an empty slot)');
            return;
        }
        const { container, index } = this.selectedSlot;
        // Check if slot is already occupied
        if (this.currentKit.items.find(item => item.container === container && item.slot === index)) {
            toast.error('Slot already occupied');
            return;
        }
        const amount = prompt('Quantity:', '1');
        if (!amount) return;
        const condition = prompt('Condition (0-100):', '100');
        this.currentKit.items.push({
            shortname,
            amount: parseInt(amount),
            container,
            slot: index,
            condition: parseInt(condition) || 100
        });
        this.renderEquipmentSlots(this.currentKit.items);
        // Clear selection after adding
        this.selectedSlot = null;
        document.querySelectorAll('.slot').forEach(slot => slot.style.borderColor = '#666');
    }

    openGiveModal(kitId) {
        const select = document.getElementById('give-kit-select');
        select.innerHTML = this.kits.map(k => 
            `<option value="${k.id}" ${k.id === kitId ? 'selected' : ''}>${k.name}</option>`
        ).join('');
        // Refresh player dropdown
        const playerSelect = document.getElementById('give-player-select');
        playerSelect.innerHTML = '<option value="">Select player...</option>' +
            (AppState.players || []).map(p => `<option value="${p.name}">${p.name}</option>`).join('');
        document.getElementById('give-kit-modal').classList.remove('hidden');
    }

    async giveKit() {
        const kitId = document.getElementById('give-kit-select').value;
        const playerSelect = document.getElementById('give-player-select');
        const playerManual = document.getElementById('give-player-manual').value.trim();
        let target = playerSelect.value;
        if (!target && playerManual) target = playerManual;
        if (!target) {
            toast.error('Enter or select a player');
            return;
        }
        const kit = this.kits.find(k => k.id === kitId);
        if (!kit) return;
        try {
            await ConnectionManager.executeCommand(`kit.give "${target}" "${kit.name}"`);
            toast.success(`Gave kit ${kit.name} to ${target}`);
            document.getElementById('give-kit-modal').classList.add('hidden');
        } catch (err) {
            toast.error(`Failed: ${err.message}`);
        }
    }

    refresh() {
        this.renderKitList();
        if (this.currentKit) this.loadKit(this.currentKit.id);
        this.updateItemGallery();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kits = new Kits();
});