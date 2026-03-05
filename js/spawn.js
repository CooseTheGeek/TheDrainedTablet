// SPAWN MANAGER - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class SpawnManager {
    constructor(tablet) {
        this.tablet = tablet;
        this.spawnHistory = this.loadHistory();
        this.spawnCategories = {
            crates: [
                { name: 'Ammo Crate', shortname: 'crate_ammunition', icon: '📦' },
                { name: 'Medical Crate', shortname: 'crate_medical', icon: '💊' },
                { name: 'Heli Crate', shortname: 'heli_crate', icon: '🚁' },
                { name: 'Bradley Crate', shortname: 'bradley_crate', icon: '💥' },
                { name: 'Locked Crate', shortname: 'codelock', icon: '🔒' },
                { name: 'Elite Crate', shortname: 'crate_elite', icon: '👑' },
                { name: 'Supply Drop', shortname: 'supply_drop', icon: '📡' },
                { name: 'Military Crate', shortname: 'crate_normal', icon: '🔫' },
                { name: 'Tool Box', shortname: 'crate_tools', icon: '🔧' },
                { name: 'Food Crate', shortname: 'crate_normal_2_food', icon: '🍖' }
            ],
            keycards: [
                { name: 'Blue Keycard', shortname: 'keycard_blue', icon: '🔵' },
                { name: 'Green Keycard', shortname: 'keycard_green', icon: '🟢' },
                { name: 'Red Keycard', shortname: 'keycard_red', icon: '🔴' }
            ],
            barrels: [
                { name: 'Blue Barrel', shortname: 'loot_barrel_1', icon: '🛢️' },
                { name: 'White Barrel', shortname: 'loot_barrel_2', icon: '🛢️' }
            ],
            nodes: [
                { name: 'Metal Node', shortname: 'metal-ore', icon: '⛓️' },
                { name: 'Stone Node', shortname: 'stone-ore', icon: '🪨' },
                { name: 'Sulfur Node', shortname: 'sulfur-ore', icon: '🟡' }
            ],
            vehicles: [
                { name: 'Minicopter', shortname: 'minicopter', icon: '🚁' },
                { name: 'Scrap Heli', shortname: 'scraptransportheli', icon: '🚁' },
                { name: 'Attack Heli', shortname: 'attackhelicopter', icon: '🚁' },
                { name: 'Bicycle', shortname: 'pedalbike', icon: '🚲' },
                { name: 'Motorbike', shortname: 'motorbike', icon: '🏍️' },
                { name: '2 Module Car', shortname: '2module_car', icon: '🚗' },
                { name: '3 Module Car', shortname: '3module_car', icon: '🚗' },
                { name: '4 Module Car', shortname: '4module_car', icon: '🚗' }
            ],
            structures: [
                { name: 'Vending Machine', shortname: 'vendingmachine.deployed', icon: '🏪' },
                { name: 'Recycler', shortname: 'recycler', icon: '♻️' },
                { name: 'SAM Site', shortname: 'sam_static', icon: '🎯' },
                { name: 'Auto Turret', shortname: 'autoturret', icon: '🔫' }
            ]
        };
        this.init();
    }

    loadHistory() {
        const saved = localStorage.getItem('drained_spawn_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
        localStorage.setItem('drained_spawn_history', JSON.stringify(this.spawnHistory.slice(0, 100)));
    }

    init() {
        this.createSpawnHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'spawn') {
                this.refresh();
            }
        });
    }

    createSpawnHTML() {
        const spawnTab = document.getElementById('tab-spawn');
        if (!spawnTab) return;

        spawnTab.innerHTML = `
            <div class="spawn-container">
                <div class="spawn-header">
                    <h2>🎯 SPAWN MANAGER</h2>
                    <div class="spawn-controls">
                        <button id="clear-history" class="spawn-btn">🗑️ CLEAR HISTORY</button>
                        <button id="refresh-spawn" class="spawn-btn">🔄 REFRESH</button>
                    </div>
                </div>

                <div class="spawn-tabs">
                    <button class="spawn-tab active" data-cat="crates">📦 CRATES</button>
                    <button class="spawn-tab" data-cat="keycards">🔑 KEYCARDS</button>
                    <button class="spawn-tab" data-cat="barrels">🛢️ BARRELS</button>
                    <button class="spawn-tab" data-cat="nodes">⛏️ NODES</button>
                    <button class="spawn-tab" data-cat="vehicles">🚗 VEHICLES</button>
                    <button class="spawn-tab" data-cat="structures">🏗️ STRUCTURES</button>
                </div>

                <div class="spawn-location">
                    <h3>SPAWN LOCATION</h3>
                    <div class="coord-inputs">
                        <input type="number" id="spawn-x" placeholder="X" value="0">
                        <input type="number" id="spawn-y" placeholder="Y" value="0">
                        <input type="number" id="spawn-z" placeholder="Z" value="0">
                    </div>
                    <div class="location-presets">
                        <button class="loc-preset" data-x="0" data-y="0" data-z="0">Current</button>
                        <button class="loc-preset" data-x="1245" data-y="45" data-z="678">Dome</button>
                        <button class="loc-preset" data-x="500" data-y="45" data-z="2000">Airfield</button>
                        <button class="loc-preset" data-x="3000" data-y="45" data-z="2800">Launch</button>
                    </div>
                </div>

                <div class="spawn-items" id="spawn-items"></div>

                <div class="spawn-history">
                    <h3>RECENT SPAWNS</h3>
                    <div id="spawn-history-list" class="history-list"></div>
                </div>
            </div>
        `;

        this.renderCategory('crates');
        this.renderHistory();
    }

    setupEventListeners() {
        document.querySelectorAll('.spawn-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.spawn-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderCategory(e.target.dataset.cat);
            });
        });

        document.querySelectorAll('.loc-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('spawn-x').value = e.target.dataset.x;
                document.getElementById('spawn-y').value = e.target.dataset.y;
                document.getElementById('spawn-z').value = e.target.dataset.z;
            });
        });

        document.getElementById('clear-history')?.addEventListener('click', () => this.clearHistory());
        document.getElementById('refresh-spawn')?.addEventListener('click', () => this.refresh());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('spawn-item-btn')) {
                const shortname = e.target.dataset.shortname;
                const name = e.target.dataset.name;
                this.spawnItem(shortname, name);
            }
        });
    }

    renderCategory(category) {
        const container = document.getElementById('spawn-items');
        const items = this.spawnCategories[category] || [];

        let html = '<div class="spawn-grid">';
        items.forEach(item => {
            html += `
                <div class="spawn-card">
                    <div class="spawn-icon">${item.icon}</div>
                    <div class="spawn-name">${item.name}</div>
                    <div class="spawn-short">${item.shortname}</div>
                    <button class="spawn-item-btn" data-shortname="${item.shortname}" data-name="${item.name}">SPAWN</button>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    spawnItem(shortname, name) {
        const x = document.getElementById('spawn-x').value;
        const y = document.getElementById('spawn-y').value;
        const z = document.getElementById('spawn-z').value;

        this.spawnHistory.unshift({
            item: name,
            shortname: shortname,
            position: { x, y, z },
            time: new Date().toISOString(),
            spawnedBy: this.tablet.currentUser
        });

        this.saveHistory();
        this.renderHistory();
        this.tablet.showToast(`Spawned ${name} at (${x}, ${y}, ${z})`, 'success');
    }

    renderHistory() {
        const container = document.getElementById('spawn-history-list');
        
        if (this.spawnHistory.length === 0) {
            container.innerHTML = '<div class="no-history">No spawn history</div>';
            return;
        }

        let html = '';
        this.spawnHistory.slice(0, 20).forEach(entry => {
            const time = new Date(entry.time).toLocaleTimeString();
            html += `
                <div class="history-entry">
                    <span class="history-time">[${time}]</span>
                    <span class="history-item">${entry.item}</span>
                    <span class="history-pos">(${entry.position.x}, ${entry.position.y}, ${entry.position.z})</span>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    clearHistory() {
        this.tablet.showConfirm('Clear spawn history?', (confirmed) => {
            if (confirmed) {
                this.spawnHistory = [];
                this.saveHistory();
                this.renderHistory();
                this.tablet.showToast('Spawn history cleared', 'info');
            }
        });
    }

    refresh() {
        this.renderHistory();
        this.tablet.showToast('Spawn manager refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.spawnManager = new SpawnManager(window.drainedTablet);
});