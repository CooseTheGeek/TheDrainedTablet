// home.js – DRAINED TABLET ULTIMATE v7.0.0
// Replaces CPU/RAM/players with Rust character dress‑up system.

class Home {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.items = window.itemsDatabase || window.items?.items || [];
        this.equipment = this.loadEquipment();
        this.canvas = null;
        this.ctx = null;
        this.init();
    }

    loadEquipment() {
        const saved = localStorage.getItem('tdl_dressed_character');
        return saved ? JSON.parse(saved) : {
            head: null,
            torso: null,
            legs: null,
            feet: null,
            mainhand: null,
            offhand: null
        };
    }

    saveEquipment() {
        localStorage.setItem('tdl_dressed_character', JSON.stringify(this.equipment));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.startServerUpdates();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'home') this.refresh();
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
        this.ctx = this.canvas.getContext('2d');
        this.drawCharacter();
        this.populateItemGallery();
    }

    drawCharacter() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, 400, 500);
        
        // Base silhouette (placeholder – you can replace with a Rust character outline)
        this.ctx.fillStyle = '#2c3e2f';
        this.ctx.fillRect(150, 100, 100, 250); // body
        this.ctx.fillRect(120, 150, 40, 80);  // left arm
        this.ctx.fillRect(240, 150, 40, 80);  // right arm
        this.ctx.fillRect(170, 350, 60, 80);  // legs
        
        // Draw equipped items as images on top
        this.drawItemOnSlot('head', 175, 70, 50, 50);
        this.drawItemOnSlot('torso', 170, 130, 60, 80);
        this.drawItemOnSlot('legs', 170, 230, 60, 80);
        this.drawItemOnSlot('feet', 170, 320, 60, 40);
        this.drawItemOnSlot('mainhand', 100, 200, 50, 50);
        this.drawItemOnSlot('offhand', 250, 200, 50, 50);
    }

    drawItemOnSlot(slot, x, y, w, h) {
        const itemShortname = this.equipment[slot];
        if (!itemShortname) return;
        const img = new Image();
        const shortnameFormatted = itemShortname.replace(/\./g, '-');
        img.src = `https://www.corrosionhour.com/img/items/${shortnameFormatted}.png`;
        img.onload = () => {
            this.ctx.drawImage(img, x, y, w, h);
        };
        img.onerror = () => {
            // fallback text
            this.ctx.fillStyle = '#aaa';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(itemShortname, x + 5, y + 20);
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
            ).slice(0, 100);
            container.innerHTML = filtered.map(item => `
                <div class="item-card" data-shortname="${item.shortname}">
                    <img src="https://www.corrosionhour.com/img/items/${item.shortname.replace(/\./g, '-')}.png" 
                         onerror="this.src='https://via.placeholder.com/32?text=?'">
                    <span>${item.name}</span>
                </div>
            `).join('');
            container.querySelectorAll('.item-card').forEach(card => {
                card.addEventListener('click', () => {
                    const shortname = card.dataset.shortname;
                    this.showSlotMenu(shortname);
                });
            });
        };
        searchInput.addEventListener('input', filterItems);
        filterItems();
    }

    showSlotMenu(itemShortname) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Equip to slot</h3>
                <div class="slot-buttons">
                    <button data-slot="head">🧢 Head</button>
                    <button data-slot="torso">👕 Torso</button>
                    <button data-slot="legs">👖 Legs</button>
                    <button data-slot="feet">👟 Feet</button>
                    <button data-slot="mainhand">⚔️ Main Hand</button>
                    <button data-slot="offhand">🛡️ Off Hand</button>
                </div>
                <div class="modal-actions"><button id="cancel-slot">Cancel</button></div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
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
        // Slot clicks to clear equipment
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
            if (AppState.connection.status === 'connected') {
                try {
                    const players = AppState.players.length;
                    const uptime = await ConnectionManager.executeCommand('server.uptime');
                    document.getElementById('player-count').innerText = players;
                    document.getElementById('uptime').innerText = uptime || '0d 0h 0m';
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