// home.js – DRAINED TABLET ULTIMATE v7.0.0
// Rust character dress‑up system with guaranteed item list.

class Home {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.equipment = this.loadEquipment();
        this.canvas = null;
        this.ctx = null;
        this.items = this.getFallbackItems(); // start with fallback, will merge with database if available
        this.init();
    }

    getFallbackItems() {
        return [
            { shortname: "rock", name: "Rock", category: "Tools" },
            { shortname: "torch", name: "Torch", category: "Tools" },
            { shortname: "hatchet", name: "Hatchet", category: "Tools" },
            { shortname: "pickaxe", name: "Pickaxe", category: "Tools" },
            { shortname: "rifle.ak", name: "AK-47", category: "Weapons" },
            { shortname: "rifle.bolt", name: "Bolt Rifle", category: "Weapons" },
            { shortname: "smg.mp5", name: "MP5", category: "Weapons" },
            { shortname: "pistol.revolver", name: "Revolver", category: "Weapons" },
            { shortname: "explosive.timed", name: "C4", category: "Weapons" },
            { shortname: "grenade.f1", name: "F1 Grenade", category: "Weapons" },
            { shortname: "wood", name: "Wood", category: "Resources" },
            { shortname: "stones", name: "Stone", category: "Resources" },
            { shortname: "metal.fragments", name: "Metal Fragments", category: "Resources" },
            { shortname: "cloth", name: "Cloth", category: "Resources" },
            { shortname: "leather", name: "Leather", category: "Resources" },
            { shortname: "hoodie", name: "Hoodie", category: "Attire" },
            { shortname: "pants", name: "Pants", category: "Attire" },
            { shortname: "shoes.boots", name: "Boots", category: "Attire" },
            { shortname: "metal.facemask", name: "Metal Facemask", category: "Attire" },
            { shortname: "metal.plate.torso", name: "Metal Chestplate", category: "Attire" },
            { shortname: "wood.armor.helmet", name: "Wood Helmet", category: "Attire" },
            { shortname: "wood.armor.jacket", name: "Wood Chestplate", category: "Attire" },
            { shortname: "bandage", name: "Bandage", category: "Medical" },
            { shortname: "syringe.medical", name: "Medical Syringe", category: "Medical" }
        ];
    }

    loadEquipment() {
        const saved = localStorage.getItem('tdl_dressed_character');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch(e) { return this.getDefaultEquipment(); }
        }
        return this.getDefaultEquipment();
    }

    getDefaultEquipment() {
        return { head: null, torso: null, legs: null, feet: null, mainhand: null, offhand: null };
    }

    saveEquipment() {
        localStorage.setItem('tdl_dressed_character', JSON.stringify(this.equipment));
    }

    async init() {
        // Try to merge with items database if available
        await this.mergeWithDatabase();
        this.createHTML();
        this.attachEvents();
        this.startServerUpdates();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'home') this.refresh();
        });
    }

    mergeWithDatabase() {
        return new Promise((resolve) => {
            let attempts = 0;
            const check = () => {
                attempts++;
                if (window.itemsDatabase && window.itemsDatabase.length) {
                    this.items = window.itemsDatabase;
                    resolve();
                } else if (window.items && window.items.items && window.items.items.length) {
                    this.items = window.items.items;
                    resolve();
                } else if (attempts > 20) {
                    // keep fallback items
                    resolve();
                } else {
                    setTimeout(check, 200);
                }
            };
            check();
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-home');
        if (!tab) return;

        tab.innerHTML = `
            <div class="home-container">
                <div class="home-header">
                    <h2>🏠 RUST CHARACTER STUDIO</h2>
                    <button id="home-refresh" class="home-btn">🔄 REFRESH</button>
                </div>

                <div class="character-studio">
                    <div class="character-canvas-container">
                        <canvas id="character-canvas" width="400" height="500"></canvas>
                        <div class="character-stats">
                            <div class="stat">❤️ Health: 100</div>
                            <div class="stat">🍖 Food: 100</div>
                            <div class="stat">💧 Water: 100</div>
                        </div>
                    </div>

                    <div class="equipment-slots">
                        <div class="slot" data-slot="head">🧢 Head</div>
                        <div class="slot" data-slot="torso">👕 Torso</div>
                        <div class="slot" data-slot="legs">👖 Legs</div>
                        <div class="slot" data-slot="feet">👟 Feet</div>
                        <div class="slot" data-slot="mainhand">⚔️ Main Hand</div>
                        <div class="slot" data-slot="offhand">🛡️ Off Hand</div>
                    </div>

                    <div class="item-gallery">
                        <h3>📦 Available Items</h3>
                        <input type="text" id="item-search" placeholder="Search items...">
                        <div id="item-list" class="item-list"></div>
                    </div>
                </div>

                <div class="server-stats-bar">
                    <div class="stat-card">👥 Online: <span id="player-count">0</span></div>
                    <div class="stat-card">🕒 Uptime: <span id="uptime">0d 0h 0m</span></div>
                    <div class="stat-card">🗺️ Map: 3500</div>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('character-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.drawCharacter();
        }
        this.populateItemGallery();
    }

    drawCharacter() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, 400, 500);
        
        // Base survivor silhouette
        this.ctx.fillStyle = '#3a5e3a';
        // Body
        this.ctx.fillRect(150, 100, 100, 200);
        // Head
        this.ctx.fillStyle = '#d2a679';
        this.ctx.beginPath();
        this.ctx.ellipse(200, 80, 35, 45, 0, 0, Math.PI * 2);
        this.ctx.fill();
        // Arms
        this.ctx.fillStyle = '#3a5e3a';
        this.ctx.fillRect(120, 130, 30, 90);
        this.ctx.fillRect(250, 130, 30, 90);
        // Legs
        this.ctx.fillRect(165, 300, 30, 100);
        this.ctx.fillRect(205, 300, 30, 100);
        
        // Equipped items
        this.drawItemOnSlot('head', 165, 40, 70, 70);
        this.drawItemOnSlot('torso', 155, 100, 90, 120);
        this.drawItemOnSlot('legs', 165, 220, 70, 90);
        this.drawItemOnSlot('feet', 165, 320, 70, 40);
        this.drawItemOnSlot('mainhand', 80, 170, 50, 50);
        this.drawItemOnSlot('offhand', 270, 170, 50, 50);
    }

    drawItemOnSlot(slot, x, y, w, h) {
        const shortname = this.equipment[slot];
        if (!shortname) return;
        const img = new Image();
        const formatted = shortname.replace(/\./g, '-');
        img.src = `https://www.corrosionhour.com/img/items/${formatted}.png`;
        img.onload = () => {
            this.ctx.drawImage(img, x, y, w, h);
        };
        img.onerror = () => {
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(shortname.slice(0, 8), x + 5, y + 20);
        };
    }

    populateItemGallery() {
        const container = document.getElementById('item-list');
        if (!container) return;
        const searchInput = document.getElementById('item-search');
        const filterItems = () => {
            const query = searchInput.value.toLowerCase();
            const filtered = this.items.filter(i => 
                i.name.toLowerCase().includes(query) || 
                i.shortname.toLowerCase().includes(query)
            ).slice(0, 80);
            container.innerHTML = filtered.map(item => `
                <div class="item-card" data-shortname="${item.shortname}">
                    <img src="https://www.corrosionhour.com/img/items/${item.shortname.replace(/\./g, '-')}.png" 
                         onerror="this.src='https://via.placeholder.com/32?text=?'">
                    <span>${item.name.length > 20 ? item.name.slice(0, 18) + '…' : item.name}</span>
                </div>
            `).join('');
            container.querySelectorAll('.item-card').forEach(card => {
                card.addEventListener('click', () => {
                    const shortname = card.dataset.shortname;
                    this.showSlotMenu(shortname);
                });
            });
        };
        if (searchInput) searchInput.addEventListener('input', filterItems);
        filterItems();
    }

    showSlotMenu(itemShortname) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal-content" style="background: var(--glass-bg); backdrop-filter: blur(10px); border-radius: 24px; padding: 2rem; max-width: 400px; width: 90%;">
                <h3>Equip to slot</h3>
                <div class="slot-buttons">
                    <button data-slot="head">🧢 Head</button>
                    <button data-slot="torso">👕 Torso</button>
                    <button data-slot="legs">👖 Legs</button>
                    <button data-slot="feet">👟 Feet</button>
                    <button data-slot="mainhand">⚔️ Main Hand</button>
                    <button data-slot="offhand">🛡️ Off Hand</button>
                </div>
                <div class="modal-actions" style="margin-top: 1rem;"><button id="cancel-slot">Cancel</button></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelectorAll('.slot-buttons button').forEach(btn => {
            btn.addEventListener('click', () => {
                const slot = btn.dataset.slot;
                this.equipment[slot] = itemShortname;
                this.saveEquipment();
                this.drawCharacter();
                modal.remove();
                toast.success(`Equipped ${itemShortname} to ${slot}`);
            });
        });
        modal.querySelector('#cancel-slot').addEventListener('click', () => modal.remove());
    }

    attachEvents() {
        document.getElementById('home-refresh')?.addEventListener('click', () => this.refresh());
        document.querySelectorAll('.equipment-slots .slot').forEach(slotDiv => {
            slotDiv.addEventListener('click', () => {
                const slot = slotDiv.dataset.slot;
                if (this.equipment[slot]) {
                    if (confirm(`Remove ${this.equipment[slot]} from ${slot}?`)) {
                        this.equipment[slot] = null;
                        this.saveEquipment();
                        this.drawCharacter();
                        toast.info(`Cleared ${slot} slot`);
                    }
                }
            });
        });
    }

    async startServerUpdates() {
        setInterval(async () => {
            if (window.AppState?.connection?.status === 'connected' && window.ConnectionManager) {
                try {
                    const players = window.AppState.players?.length || 0;
                    const uptime = await window.ConnectionManager.executeCommand('server.uptime');
                    const playerCountEl = document.getElementById('player-count');
                    const uptimeEl = document.getElementById('uptime');
                    if (playerCountEl) playerCountEl.innerText = players;
                    if (uptimeEl) uptimeEl.innerText = uptime || '0d 0h 0m';
                } catch (e) {}
            }
        }, 5000);
    }

    refresh() {
        this.drawCharacter();
        this.populateItemGallery();
        toast.success('Character studio refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.home = new Home();
});