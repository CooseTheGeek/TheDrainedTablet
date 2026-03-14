// kits.js – DRAINED TABLET ULTIMATE v7.0.0 (KaosBot style with images)

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
                <div class="kits-left" style="width: 300px; background: var(--glass-bg); border-radius: 12px; padding: 15px; display: flex; flex-direction: column;">
                    <h3 style="margin-bottom: 15px;">My Kits</h3>
                    <button id="create-kit" class="kit-btn primary" style="margin-bottom: 15px;">+ New Kit</button>
                    <div id="kits-list" class="kits-list" style="flex: 1; overflow-y: auto;"></div>
                    <div style="display: flex; gap: 5px; margin-top: 10px;">
                        <button id="export-kits" class="kit-btn small">📤 Export</button>
                        <button id="import-kits" class="kit-btn small">📥 Import</button>
                    </div>
                </div>

                <!-- Right panel: Kit editor -->
                <div class="kits-right" style="flex: 1; background: var(--glass-bg); border-radius: 12px; padding: 20px; overflow-y: auto;">
                    <h2 id="kit-editor-title">Kit Editor</h2>
                    <div id="kit-editor" style="${this.currentKit ? 'display:block' : 'display:none'}">
                        <!-- Top bar: Kit name and auth level -->
                        <div style="display: flex; gap: 20px; margin-bottom: 15px;">
                            <div style="flex: 2;">
                                <label>Kit Name</label>
                                <input type="text" id="kit-name" class="form-control" placeholder="e.g., Starter Kit" style="width:100%;">
                            </div>
                            <div style="flex: 1;">
                                <label>Auth Level</label>
                                <input type="number" id="kit-auth-level" class="form-control" placeholder="0" value="0" min="0">
                            </div>
                        </div>

                        <!-- Action buttons -->
                        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                            <button id="copy-kit" class="kit-btn">Copy</button>
                            <button id="reset-kit" class="kit-btn">Reset</button>
                        </div>

                        <!-- Category filter and search -->
                        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                            <select id="item-category-filter" class="form-control" style="width: 200px;">
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
                            <input type="text" id="item-search" class="form-control" placeholder="Search items..." style="flex: 1;">
                        </div>

                        <!-- Item Gallery -->
                        <h4>Item Gallery</h4>
                        <div id="item-gallery" class="item-gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; max-height: 250px; overflow-y: auto; border: 1px solid #444; padding: 10px; margin-bottom: 20px;"></div>

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
                        </select>
                        <input type="text" id="give-player-manual" class="form-control" placeholder="Or type player name" style="margin-top:5px;">
                    </div>
                    <div class="modal-actions">
                        <button id="execute-give" class="kit-btn primary">Give Kit</button>
                        <button id="cancel-give" class="kit-btn">Cancel</button>
                    </div>
                </div>
            </div>

            <!-- View Kit Modal -->
            <div id="view-kit-modal" class="modal hidden">
                <div class="modal-content">
                    <h3 id="view-kit-title"></h3>
                    <div id="view-kit-items" style="max-height: 400px; overflow-y: auto;"></div>
                    <div class="modal-actions">
                        <button id="close-view" class="kit-btn">Close</button>
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
                    <span><strong>${kit.name}</strong> <small>ID: ${kit.id}</small></span>
                    <div style="display: flex; gap: 5px;">
                        <button class="small-btn view-kit-btn" data-id="${kit.id}" title="View kit">👁️</button>
                        <button class="small-btn give-kit-btn" data-id="${kit.id}" title="Give kit">🎁</button>
                        <button class="small-btn delete-kit-btn" data-id="${kit.id}" title="Delete kit">🗑️</button>
                    </div>
                </div>
            `;
        });
        listDiv.innerHTML = html;
        // Kit selection (click on the item itself, not the buttons)
        listDiv.querySelectorAll('.kit-list-item').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('view-kit-btn') || e.target.classList.contains('give-kit-btn') || e.target.classList.contains('delete-kit-btn')) return;
                this.loadKit(el.dataset.id);
            });
        });
        // View buttons
        listDiv.querySelectorAll('.view-kit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewKit(btn.dataset.id);
            });
        });
        // Give buttons
        listDiv.querySelectorAll('.give-kit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openGiveModal(btn.dataset.id);
            });
        });
        // Delete buttons
        listDiv.querySelectorAll('.delete-kit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteKit(btn.dataset.id);
            });
        });
    }

    deleteKit(id) {
        if (!confirm('Are you sure you want to delete this kit?')) return;
        this.kits = this.kits.filter(k => k.id !== parseInt(id));
        this.saveKits();
        if (this.currentKit && this.currentKit.id === parseInt(id)) {
            this.currentKit = null;
            document.getElementById('kit-editor').style.display = 'none';
            document.getElementById('no-kit-selected').style.display = 'block';
        }
        this.renderKitList();
        toast.info('Kit deleted');
    }

    viewKit(id) {
        const kit = this.kits.find(k => k.id === parseInt(id));
        if (!kit) return;
        let itemsHtml = '<table style="width:100%;"><tr><th>Shortname</th><th>Amount</th><th>Container</th><th>Condition</th></tr>';
        (kit.items || []).forEach((item, idx) => {
            itemsHtml += `<tr><td>${item.shortname}</td><td>${item.amount}</td><td>${item.container}</td><td>${item.condition}</td></tr>`;
        });
        itemsHtml += '</table>';
        document.getElementById('view-kit-title').innerText = kit.name;
        document.getElementById('view-kit-items').innerHTML = itemsHtml;
        document.getElementById('view-kit-modal').classList.remove('hidden');
    }

    loadKit(id) {
        const kit = this.kits.find(k => k.id === parseInt(id));
        if (!kit) return;
        this.currentKit = { ...kit, items: kit.items.map(item => ({ ...item })) }; // deep copy
        this.selectedSlot = null;
        document.getElementById('kit-editor').style.display = 'block';
        document.getElementById('no-kit-selected').style.display = 'none';
        document.getElementById('kit-name').value = this.currentKit.name || '';
        document.getElementById('kit-auth-level').value = this.currentKit.auth_level !== undefined ? this.currentKit.auth_level : 0;
        document.getElementById('item-category-filter').value = this.filterCategory;
        document.getElementById('item-search').value = this.searchQuery;
        this.renderEquipmentSlots(this.currentKit.items || []);
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

        const createSlot = (container, index, item) => {
            const slotDiv = document.createElement('div');
            slotDiv.className = `slot ${item ? 'filled' : 'empty'}`;
            slotDiv.dataset.container = container;
            slotDiv.dataset.index = index;
            slotDiv.style.width = '60px';
            slotDiv.style.height = '60px';
            slotDiv.style.background = '#333';
            slotDiv.style.border = '2px solid #666';
            slotDiv.style.display = 'flex';
            slotDiv.style.flexDirection = 'column';
            slotDiv.style.alignItems = 'center';
            slotDiv.style.justifyContent = 'center';
            slotDiv.style.borderRadius = '4px';
            slotDiv.style.cursor = 'pointer';
            slotDiv.style.padding = '2px';
            slotDiv.style.fontSize = '10px';
            if (item) {
                // Use a placeholder image; you could use a CDN like https://static.rustworkshop.xyz/icons/
                const imgUrl = `https://static.rustworkshop.xyz/icons/${item.shortname.replace(/\./g, '-')}.png`;
                slotDiv.innerHTML = `
                    <img src="${imgUrl}" style="width: 30px; height: 30px; object-fit: contain;" 
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/30?text=?'">
                    <span>${item.shortname}</span>
                    <small>x${item.amount}</small>
                `;
                slotDiv.dataset.shortname = item.shortname;
                slotDiv.dataset.amount = item.amount;
                slotDiv.dataset.condition = item.condition;
            } else {
                slotDiv.innerHTML = '&nbsp;';
            }
            slotDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectSlot(container, index);
            });
            slotDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (item) {
                    this.removeItemFromSlot(container, index);
                }
            });
            return slotDiv;
        };

        for (let i = 0; i < 6; i++) {
            const item = items.find(it => it.container === 'Belt' && it.slot === i);
            belt.appendChild(createSlot('Belt', i, item));
        }
        for (let i = 0; i < 24; i++) {
            const item = items.find(it => it.container === 'Main' && it.slot === i);
            main.appendChild(createSlot('Main', i, item));
        }
        for (let i = 0; i < 5; i++) {
            const item = items.find(it => it.container === 'Wear' && it.slot === i);
            wear.appendChild(createSlot('Wear', i, item));
        }
    }

    selectSlot(container, index) {
        document.querySelectorAll('.slot').forEach(slot => {
            slot.style.borderColor = '#666';
        });
        const selectedEl = document.querySelector(`[data-container="${container}"][data-index="${index}"]`);
        if (selectedEl) {
            selectedEl.style.borderColor = '#D4AF37';
            this.selectedSlot = { container, index };
        }
    }

    removeItemFromSlot(container, index) {
        if (!this.currentKit) return;
        this.currentKit.items = this.currentKit.items.filter(item => !(item.container === container && item.slot === index));
        // Re-index items (server expects id to be sequential)
        this.currentKit.items.forEach((item, idx) => { item.id = idx; });
        this.renderEquipmentSlots(this.currentKit.items);
    }

    attachEvents() {
        document.getElementById('create-kit')?.addEventListener('click', () => this.createNewKit());
        document.getElementById('save-kit')?.addEventListener('click', () => this.saveCurrentKit());
        document.getElementById('cancel-edit')?.addEventListener('click', () => this.cancelEdit());
        document.getElementById('copy-kit')?.addEventListener('click', () => this.copyKit());
        document.getElementById('reset-kit')?.addEventListener('click', () => this.resetKit());
        document.getElementById('export-kits')?.addEventListener('click', () => this.exportKits());
        document.getElementById('import-kits')?.addEventListener('click', () => this.importKits());
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
        document.getElementById('close-view')?.addEventListener('click', () => {
            document.getElementById('view-kit-modal').classList.add('hidden');
        });
    }

    createNewKit() {
        const newKit = {
            id: this.generateId(),
            name: 'New Kit',
            items: [],
            auth_level: 0
        };
        this.kits.push(newKit);
        this.saveKits();
        this.renderKitList();
        this.loadKit(newKit.id);
    }

    generateId() {
        return Math.floor(Date.now() / 1000);
    }

    saveCurrentKit() {
        if (!this.currentKit) return;
        this.currentKit.name = document.getElementById('kit-name').value;
        this.currentKit.auth_level = parseInt(document.getElementById('kit-auth-level').value) || 0;
        // Items are already in this.currentKit.items with proper ids
        // Ensure ids are sequential (0..n-1)
        this.currentKit.items.forEach((item, idx) => { item.id = idx; });
        // Find original kit and replace
        const index = this.kits.findIndex(k => k.id === this.currentKit.id);
        if (index !== -1) this.kits[index] = this.currentKit;
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
            id: this.generateId(),
            name: this.currentKit.name + ' (Copy)',
            items: this.currentKit.items.map(item => ({ ...item }))
        };
        this.kits.push(newKit);
        this.saveKits();
        this.renderKitList();
        toast.success('Kit duplicated');
    }

    resetKit() {
        if (!this.currentKit) return;
        if (confirm('Reset kit to last saved version?')) {
            const original = this.kits.find(k => k.id === this.currentKit.id);
            if (original) {
                this.currentKit = { ...original, items: original.items.map(item => ({ ...item })) };
                this.renderEquipmentSlots(this.currentKit.items);
                document.getElementById('kit-name').value = this.currentKit.name;
                document.getElementById('kit-auth-level').value = this.currentKit.auth_level || 0;
                toast.info('Kit reset');
            }
        }
    }

    exportKits() {
        const dataStr = JSON.stringify({ kits: this.kits }, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `kits-export-${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        toast.success('Kits exported');
    }

    importKits() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    let importedKits = [];
                    if (data.kits && Array.isArray(data.kits)) {
                        importedKits = data.kits;
                    } else if (Array.isArray(data)) {
                        importedKits = data;
                    } else {
                        toast.error('Invalid format: expected array or object with kits array');
                        return;
                    }
                    const existingIds = new Set(this.kits.map(k => k.id));
                    importedKits.forEach(kit => {
                        if (existingIds.has(kit.id)) {
                            // Overwrite
                            const index = this.kits.findIndex(k => k.id === kit.id);
                            if (index !== -1) this.kits[index] = kit;
                        } else {
                            this.kits.push(kit);
                        }
                    });
                    this.saveKits();
                    this.renderKitList();
                    if (this.currentKit) this.loadKit(this.currentKit.id);
                    toast.success('Kits imported');
                } catch (err) {
                    toast.error('Invalid JSON');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    updateItemGallery() {
        const gallery = document.getElementById('item-gallery');
        if (!gallery || !window.itemsDatabase) return;

        let items = window.itemsDatabase;
        if (this.filterCategory !== 'all') {
            items = items.filter(item => item.category === this.filterCategory);
        }
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            items = items.filter(item => 
                item.name.toLowerCase().includes(query) || 
                item.shortname.toLowerCase().includes(query)
            );
        }
        items = items.slice(0, 200); // limit for performance

        gallery.innerHTML = items.map(item => {
            const imgUrl = `https://static.rustworkshop.xyz/icons/${item.shortname.replace(/\./g, '-')}.png`;
            return `
                <div class="gallery-item" data-shortname="${item.shortname}" style="padding: 5px; background: #2a2a2a; border-radius: 4px; cursor: pointer; text-align: center; border: 1px solid #444;">
                    <img src="${imgUrl}" style="width: 40px; height: 40px; object-fit: contain;" 
                         onerror="this.onerror=null; this.src='https://via.placeholder.com/40?text=?'">
                    <div style="font-size: 10px;">${item.name}</div>
                </div>
            `;
        }).join('');

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
        if (this.currentKit.items.find(item => item.container === container && item.slot === index)) {
            toast.error('Slot already occupied');
            return;
        }
        const amount = prompt('Quantity:', '1');
        if (!amount) return;
        const condition = prompt('Condition (0-100):', '100');
        const newItem = {
            id: this.currentKit.items.length,
            shortname,
            amount: parseInt(amount),
            container,
            slot: index,
            condition: parseInt(condition) || 100
        };
        this.currentKit.items.push(newItem);
        this.renderEquipmentSlots(this.currentKit.items);
        this.selectedSlot = null;
        document.querySelectorAll('.slot').forEach(slot => slot.style.borderColor = '#666');
    }

    openGiveModal(kitId) {
        const select = document.getElementById('give-kit-select');
        select.innerHTML = this.kits.map(k => 
            `<option value="${k.id}" ${k.id === parseInt(kitId) ? 'selected' : ''}>${k.name}</option>`
        ).join('');
        
        const playerSelect = document.getElementById('give-player-select');
        playerSelect.innerHTML = '<option value="">Select player...</option>';
        (AppState.players || []).forEach(p => {
            const playerName = p.name ? String(p.name) : 'Unknown';
            playerSelect.innerHTML += `<option value="${playerName}">${playerName}</option>`;
        });
        document.getElementById('give-kit-modal').classList.remove('hidden');
    }

    async giveKit() {
        const kitId = parseInt(document.getElementById('give-kit-select').value);
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
            document.getElementById('give-player-manual').value = '';
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