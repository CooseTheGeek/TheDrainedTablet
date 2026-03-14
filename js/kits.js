// kits.js – DRAINED TABLET ULTIMATE v7.0.0 (Overhauled to match screenshot)

class Kits {
    constructor() {
        this.access = window.accessControl;
        this.kits = this.loadKits();
        this.currentKit = null; // the kit being edited
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
            <div class="kits-container" style="display: flex; gap: 20px; padding: 20px;">
                <!-- Left panel: Kit list -->
                <div class="kits-left" style="width: 300px; background: var(--glass-bg); border-radius: 12px; padding: 15px;">
                    <h3>Build Kits</h3>
                    <button id="create-kit" class="kit-btn primary" style="width:100%; margin-bottom:15px;">+ New Kit</button>
                    <div id="kits-list" class="kits-list"></div>
                </div>

                <!-- Right panel: Kit editor -->
                <div class="kits-right" style="flex: 1; background: var(--glass-bg); border-radius: 12px; padding: 20px;">
                    <h2 id="kit-editor-title">Kit Editor</h2>
                    <div id="kit-editor" style="${this.currentKit ? 'display:block' : 'display:none'}">
                        <div class="kit-editor-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                            <!-- Left column -->
                            <div>
                                <div class="form-group">
                                    <label>Kit Name</label>
                                    <input type="text" id="kit-name" placeholder="e.g., Starter Kit">
                                </div>
                                <div class="form-group">
                                    <label>Version</label>
                                    <input type="text" id="kit-version" placeholder="1.0">
                                </div>
                                <div class="form-group">
                                    <label>Cooldown (seconds)</label>
                                    <input type="number" id="kit-cooldown" value="300" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Max Uses (0 = unlimited)</label>
                                    <input type="number" id="kit-max-uses" value="0" min="0">
                                </div>
                                <div class="form-group">
                                    <label>Automation Level</label>
                                    <select id="kit-automation">
                                        <option value="0">None</option>
                                        <option value="1">Low</option>
                                        <option value="2">Medium</option>
                                        <option value="3">High</option>
                                    </select>
                                </div>
                            </div>
                            <!-- Right column -->
                            <div>
                                <div class="form-group">
                                    <label>Inventory Sizes</label>
                                    <input type="text" id="kit-inventory-sizes" placeholder="e.g., belt=6, main=24, wear=5">
                                </div>
                                <div class="form-group">
                                    <label>Header Items</label>
                                    <textarea id="kit-header-items" placeholder="One item per line: shortname,amount,container"></textarea>
                                </div>
                                <div class="form-group">
                                    <label>General Customization</label>
                                    <textarea id="kit-general" placeholder="Any other settings as JSON"></textarea>
                                </div>
                            </div>
                        </div>

                        <!-- Player Equipment -->
                        <h3>Player Equipment</h3>
                        <div class="equipment-slots" style="display: flex; gap: 20px; margin: 15px 0;">
                            <div class="belt-slots">
                                <h4>Belt</h4>
                                <div id="belt-slots" class="slot-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;"></div>
                            </div>
                            <div class="main-slots">
                                <h4>Main</h4>
                                <div id="main-slots" class="slot-grid" style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 5px;"></div>
                            </div>
                            <div class="wear-slots">
                                <h4>Wear</h4>
                                <div id="wear-slots" class="slot-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 5px;"></div>
                            </div>
                        </div>

                        <!-- Item Search -->
                        <div class="item-search-area" style="margin: 15px 0;">
                            <h4>Add Item</h4>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="item-search" placeholder="Search items..." style="flex: 1;">
                                <button id="search-items-btn" class="kit-btn">Search</button>
                            </div>
                            <div id="item-search-results" class="item-search-results" style="max-height: 200px; overflow-y: auto; margin-top: 10px;"></div>
                        </div>

                        <!-- Team Selection -->
                        <h3>Team Selection</h3>
                        <div id="team-selection" class="team-grid" style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; margin: 10px 0;"></div>

                        <div style="display: flex; gap: 10px; margin-top: 20px;">
                            <button id="save-kit" class="kit-btn primary">Save & Continue</button>
                            <button id="cancel-edit" class="kit-btn">Cancel</button>
                        </div>
                    </div>
                    <div id="no-kit-selected" style="${this.currentKit ? 'display:none' : 'display:block'}; text-align: center; padding: 50px;">
                        <p>Select a kit or create a new one</p>
                    </div>
                </div>
            </div>
        `;

        this.renderKitList();
        this.initTeamSelection();
    }

    initTeamSelection() {
        // Generate 30 teams (A1 to A30)
        const container = document.getElementById('team-selection');
        if (!container) return;
        let html = '';
        for (let i = 1; i <= 30; i++) {
            html += `<label><input type="checkbox" class="team-checkbox" value="A${i}"> A${i}</label>`;
        }
        container.innerHTML = html;
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
                <div class="kit-list-item" data-id="${kit.id}" style="padding: 10px; margin-bottom: 5px; background: var(--bg-tertiary); border-radius: 5px; cursor: pointer;">
                    <strong>${kit.name}</strong> <span style="float:right;">v${kit.version || '1.0'}</span>
                </div>
            `;
        });
        listDiv.innerHTML = html;
        // Add click events
        listDiv.querySelectorAll('.kit-list-item').forEach(el => {
            el.addEventListener('click', () => this.loadKit(el.dataset.id));
        });
    }

    loadKit(id) {
        const kit = this.kits.find(k => k.id === id);
        if (!kit) return;
        this.currentKit = kit;
        document.getElementById('kit-editor').style.display = 'block';
        document.getElementById('no-kit-selected').style.display = 'none';
        document.getElementById('kit-name').value = kit.name || '';
        document.getElementById('kit-version').value = kit.version || '1.0';
        document.getElementById('kit-cooldown').value = kit.cooldown || 300;
        document.getElementById('kit-max-uses').value = kit.maxUses || 0;
        document.getElementById('kit-automation').value = kit.automation || 0;
        document.getElementById('kit-inventory-sizes').value = kit.inventorySizes || '';
        document.getElementById('kit-header-items').value = kit.headerItems || '';
        document.getElementById('kit-general').value = kit.general ? JSON.stringify(kit.general, null, 2) : '';

        // Populate equipment slots
        this.renderEquipmentSlots(kit.items || []);
        // Check teams
        document.querySelectorAll('.team-checkbox').forEach(cb => {
            cb.checked = (kit.teams || []).includes(cb.value);
        });
    }

    renderEquipmentSlots(items) {
        const belt = document.getElementById('belt-slots');
        const main = document.getElementById('main-slots');
        const wear = document.getElementById('wear-slots');
        if (!belt || !main || !wear) return;
        belt.innerHTML = '';
        main.innerHTML = '';
        wear.innerHTML = '';

        // Create empty slots
        for (let i = 0; i < 6; i++) belt.innerHTML += '<div class="slot empty" data-slot="belt" data-index="'+i+'"></div>';
        for (let i = 0; i < 24; i++) main.innerHTML += '<div class="slot empty" data-slot="main" data-index="'+i+'"></div>';
        for (let i = 0; i < 5; i++) wear.innerHTML += '<div class="slot empty" data-slot="wear" data-index="'+i+'"></div>';

        // Fill with items
        items.forEach(item => {
            const slotEl = document.querySelector(`[data-slot="${item.container}"][data-index="${item.slot}"]`);
            if (slotEl) {
                slotEl.innerHTML = `${item.shortname}<br><small>x${item.amount}</small>`;
                slotEl.classList.remove('empty');
                slotEl.dataset.shortname = item.shortname;
                slotEl.dataset.amount = item.amount;
                slotEl.dataset.condition = item.condition;
            }
        });
    }

    attachEvents() {
        document.getElementById('create-kit')?.addEventListener('click', () => this.createNewKit());
        document.getElementById('save-kit')?.addEventListener('click', () => this.saveCurrentKit());
        document.getElementById('cancel-edit')?.addEventListener('click', () => this.cancelEdit());
        document.getElementById('search-items-btn')?.addEventListener('click', () => this.searchItems());
        document.getElementById('item-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchItems();
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
        // Gather form data
        this.currentKit.name = document.getElementById('kit-name').value;
        this.currentKit.version = document.getElementById('kit-version').value;
        this.currentKit.cooldown = parseInt(document.getElementById('kit-cooldown').value) || 300;
        this.currentKit.maxUses = parseInt(document.getElementById('kit-max-uses').value) || 0;
        this.currentKit.automation = parseInt(document.getElementById('kit-automation').value) || 0;
        this.currentKit.inventorySizes = document.getElementById('kit-inventory-sizes').value;
        this.currentKit.headerItems = document.getElementById('kit-header-items').value;
        try {
            this.currentKit.general = JSON.parse(document.getElementById('kit-general').value || '{}');
        } catch {
            this.currentKit.general = {};
        }
        // Gather teams
        this.currentKit.teams = Array.from(document.querySelectorAll('.team-checkbox:checked')).map(cb => cb.value);
        // Items are already in this.currentKit.items (updated via add/remove)
        this.saveKits();
        this.renderKitList();
        toast.success('Kit saved');
    }

    cancelEdit() {
        this.currentKit = null;
        document.getElementById('kit-editor').style.display = 'none';
        document.getElementById('no-kit-selected').style.display = 'block';
    }

    searchItems() {
        const query = document.getElementById('item-search').value.toLowerCase();
        const resultsDiv = document.getElementById('item-search-results');
        if (!query || !window.itemsDatabase) {
            resultsDiv.innerHTML = '';
            return;
        }
        // Assuming itemsDatabase is an array of { shortname, name, category }
        const matches = window.itemsDatabase.filter(item => 
            item.name.toLowerCase().includes(query) || 
            item.shortname.toLowerCase().includes(query)
        ).slice(0, 20);
        resultsDiv.innerHTML = matches.map(item => 
            `<div class="search-result" data-shortname="${item.shortname}" style="padding: 5px; cursor: pointer; border-bottom: 1px solid #444;">${item.name} (${item.shortname})</div>`
        ).join('');
        resultsDiv.querySelectorAll('.search-result').forEach(el => {
            el.addEventListener('click', () => this.addItemToCurrentKit(el.dataset.shortname));
        });
    }

    addItemToCurrentKit(shortname) {
        if (!this.currentKit) return;
        const amount = prompt('Quantity:', '1');
        if (!amount) return;
        const container = prompt('Container (belt/main/wear):', 'belt');
        if (!container) return;
        const condition = prompt('Condition (0-100):', '100');
        const slot = this.findEmptySlot(container);
        if (slot === -1) {
            toast.error('No empty slot in that container');
            return;
        }
        this.currentKit.items.push({
            shortname,
            amount: parseInt(amount),
            container,
            slot,
            condition: parseInt(condition) || 100
        });
        this.renderEquipmentSlots(this.currentKit.items);
    }

    findEmptySlot(container) {
        const items = this.currentKit.items.filter(i => i.container === container);
        const max = container === 'belt' ? 6 : container === 'main' ? 24 : 5;
        for (let i = 0; i < max; i++) {
            if (!items.find(item => item.slot === i)) return i;
        }
        return -1;
    }

    refresh() {
        this.renderKitList();
        if (this.currentKit) this.loadKit(this.currentKit.id);
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.kits = new Kits();
});