// INVENTORY VIEWER - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class InventoryViewer {
    constructor(tablet) {
        this.tablet = tablet;
        this.currentPlayer = null;
        this.inventory = {
            belt: new Array(6).fill(null),
            main: new Array(24).fill(null),
            wear: new Array(5).fill(null)
        };
        this.autoRefresh = true;
        this.refreshInterval = null;
        this.init();
    }

    init() {
        this.createViewerHTML();
        this.setupEventListeners();
        this.startAutoRefresh();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'inventoryViewer') {
                this.refresh();
            }
        });
    }

    createViewerHTML() {
        const viewerTab = document.getElementById('tab-inventoryViewer');
        if (!viewerTab) return;

        viewerTab.innerHTML = `
            <div class="inventory-viewer-container">
                <div class="viewer-header">
                    <h2>👁️ LIVE INVENTORY VIEWER</h2>
                    <div class="viewer-controls">
                        <div class="player-selector">
                            <input type="text" id="inv-player-search" placeholder="Enter player name...">
                            <button id="inv-load-player" class="viewer-btn">LOAD</button>
                        </div>
                        <button id="inv-refresh" class="viewer-btn">🔄 REFRESH</button>
                        <button id="inv-auto" class="viewer-btn active">⏱️ AUTO</button>
                    </div>
                </div>

                <div class="inventory-display">
                    <div class="inventory-section">
                        <h3>BELT SLOTS (6)</h3>
                        <div class="slot-grid belt-grid" id="belt-slots"></div>
                    </div>

                    <div class="inventory-section">
                        <h3>MAIN INVENTORY (24)</h3>
                        <div class="slot-grid main-grid" id="main-slots"></div>
                    </div>

                    <div class="inventory-section">
                        <h3>WEAR SLOTS (5)</h3>
                        <div class="slot-grid wear-grid" id="wear-slots"></div>
                    </div>
                </div>

                <div class="inventory-stats">
                    <div class="stat-row">
                        <span>Selected Player:</span>
                        <span id="inv-current-player">None</span>
                    </div>
                    <div class="stat-row">
                        <span>Last Updated:</span>
                        <span id="inv-last-update">-</span>
                    </div>
                    <div class="stat-row">
                        <span>Total Items:</span>
                        <span id="inv-total-items">0</span>
                    </div>
                </div>

                <!-- Item Details Modal -->
                <div id="item-detail-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3 id="detail-item-name">Item Details</h3>
                        <div class="item-details">
                            <div class="detail-row">
                                <span>Shortname:</span>
                                <span id="detail-shortname">-</span>
                            </div>
                            <div class="detail-row">
                                <span>Quantity:</span>
                                <span id="detail-quantity">-</span>
                            </div>
                            <div class="detail-row">
                                <span>Condition:</span>
                                <span id="detail-condition">-</span>
                            </div>
                            <div class="detail-row">
                                <span>Slot:</span>
                                <span id="detail-slot">-</span>
                            </div>
                        </div>
                        <div class="modal-actions">
                            <button id="close-detail" class="viewer-btn">CLOSE</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderInventory();
    }

    setupEventListeners() {
        document.getElementById('inv-load-player')?.addEventListener('click', () => this.loadPlayer());
        document.getElementById('inv-player-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.loadPlayer();
        });

        document.getElementById('inv-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('inv-auto')?.addEventListener('click', (e) => this.toggleAutoRefresh(e));
        document.getElementById('close-detail')?.addEventListener('click', () => {
            document.getElementById('item-detail-modal').classList.add('hidden');
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('inventory-slot')) {
                const slotData = e.target.dataset;
                this.showItemDetails(slotData);
            }
        });
    }

    loadPlayer() {
        const playerName = document.getElementById('inv-player-search').value.trim();
        if (!playerName) {
            this.tablet.showError('Enter player name');
            return;
        }

        this.currentPlayer = playerName;
        document.getElementById('inv-current-player').innerText = playerName;
        this.loadInventory(playerName);
    }

    loadInventory(playerName) {
        // Mock inventory data
        this.inventory = {
            belt: [
                { name: 'AK-47', shortname: 'rifle.ak', quantity: 1, condition: 100 },
                { name: 'Bolt Rifle', shortname: 'rifle.bolt', quantity: 1, condition: 98 },
                { name: 'Med Syringe', shortname: 'syringe.medical', quantity: 5, condition: 100 },
                { name: 'Bandage', shortname: 'bandage', quantity: 10, condition: 100 },
                { name: 'C4', shortname: 'explosive.timed', quantity: 2, condition: 100 },
                null
            ],
            main: [
                { name: 'Stone', shortname: 'stones', quantity: 3000, condition: 100 },
                { name: 'Metal Fragments', shortname: 'metal.fragments', quantity: 2000, condition: 100 },
                { name: 'Wood', shortname: 'wood', quantity: 5000, condition: 100 },
                { name: 'Sulfur', shortname: 'sulfur', quantity: 1200, condition: 100 },
                { name: 'HQM', shortname: 'metal.refined', quantity: 200, condition: 100 },
                null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
            ],
            wear: [
                { name: 'Metal Facemask', shortname: 'metal.facemask', quantity: 1, condition: 100 },
                { name: 'Metal Chest Plate', shortname: 'metal.plate.torso', quantity: 1, condition: 95 },
                { name: 'Roadsign Kilt', shortname: 'roadsign.kilt', quantity: 1, condition: 90 },
                { name: 'Boots', shortname: 'shoes.boots', quantity: 1, condition: 85 },
                { name: 'Tactical Gloves', shortname: 'tactical.gloves', quantity: 1, condition: 88 }
            ]
        };

        this.renderInventory();
        this.updateStats();
        this.tablet.showToast(`Loaded inventory for ${playerName}`, 'success');
    }

    renderInventory() {
        // Render belt slots
        const beltContainer = document.getElementById('belt-slots');
        beltContainer.innerHTML = this.inventory.belt.map((item, index) => this.createSlotHTML(item, 'belt', index)).join('');

        // Render main slots
        const mainContainer = document.getElementById('main-slots');
        mainContainer.innerHTML = this.inventory.main.map((item, index) => this.createSlotHTML(item, 'main', index)).join('');

        // Render wear slots
        const wearContainer = document.getElementById('wear-slots');
        wearContainer.innerHTML = this.inventory.wear.map((item, index) => this.createSlotHTML(item, 'wear', index)).join('');
    }

    createSlotHTML(item, section, index) {
        if (!item) {
            return `
                <div class="inventory-slot empty" data-section="${section}" data-index="${index}">
                    <div class="slot-content">EMPTY</div>
                </div>
            `;
        }

        return `
            <div class="inventory-slot" 
                 data-section="${section}" 
                 data-index="${index}"
                 data-name="${item.name}"
                 data-shortname="${item.shortname}"
                 data-quantity="${item.quantity}"
                 data-condition="${item.condition}">
                <div class="slot-content">
                    <div class="item-name">${item.name}</div>
                    <div class="item-meta">
                        <span class="item-quantity">x${item.quantity}</span>
                        <span class="item-condition">${item.condition}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    showItemDetails(data) {
        if (!data.name) return;

        document.getElementById('detail-item-name').innerText = data.name;
        document.getElementById('detail-shortname').innerText = data.shortname;
        document.getElementById('detail-quantity').innerText = data.quantity;
        document.getElementById('detail-condition').innerText = data.condition + '%';
        document.getElementById('detail-slot').innerText = `${data.section} slot ${parseInt(data.index) + 1}`;
        
        document.getElementById('item-detail-modal').classList.remove('hidden');
    }

    updateStats() {
        const totalItems = this.inventory.belt.filter(i => i).length + 
                          this.inventory.main.filter(i => i).length + 
                          this.inventory.wear.filter(i => i).length;
        
        document.getElementById('inv-total-items').innerText = totalItems;
        document.getElementById('inv-last-update').innerText = new Date().toLocaleTimeString();
    }

    toggleAutoRefresh(e) {
        this.autoRefresh = !this.autoRefresh;
        e.target.classList.toggle('active');
        
        if (this.autoRefresh) {
            this.startAutoRefresh();
            this.tablet.showToast('Auto-refresh enabled', 'success');
        } else {
            this.stopAutoRefresh();
            this.tablet.showToast('Auto-refresh disabled', 'info');
        }
    }

    startAutoRefresh() {
        this.stopAutoRefresh();
        this.refreshInterval = setInterval(() => {
            if (this.autoRefresh && this.currentPlayer) {
                this.loadInventory(this.currentPlayer);
            }
        }, 5000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    refresh() {
        if (this.currentPlayer) {
            this.loadInventory(this.currentPlayer);
        } else {
            this.tablet.showToast('No player selected', 'info');
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryViewer = new InventoryViewer(window.drainedTablet);
});