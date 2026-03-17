// kits.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete kit manager with modern UI: search, categories, card grid, and full editor.
// All original functionality preserved and enhanced.

class Kits {
    constructor() {
        this.access = window.accessControl;
        this.kits = this.loadKits();
        this.currentKit = null;
        this.selectedSlot = null;
        this.filterCategory = 'all';
        this.searchQuery = '';
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
            if (e.detail.tab === 'kits') this.refresh();
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
            <div class="kits-container" style="display: flex; gap: 20px; padding: 20px; height: 100%; background: var(--bg-primary);">
                <!-- Left panel: Kit list with search and categories -->
                <div class="kits-left" style="width: 350px; background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; display: flex; flex-direction: column;">
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <input type="text" id="kit-search" placeholder="Search kits..." style="flex: 1; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                        <button id="create-kit" class="kit-btn primary" style="padding: 10px 20px; font-weight: 600;">+ ADD KIT</button>
                    </div>
                    <div class="kit-categories" style="display: flex; gap: 8px; margin-bottom: 15px; flex-wrap: wrap;">
                        <button class="kit-cat-btn active" data-cat="all">All</button>
                        <button class="kit-cat-btn" data-cat="user">User</button>
                        <button class="kit-cat-btn" data-cat="admin">Admin</button>
                        <button class="kit-cat-btn" data-cat="vip">VIP</button>
                    </div>
                    <div id="kits-list" class="kits-list" style="flex: 1; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; min-height: 0;"></div>
                </div>

                <!-- Right panel: Kit editor -->
                <div class="kits-right" style="flex: 1; background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; overflow-y: auto;">
                    <h2 id="kit-editor-title" style="color: var(--accent-primary); margin-bottom: 20px;">Kit Editor</h2>
                    <div id="kit-editor" style="display: none;">
                        <!-- Top bar: Name and Auth Level -->
                        <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                            <div style="flex: 2;">
                                <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Kit Name</label>
                                <input type="text" id="kit-name" class="form-control" placeholder="e.g., Starter Kit" style="width:100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                            </div>
                            <div style="flex: 1;">
                                <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Auth Level</label>
                                <input type="number" id="kit-auth-level" class="form-control" value="0" min="0" style="width:100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                            </div>
                        </div>

                        <!-- Action buttons -->
                        <div style="display: flex; gap: 10px; margin-bottom: 25px;">
                            <button id="copy-kit" class="kit-btn" style="padding: 8px 16px;">📋 Copy</button>
                            <button id="reset-kit" class="kit-btn" style="padding: 8px 16px;">↺ Reset</button>
                            <button id="sync-kit" class="kit-btn" style="padding: 8px 16px;">🔄 Sync to Server</button>
                        </div>

                        <!-- Category filter and search -->
                        <div style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Item Category</label>
                            <select id="item-category-filter" class="form-control" style="width: 100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                                <option value="all">All Categories</option>
                                ${this.getCategoryOptions()}
                            </select>
                        </div>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; margin-bottom: 5px; color: var(--text-secondary);">Search Items</label>
                            <input type="text" id="item-search" class="form-control" placeholder="e.g., 5 stone" style="width:100%; padding: 10px; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px;">
                        </div>

                        <!-- Item Gallery -->
                        <h4 style="color: var(--text-primary); margin-bottom: 10px;">Item Gallery</h4>
                        <div id="item-gallery" class="item-gallery" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; max-height: 250px; overflow-y: auto; background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 12px; padding: 15px; margin-bottom: 25px;"></div>

                        <!-- Equipment slots -->
                        <h4 style="color: var(--text-primary); margin-bottom: 15px;">Equipment</h4>
                        <div style="display: flex; gap: 30px; justify-content: space-between; margin-bottom: 30px;">
                            <div class="slot-section" style="text-align: center;">
                                <h5 style="color: var(--accent-primary); margin-bottom: 10px;">WEAR</h5>
                                <div id="wear-slots" class="slot-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"></div>
                            </div>
                            <div class="slot-section" style="text-align: center;">
                                <h5 style="color: var(--accent-primary); margin-bottom: 10px;">MAIN</h5>
                                <div id="main-slots" class="slot-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px;"></div>
                            </div>
                            <div class="slot-section" style="text-align: center;">
                                <h5 style="color: var(--accent-primary); margin-bottom: 10px;">BELT</h5>
                                <div id="belt-slots" class="slot-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;"></div>
                            </div>
                        </div>

                        <!-- Save/Cancel -->
                        <div style="display: flex; gap: 15px; justify-content: flex-end;">
                            <button id="save-kit" class="kit-btn primary" style="padding: 12px 24px;">💾 Save Kit</button>
                            <button id="cancel-edit" class="kit-btn" style="padding: 12px 24px;">✕ Cancel</button>
                        </div>
                    </div>
                    <div id="no-kit-selected" style="text-align: center; padding: 60px 20px; color: var(--text-secondary);">
                        <p>Select a kit from the left panel or create a new one.</p>
                    </div>
                </div>
            </div>

            <!-- Give Kit Modal -->
            <div id="give-kit-modal" class="modal hidden">
                <div class="modal-content" style="max-width: 400px;">
                    <h3 style="margin-bottom: 20px;">🎁 Give Kit</h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">Kit</label>
                        <select id="give-kit-select" class="form-control" style="width:100%; padding: 8px;"></select>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px;">Player</label>
                        <select id="give-player-select" class="form-control" style="width:100%; padding: 8px;">
                            <option value="">Select player...</option>
                        </select>
                        <input type="text" id="give-player-manual" class="form-control" placeholder="Or type player name" style="width:100%; padding: 8px; margin-top: 8px;">
                    </div>
                    <div class="modal-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button id="execute-give" class="kit-btn primary">Give</button>
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
        this.attachCategoryEvents();
    }

