// INVENTORY MANAGEMENT - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class InventoryManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.defaultItems = this.loadDefaultItems();
        this.init();
    }

    loadDefaultItems() {
        const saved = localStorage.getItem('drained_default_items');
        return saved ? JSON.parse(saved) : [];
    }

    saveDefaultItems() {
        localStorage.setItem('drained_default_items', JSON.stringify(this.defaultItems));
    }

    init() {
        this.createInventoryHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'inventory') {
                this.refresh();
            }
        });
    }

    createInventoryHTML() {
        const invTab = document.getElementById('tab-inventory');
        if (!invTab) return;

        invTab.innerHTML = `
            <div class="inventory-container">
                <div class="inventory-header">
                    <h2>🎒 INVENTORY MANAGER</h2>
                    <div class="inv-controls">
                        <button id="refresh-inv" class="inv-btn">🔄 REFRESH</button>
                    </div>
                </div>

                <div class="inventory-grid">
                    <!-- Give Items -->
                    <div class="inv-section">
                        <h3>GIVE ITEMS</h3>
                        
                        <div class="form-group">
                            <label>Player:</label>
                            <input type="text" id="give-player" placeholder="Player name or ID">
                        </div>
                        
                        <div class="form-group">
                            <label>Item:</label>
                            <input type="text" id="give-item" placeholder="Item shortname">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Quantity:</label>
                                <input type="number" id="give-quantity" value="1" min="1">
                            </div>
                            <div class="form-group">
                                <label>Condition:</label>
                                <input type="number" id="give-condition" value="100" min="0" max="100">
                            </div>
                        </div>
                        
                        <div class="button-group">
                            <button id="give-self" class="inv-btn">GIVE TO SELF</button>
                            <button id="give-player-btn" class="inv-btn">GIVE TO PLAYER</button>
                            <button id="give-all" class="inv-btn">GIVE TO ALL</button>
                        </div>
                    </div>

                    <!-- Take Items -->
                    <div class="inv-section">
                        <h3>TAKE ITEMS</h3>
                        
                        <div class="form-group">
                            <label>Player:</label>
                            <input type="text" id="take-player" placeholder="Player name or ID">
                        </div>
                        
                        <div class="form-group">
                            <label>Slot Type:</label>
                            <select id="take-slot-type">
                                <option value="belt">Belt</option>
                                <option value="main">Main</option>
                                <option value="wear">Wear</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Slot Number:</label>
                            <input type="number" id="take-slot" min="0" max="30" value="0">
                        </div>
                        
                        <div class="form-group">
                            <label>Quantity:</label>
                            <input type="number" id="take-quantity" value="1" min="1">
                        </div>
                        
                        <button id="take-item" class="inv-btn warning">TAKE ITEM</button>
                    </div>

                    <!-- Default Items -->
                    <div class="inv-section">
                        <h3>DEFAULT SPAWN ITEMS</h3>
                        
                        <div class="form-group">
                            <label>Add Item:</label>
                            <input type="text" id="default-item" placeholder="Item shortname">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>Quantity:</label>
                                <input type="number" id="default-quantity" value="1" min="1">
                            </div>
                            <div class="form-group">
                                <label>Container:</label>
                                <select id="default-container">
                                    <option value="belt">Belt</option>
                                    <option value="main">Main</option>
                                    <option value="wear">Wear</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="button-group">
                            <button id="add-default" class="inv-btn">ADD DEFAULT</button>
                            <button id="clear-default" class="inv-btn warning">CLEAR ALL</button>
                        </div>

                        <h4 style="margin-top: 20px;">CURRENT DEFAULTS</h4>
                        <div id="default-items-list" class="default-list"></div>
                    </div>

                    <!-- Blueprints -->
                    <div class="inv-section">
                        <h3>BLUEPRINTS</h3>
                        
                        <div class="button-group">
                            <button id="unlock-all" class="inv-btn">🔓 UNLOCK ALL</button>
                            <button id="reset-bp" class="inv-btn warning">🔄 RESET ALL</button>
                        </div>
                        
                        <div class="form-group" style="margin-top: 15px;">
                            <label>Add Blueprint:</label>
                            <input type="text" id="add-bp" placeholder="Item shortname">
                            <button id="add-bp-btn" class="inv-btn small" style="margin-top: 5px;">ADD</button>
                        </div>
                        
                        <div class="form-group">
                            <label>Remove Blueprint:</label>
                            <input type="text" id="remove-bp" placeholder="Item shortname">
                            <button id="remove-bp-btn" class="inv-btn small" style="margin-top: 5px;">REMOVE</button>
                        </div>
                    </div>
                </div>

                <!-- Item Database Quick Reference -->
                <div class="item-reference">
                    <h3>📚 QUICK ITEM REFERENCE</h3>
                    <input type="text" id="item-search" placeholder="Search items...">
                    <div id="item-results" class="item-results"></div>
                </div>
            </div>
        `;

        this.renderDefaultItems();
        this.setupItemSearch();
    }

    setupEventListeners() {
        document.getElementById('refresh-inv')?.addEventListener('click', () => this.refresh());
        
        // Give buttons
        document.getElementById('give-self')?.addEventListener('click', () => this.giveToSelf());
        document.getElementById('give-player-btn')?.addEventListener('click', () => this.giveToPlayer());
        document.getElementById('give-all')?.addEventListener('click', () => this.giveToAll());
        
        // Take button
        document.getElementById('take-item')?.addEventListener('click', () => this.takeItem());
        
        // Default items
        document.getElementById('add-default')?.addEventListener('click', () => this.addDefaultItem());
        document.getElementById('clear-default')?.addEventListener('click', () => this.clearDefaultItems());
        
        // Blueprints
        document.getElementById('unlock-all')?.addEventListener('click', () => this.unlockAllBlueprints());
        document.getElementById('reset-bp')?.addEventListener('click', () => this.resetBlueprints());
        document.getElementById('add-bp-btn')?.addEventListener('click', () => this.addBlueprint());
        document.getElementById('remove-bp-btn')?.addEventListener('click', () => this.removeBlueprint());
        
        // Item search
        document.getElementById('item-search')?.addEventListener('input', (e) => {
            this.searchItems(e.target.value);
        });
    }

    giveToSelf() {
        const item = document.getElementById('give-item').value;
        const quantity = document.getElementById('give-quantity').value;
        const condition = document.getElementById('give-condition').value;

        if (!item) {
            this.tablet.showError('Enter an item');
            return;
        }

        this.tablet.showToast(`Gave yourself ${quantity}x ${item}`, 'success');
        this.addToHistory(`give ${item} ${quantity}`);
    }

    giveToPlayer() {
        const player = document.getElementById('give-player').value;
        const item = document.getElementById('give-item').value;
        const quantity = document.getElementById('give-quantity').value;

        if (!player || !item) {
            this.tablet.showError('Enter player and item');
            return;
        }

        this.tablet.showToast(`Gave ${player} ${quantity}x ${item}`, 'success');
        this.addToHistory(`give ${player} ${item} ${quantity}`);
    }

    giveToAll() {
        const item = document.getElementById('give-item').value;
        const quantity = document.getElementById('give-quantity').value;

        if (!item) {
            this.tablet.showError('Enter an item');
            return;
        }

        this.tablet.showToast(`Gave all players ${quantity}x ${item}`, 'success');
        this.addToHistory(`giveall ${item} ${quantity}`);
    }

    takeItem() {
        const player = document.getElementById('take-player').value;
        const slotType = document.getElementById('take-slot-type').value;
        const slot = document.getElementById('take-slot').value;
        const quantity = document.getElementById('take-quantity').value;

        if (!player) {
            this.tablet.showError('Enter player name');
            return;
        }

        this.tablet.showToast(`Took item from ${player}`, 'info');
        this.addToHistory(`take ${player} ${slotType} ${slot} ${quantity}`);
    }

    addDefaultItem() {
        const item = document.getElementById('default-item').value;
        const quantity = document.getElementById('default-quantity').value;
        const container = document.getElementById('default-container').value;

        if (!item) {
            this.tablet.showError('Enter an item');
            return;
        }

        this.defaultItems.push({ item, quantity, container });
        this.saveDefaultItems();
        this.renderDefaultItems();
        this.tablet.showToast(`Added ${item} to default items`, 'success');
    }

    clearDefaultItems() {
        this.tablet.showConfirm('Clear all default items?', (confirmed) => {
            if (confirmed) {
                this.defaultItems = [];
                this.saveDefaultItems();
                this.renderDefaultItems();
                this.tablet.showToast('Default items cleared', 'info');
            }
        });
    }

    renderDefaultItems() {
        const container = document.getElementById('default-items-list');
        
        if (this.defaultItems.length === 0) {
            container.innerHTML = '<div class="no-items">No default items</div>';
            return;
        }

        container.innerHTML = this.defaultItems.map(item => `
            <div class="default-item">
                <span>${item.item} x${item.quantity} (${item.container})</span>
                <button class="remove-default small-btn" data-item="${item.item}">✕</button>
            </div>
        `).join('');

        // Add remove handlers
        container.querySelectorAll('.remove-default').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = btn.dataset.item;
                this.defaultItems = this.defaultItems.filter(i => i.item !== item);
                this.saveDefaultItems();
                this.renderDefaultItems();
                this.tablet.showToast(`Removed ${item}`, 'info');
            });
        });
    }

    unlockAllBlueprints() {
        this.tablet.showConfirm('Unlock all blueprints for all players?', (confirmed) => {
            if (confirmed) {
                this.tablet.showToast('All blueprints unlocked', 'success');
                this.addToHistory('blueprints.unlockall');
            }
        });
    }

    resetBlueprints() {
        this.tablet.showConfirm('Reset all blueprints for all players?', (confirmed) => {
            if (confirmed) {
                this.tablet.showToast('Blueprints reset', 'info');
                this.addToHistory('blueprints.reset');
            }
        });
    }

    addBlueprint() {
        const bp = document.getElementById('add-bp').value;
        if (bp) {
            this.tablet.showToast(`Added blueprint: ${bp}`, 'success');
            this.addToHistory(`blueprint.add ${bp}`);
        }
    }

    removeBlueprint() {
        const bp = document.getElementById('remove-bp').value;
        if (bp) {
            this.tablet.showToast(`Removed blueprint: ${bp}`, 'info');
            this.addToHistory(`blueprint.remove ${bp}`);
        }
    }

    setupItemSearch() {
        // Would integrate with items database
    }

    searchItems(query) {
        if (!query) {
            document.getElementById('item-results').innerHTML = '';
            return;
        }

        // Mock results
        const results = [
            'rifle.ak - Assault Rifle',
            'bolt.rifle - Bolt Action Rifle',
            'pistol.python - Python Revolver',
            'explosive.timed - C4'
        ].filter(item => item.toLowerCase().includes(query.toLowerCase()));

        const container = document.getElementById('item-results');
        container.innerHTML = results.map(r => `<div class="item-result">${r}</div>`).join('');
    }

    addToHistory(command) {
        // Would add to command history
    }

    refresh() {
        this.renderDefaultItems();
        this.tablet.showToast('Inventory manager refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryManager = new InventoryManager(window.drainedTablet);
});