    getCategoryOptions() {
        const categories = ['Ammo','Weapons','Construction','Items','Resources','Attire','Tools','Medical','Food','Traps','Misc','Components','Electrical','Animals','Vehicles','Vehicle Parts','Seasonal'];
        return categories.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    attachCategoryEvents() {
        document.querySelectorAll('.kit-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.kit-cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterCategory = e.target.dataset.cat;
                this.renderKitList();
            });
        });
        document.getElementById('kit-search')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderKitList();
        });
    }

    renderKitList() {
        const list = document.getElementById('kits-list');
        if (!list) return;

        let filtered = this.kits;
        if (this.filterCategory !== 'all') {
            filtered = filtered.filter(k => {
                if (this.filterCategory === 'user') return k.auth_level === 0;
                if (this.filterCategory === 'vip') return k.auth_level === 1;
                if (this.filterCategory === 'admin') return k.auth_level >= 2;
                return true;
            });
        }
        if (this.searchQuery) {
            filtered = filtered.filter(k => k.name.toLowerCase().includes(this.searchQuery));
        }

        if (filtered.length === 0) {
            list.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No kits found</p>';
            return;
        }

        list.innerHTML = filtered.map(kit => `
            <div class="kit-card" data-id="${kit.id}" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 12px; padding: 12px; cursor: pointer; transition: 0.2s; display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; color: var(--text-primary);">${kit.name}</span>
                    <span style="font-size: 0.8rem; color: var(--accent-primary); background: rgba(212,175,55,0.2); padding: 2px 8px; border-radius: 12px;">${kit.auth_level === 0 ? 'User' : kit.auth_level === 1 ? 'VIP' : 'Admin'}</span>
                </div>
                <div style="display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="small-btn view-kit" data-id="${kit.id}" title="View">👁️</button>
                    <button class="small-btn give-kit" data-id="${kit.id}" title="Give">🎁</button>
                    <button class="small-btn delete-kit" data-id="${kit.id}" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');

        // Edit on click (excluding buttons)
        list.querySelectorAll('.kit-card').forEach(el => {
            el.addEventListener('click', (e) => {
                if (e.target.classList.contains('small-btn')) return;
                this.loadKit(el.dataset.id);
            });
        });
        list.querySelectorAll('.view-kit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.viewKit(btn.dataset.id);
            });
        });
        list.querySelectorAll('.give-kit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.openGiveModal(btn.dataset.id);
            });
        });
        list.querySelectorAll('.delete-kit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteKit(btn.dataset.id);
            });
        });
    }

    viewKit(id) {
        const kit = this.kits.find(k => k.id == id);
        if (!kit) return;
        let html = '<table style="width:100%; border-collapse: collapse;"><tr><th>Shortname</th><th>Amount</th><th>Container</th><th>Condition</th></tr>';
        (kit.items || []).forEach(item => {
            html += `<tr><td>${item.shortname}</td><td>${item.amount}</td><td>${item.container}</td><td>${item.condition}</td></tr>`;
        });
        html += '</table>';
        document.getElementById('view-kit-title').innerText = kit.name;
        document.getElementById('view-kit-items').innerHTML = html;
        document.getElementById('view-kit-modal').classList.remove('hidden');
        document.getElementById('close-view').onclick = () => {
            document.getElementById('view-kit-modal').classList.add('hidden');
        };
    }

    deleteKit(id) {
        if (!confirm('Are you sure you want to delete this kit?')) return;
        console.log('Deleting kit ID:', id);
        this.kits = this.kits.filter(k => k.id != id);
        this.saveKits();
        if (this.currentKit && this.currentKit.id == id) {
            this.currentKit = null;
            document.getElementById('kit-editor').style.display = 'none';
            document.getElementById('no-kit-selected').style.display = 'block';
        }
        this.renderKitList();
        toast.info('Kit deleted');
    }

    loadKit(id) {
        const kit = this.kits.find(k => k.id == id);
        if (!kit) return;
        this.currentKit = JSON.parse(JSON.stringify(kit));
        this.selectedSlot = null;
        document.getElementById('kit-editor').style.display = 'block';
        document.getElementById('no-kit-selected').style.display = 'none';
        document.getElementById('kit-name').value = this.currentKit.name || '';
        document.getElementById('kit-auth-level').value = this.currentKit.auth_level || 0;
        this.renderEquipmentSlots(this.currentKit.items || []);
        this.updateItemGallery();
    }

    renderEquipmentSlots(items) {
        const belt = document.getElementById('belt-slots');
        const main = document.getElementById('main-slots');
        const wear = document.getElementById('wear-slots');
        if (!belt || !main || !wear) return;

        [belt, main, wear].forEach(grid => grid.innerHTML = '');

        const createSlot = (container, index, item) => {
            const div = document.createElement('div');
            div.style.width = '60px';
            div.style.height = '60px';
            div.style.background = 'var(--bg-tertiary)';
            div.style.border = '2px solid var(--glass-border)';
            div.style.borderRadius = '8px';
            div.style.display = 'flex';
            div.style.flexDirection = 'column';
            div.style.alignItems = 'center';
            div.style.justifyContent = 'center';
            div.style.cursor = 'pointer';
            div.style.transition = '0.2s';
            div.dataset.container = container;
            div.dataset.index = index;
            if (item) {
                const imgUrl = `https://static.rustworkshop.xyz/icons/${item.shortname.replace(/\./g, '-')}.png`;
                div.innerHTML = `
                    <img src="${imgUrl}" style="width: 30px; height: 30px; object-fit: contain;" onerror="this.onerror=null; this.src='https://via.placeholder.com/30?text=?'">
                    <span style="font-size: 9px;">x${item.amount}</span>
                `;
                div.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.removeItem(container, index);
                });
            } else {
                div.innerHTML = '<span style="opacity:0.3;">□</span>';
            }
            div.addEventListener('click', () => this.selectSlot(container, index));
            return div;
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
        document.querySelectorAll('.slot-grid > div').forEach(div => div.style.borderColor = 'var(--glass-border)');
        const sel = document.querySelector(`[data-container="${container}"][data-index="${index}"]`);
        if (sel) {
            sel.style.borderColor = 'var(--accent-primary)';
            this.selectedSlot = { container, index };
        }
    }

    removeItem(container, index) {
        if (!this.currentKit) return;
        this.currentKit.items = this.currentKit.items.filter(it => !(it.container === container && it.slot === index));
        this.renderEquipmentSlots(this.currentKit.items);
    }

    attachEvents() {
        document.getElementById('create-kit')?.addEventListener('click', () => this.createNewKit());
        document.getElementById('save-kit')?.addEventListener('click', () => this.saveCurrentKit());
        document.getElementById('cancel-edit')?.addEventListener('click', () => this.cancelEdit());
        document.getElementById('copy-kit')?.addEventListener('click', () => this.copyKit());
        document.getElementById('reset-kit')?.addEventListener('click', () => this.resetKit());
        document.getElementById('sync-kit')?.addEventListener('click', () => this.syncKitToServer(this.currentKit));
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
    }

    createNewKit() {
        const newKit = {
            id: Date.now(),
            name: 'New Kit',
            items: [],
            auth_level: 0
        };
        this.kits.push(newKit);
        this.saveKits();
        this.renderKitList();
        this.loadKit(newKit.id);
    }

    saveCurrentKit() {
        if (!this.currentKit) return;
        this.currentKit.name = document.getElementById('kit-name').value;
        this.currentKit.auth_level = parseInt(document.getElementById('kit-auth-level').value) || 0;
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
            id: Date.now(),
            name: this.currentKit.name + ' (Copy)',
            items: this.currentKit.items.map(i => ({ ...i }))
        };
        this.kits.push(newKit);
        this.saveKits();
        this.renderKitList();
        toast.success('Kit duplicated');
    }

    resetKit() {
        if (!this.currentKit) return;
        if (confirm('Reset kit to last saved version?')) {
            const orig = this.kits.find(k => k.id === this.currentKit.id);
            if (orig) {
                this.currentKit = JSON.parse(JSON.stringify(orig));
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
                    if (data.kits && Array.isArray(data.kits)) importedKits = data.kits;
                    else if (Array.isArray(data)) importedKits = data;
                    else { toast.error('Invalid format'); return; }
                    const existingIds = new Set(this.kits.map(k => k.id));
                    importedKits.forEach(kit => {
                        if (existingIds.has(kit.id)) {
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
            items = items.filter(i => i.category === this.filterCategory);
        }
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            items = items.filter(i => i.name.toLowerCase().includes(q) || i.shortname.toLowerCase().includes(q));
        }
        items = items.slice(0, 100);
        gallery.innerHTML = items.map(item => {
            const imgUrl = `https://static.rustworkshop.xyz/icons/${item.shortname.replace(/\./g, '-')}.png`;
            return `
                <div class="gallery-item" data-shortname="${item.shortname}" style="background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 8px; padding: 8px; cursor: pointer; text-align: center; transition: 0.2s;">
                    <img src="${imgUrl}" style="width: 40px; height: 40px; object-fit: contain;" onerror="this.onerror=null; this.src='https://via.placeholder.com/40?text=?'">
                    <div style="font-size: 10px; margin-top: 4px; color: var(--text-primary);">${item.name}</div>
                </div>
            `;
        }).join('');
        gallery.querySelectorAll('.gallery-item').forEach(el => {
            el.addEventListener('click', () => this.addItemToSlot(el.dataset.shortname));
        });
    }

    addItemToSlot(shortname) {
        if (!this.currentKit) { toast.error('Select a kit first'); return; }
        if (!this.selectedSlot) { toast.error('Select a slot first'); return; }
        const { container, index } = this.selectedSlot;
        if (this.currentKit.items.find(it => it.container === container && it.slot === index)) {
            toast.error('Slot already occupied');
            return;
        }
        const amount = prompt('Quantity:', '1');
        if (!amount) return;
        const condition = prompt('Condition (0-100):', '100');
        this.currentKit.items.push({
            id: this.currentKit.items.length,
            shortname,
            amount: parseInt(amount),
            container,
            slot: index,
            condition: parseInt(condition) || 100
        });
        this.renderEquipmentSlots(this.currentKit.items);
        this.selectedSlot = null;
        document.querySelectorAll('.slot-grid > div').forEach(div => div.style.borderColor = 'var(--glass-border)');
    }

    openGiveModal(kitId) {
        const select = document.getElementById('give-kit-select');
        select.innerHTML = this.kits.map(k => `<option value="${k.id}">${k.name}</option>`).join('');
        select.value = kitId;

        const playerSelect = document.getElementById('give-player-select');
        playerSelect.innerHTML = '<option value="">Select player...</option>';
        (AppState.players || []).forEach(p => {
            const name = p.name ? String(p.name) : 'Unknown';
            playerSelect.innerHTML += `<option value="${name}">${name}</option>`;
        });

        document.getElementById('give-kit-modal').classList.remove('hidden');
    }

    async giveKit() {
        const kitId = parseInt(document.getElementById('give-kit-select').value);
        const target = document.getElementById('give-player-select').value || document.getElementById('give-player-manual').value.trim();
        if (!target) { toast.error('Enter a player name'); return; }

        const kit = this.kits.find(k => k.id === kitId);
        if (!kit) return;

        // Try to give the kit
        const giveCommand = `kit give "${target}" "${kit.name}"`;
        console.log('Attempting give command:', giveCommand);

        try {
            const result = await ConnectionManager.executeCommand(giveCommand);
            console.log('Give command result:', result);

            if (result && (result.toLowerCase().includes('not found') || result.toLowerCase().includes('does not exist'))) {
                toast.info(`Kit "${kit.name}" not found on server. Creating it now...`);
                await this.createKitOnServer(kit);
                const retryResult = await ConnectionManager.executeCommand(giveCommand);
                toast.success(`Gave kit ${kit.name} to ${target}`);
            } else {
                toast.success(`Gave kit ${kit.name} to ${target}`);
            }
            document.getElementById('give-kit-modal').classList.add('hidden');
            document.getElementById('give-player-manual').value = '';
        } catch (err) {
            console.warn('Primary give command failed, trying alternatives...', err);
            const alternatives = [
                `kit.give "${target}" "${kit.name}"`,
                `givekit "${target}" "${kit.name}"`,
                `kit.giveplayer "${target}" "${kit.name}"`
            ];
            for (const altCmd of alternatives) {
                try {
                    const altResult = await ConnectionManager.executeCommand(altCmd);
                    if (altResult && (altResult.toLowerCase().includes('not found') || altResult.toLowerCase().includes('does not exist'))) {
                        toast.info(`Kit "${kit.name}" not found on server. Creating it now...`);
                        await this.createKitOnServer(kit);
                        await ConnectionManager.executeCommand(altCmd);
                        toast.success(`Gave kit ${kit.name} to ${target}`);
                        document.getElementById('give-kit-modal').classList.add('hidden');
                        document.getElementById('give-player-manual').value = '';
                        return;
                    } else {
                        toast.success(`Gave kit ${kit.name} to ${target}`);
                        document.getElementById('give-kit-modal').classList.add('hidden');
                        document.getElementById('give-player-manual').value = '';
                        return;
                    }
                } catch (altErr) {
                    // continue
                }
            }
            toast.error('All command attempts failed. Check server plugin.');
        }
    }

    async syncKitToServer(kit) {
        if (!kit) { toast.error('No kit selected'); return; }
        toast.info(`Syncing kit "${kit.name}" to server...`);
        await this.createKitOnServer(kit);
        toast.success(`Kit "${kit.name}" synced to server`);
    }

    async createKitOnServer(kit) {
        try {
            await ConnectionManager.executeCommand(`kit remove "${kit.name}"`);
        } catch (e) {
            // ignore
        }

        for (const item of kit.items || []) {
            const container = item.container.toLowerCase();
            const addCmd = `kit add "${kit.name}" "${item.shortname}" ${item.amount} ${item.condition} ${container}`;
            console.log('Sending kit add:', addCmd);
            try {
                await ConnectionManager.executeCommand(addCmd);
                await new Promise(resolve => setTimeout(resolve, 100));
            } catch (err) {
                console.error(`Failed to add item ${item.shortname} to kit:`, err);
            }
        }
    }

    refresh() {
        this.renderKitList();
        if (this.currentKit) this.loadKit(this.currentKit.id);
        this.updateItemGallery();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.kits = new Kits();
});