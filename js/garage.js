// garage.js – DRAINED TABLET ULTIMATE v7.0.0 – Full Motorpool with all vehicles
// (Only the purchaseVehicle method is shown here; the rest of the file is the same as previously sent.
// For brevity, I include the full file again but with the critical fix.)

class Garage {
    constructor() {
        this.access = window.accessControl;
        this.vehicles = [];
        this.editingId = null;
        this.init();
    }

    getAllVehicles() {
        const defaultImg = "https://www.corrosionhour.com/img/items/wood.png";
        return [
            // AIR VEHICLES
            { id: 1, name: "Minicopter", shortname: "minicopter", price: 750, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/minicopter.png", offsetY: 1, offsetZ: 4, category: "air" },
            { id: 2, name: "Scrap Transport Helicopter", shortname: "scraptransporthelicopter", price: 1500, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/scraptransporthelicopter.png", offsetY: 1, offsetZ: 6, category: "air" },
            { id: 3, name: "Attack Helicopter", shortname: "attackhelicopter", price: 5000, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/attackhelicopter.png", offsetY: 1, offsetZ: 8, category: "air" },
            { id: 4, name: "Hot Air Balloon", shortname: "hotairballoon", price: 400, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/hotairballoon.png", offsetY: 1, offsetZ: 6, category: "air" },
            // LAND VEHICLES – Cars
            { id: 5, name: "2 Module Car", shortname: "2module_car", price: 250, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/2module_car.png", offsetY: 1, offsetZ: 3, category: "land" },
            { id: 6, name: "3 Module Car", shortname: "3module_car", price: 300, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/3module_car.png", offsetY: 1, offsetZ: 4, category: "land" },
            { id: 7, name: "4 Module Car", shortname: "4module_car", price: 350, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/4module_car.png", offsetY: 1, offsetZ: 5, category: "land" },
            { id: 8, name: "Shreddable Pickup Truck", shortname: "shreddable_pickuptruck", price: 450, stock: -1, enabled: true, image: defaultImg, offsetY: 1, offsetZ: 5, category: "land" },
            // LAND VEHICLES – Bikes
            { id: 9, name: "Bicycle", shortname: "pedalbike", price: 50, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/pedalbike.png", offsetY: 1, offsetZ: 2, category: "land" },
            { id: 10, name: "Tricycle", shortname: "pedaltrike", price: 75, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/pedaltrike.png", offsetY: 1, offsetZ: 2, category: "land" },
            { id: 11, name: "Motorbike", shortname: "motorbike", price: 150, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/motorbike.png", offsetY: 1, offsetZ: 2, category: "land" },
            { id: 12, name: "Motorbike with Sidecar", shortname: "motorbike_sidecar", price: 200, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/motorbike_sidecar.png", offsetY: 1, offsetZ: 2, category: "land" },
            // LAND VEHICLES – Other
            { id: 13, name: "Ridable Horse", shortname: "testridablehorse", price: 200, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/horse.png", offsetY: 0, offsetZ: 2, category: "land" },
            { id: 14, name: "Magnet Crane", shortname: "magnetcrane", price: 1000, stock: -1, enabled: true, image: defaultImg, offsetY: 1, offsetZ: 4, category: "land" },
            // WATER VEHICLES
            { id: 15, name: "Rowboat", shortname: "rowboat", price: 100, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/rowboat.png", offsetY: 2, offsetZ: 4, category: "water" },
            { id: 16, name: "RHIB", shortname: "rhib", price: 300, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/rhib.png", offsetY: 2, offsetZ: 6, category: "water" },
            { id: 17, name: "Kayak", shortname: "kayak", price: 80, stock: -1, enabled: true, image: "https://www.corrosionhour.com/img/items/kayak.png", offsetY: 2, offsetZ: 4, category: "water" }
        ];
    }

    async init() {
        await this.loadVehicles();
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'garage') this.refresh();
        });
    }

    loadVehicles() {
        return new Promise((resolve) => {
            const saved = localStorage.getItem('tdl_garage_vehicles');
            if (saved) {
                this.vehicles = JSON.parse(saved);
            } else {
                this.vehicles = this.getAllVehicles();
                this.saveVehicles();
            }
            resolve();
        });
    }

    saveVehicles() {
        localStorage.setItem('tdl_garage_vehicles', JSON.stringify(this.vehicles));
    }

    getUserPlatformId() {
        return AppState.user?.platformId || localStorage.getItem('tdl_platform_id');
    }

    async getPlayerBalance() {
        const playerId = this.getUserPlatformId();
        if (!playerId) return null;
        try {
            const res = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`);
            return parseInt(res) || 0;
        } catch { return null; }
    }

    createHTML() {
        const tab = document.getElementById('tab-garage');
        if (!tab) return;
        const isAdmin = this.access.isMasterUser();

        tab.innerHTML = `
            <div class="garage-container" style="padding:1rem;">
                <div class="garage-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                    <h2 style="color:var(--accent-primary);">🏍️ 3UNKS MOTORPOOL</h2>
                    <div class="garage-balance" style="background:var(--bg-tertiary); padding:0.5rem 1rem; border-radius:30px;">
                        💰 Your Scrap: <strong id="garage-balance">--</strong>
                    </div>
                    ${isAdmin ? '<button id="garage-add-vehicle" class="garage-btn primary">+ ADD VEHICLE</button>' : ''}
                </div>
                <div style="display:flex; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap;">
                    <input type="text" id="garage-search" placeholder="Search vehicles..." style="flex:2; padding:0.8rem 1rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:30px;">
                    <select id="garage-category-filter" style="flex:1; padding:0.8rem 1rem; background:var(--bg-tertiary); border:1px solid var(--glass-border); border-radius:30px;">
                        <option value="all">All</option><option value="air">✈️ Air</option><option value="land">🛞 Land</option><option value="water">💧 Water</option>
                    </select>
                </div>
                <div id="garage-vehicles" class="vehicles-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px,1fr)); gap:1.5rem;"></div>
                <div id="garage-modal" class="modal hidden"><div class="modal-content" style="max-width:500px;"><h3 id="garage-modal-title">Add/Edit Vehicle</h3>
                <div class="form-group"><label>Name</label><input type="text" id="vehicle-name"></div>
                <div class="form-group"><label>Shortname</label><input type="text" id="vehicle-shortname"></div>
                <div class="form-group"><label>Price (scrap)</label><input type="number" id="vehicle-price" value="0"></div>
                <div class="form-group"><label>Stock (-1 = unlimited)</label><input type="number" id="vehicle-stock" value="-1"></div>
                <div class="form-group"><label>Image URL</label><input type="text" id="vehicle-image" placeholder="https://..."></div>
                <div class="form-group"><label>Offset Y</label><input type="number" id="vehicle-offset-y" value="1"></div>
                <div class="form-group"><label>Offset Z</label><input type="number" id="vehicle-offset-z" value="2"></div>
                <div class="form-group"><label>Category</label><select id="vehicle-category"><option value="air">Air</option><option value="land">Land</option><option value="water">Water</option></select></div>
                <div class="checkbox-item"><label><input type="checkbox" id="vehicle-enabled" checked> Enabled</label></div>
                <div class="modal-actions"><button id="garage-save" class="modal-btn primary">Save</button><button id="garage-cancel" class="modal-btn">Cancel</button></div>
                </div></div>
            </div>
        `;
        this.updateBalance();
        this.renderVehicles();
    }

    attachEvents() {
        const isAdmin = this.access.isMasterUser();
        document.getElementById('garage-search')?.addEventListener('input', () => this.renderVehicles());
        document.getElementById('garage-category-filter')?.addEventListener('change', () => this.renderVehicles());
        if (isAdmin) {
            document.getElementById('garage-add-vehicle')?.addEventListener('click', () => this.openVehicleModal());
            document.getElementById('garage-save')?.addEventListener('click', () => this.saveVehicle());
            document.getElementById('garage-cancel')?.addEventListener('click', () => {
                document.getElementById('garage-modal').classList.add('hidden');
            });
        }
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('buy-vehicle')) {
                const id = parseInt(e.target.dataset.id);
                const v = this.vehicles.find(v => v.id === id);
                if (v) this.purchaseVehicle(v);
            }
            if (e.target.classList.contains('edit-vehicle') && isAdmin) {
                const id = parseInt(e.target.dataset.id);
                this.openVehicleModal(id);
            }
            if (e.target.classList.contains('delete-vehicle') && isAdmin) {
                const id = parseInt(e.target.dataset.id);
                this.deleteVehicle(id);
            }
        });
    }

    async updateBalance() {
        const bal = await this.getPlayerBalance();
        const el = document.getElementById('garage-balance');
        if (el) el.innerText = (bal !== null) ? bal : '?';
    }

    renderVehicles() {
        const container = document.getElementById('garage-vehicles');
        if (!container) return;
        const search = document.getElementById('garage-search')?.value.toLowerCase() || '';
        const category = document.getElementById('garage-category-filter')?.value || 'all';
        let filtered = this.vehicles.filter(v => v.enabled && v.name.toLowerCase().includes(search));
        if (category !== 'all') filtered = filtered.filter(v => v.category === category);
        const isAdmin = this.access.isMasterUser();
        if (filtered.length === 0) { container.innerHTML = '<div style="text-align:center; padding:2rem;">No vehicles available</div>'; return; }
        const defaultImg = "https://www.corrosionhour.com/img/items/wood.png";
        container.innerHTML = filtered.map(v => `
            <div class="vehicle-card" style="background:var(--glass-bg); backdrop-filter:blur(var(--glass-blur)); border:1px solid var(--glass-border); border-radius:16px; padding:1rem;">
                <img src="${v.image || defaultImg}" style="width:100px; height:100px; object-fit:contain; margin:0 auto 1rem; display:block;" onerror="this.src='${defaultImg}'">
                <div style="font-weight:600; text-align:center;">${this.escapeHtml(v.name)}</div>
                <div style="display:flex; justify-content:space-between; margin-top:0.5rem;"><span>💰 ${v.price} scrap</span><span>${v.stock === -1 ? '∞' : v.stock}</span></div>
                <div style="display:flex; gap:0.5rem; margin-top:1rem;">
                    <button class="buy-vehicle small-btn" data-id="${v.id}" style="flex:2; background:var(--accent-primary); color:#000;">Buy & Spawn</button>
                    ${isAdmin ? `<button class="edit-vehicle small-btn" data-id="${v.id}">✏️</button><button class="delete-vehicle small-btn" data-id="${v.id}">🗑️</button>` : ''}
                </div>
            </div>
        `).join('');
    }

    async purchaseVehicle(vehicle) {
        const playerId = this.getUserPlatformId();
        if (!playerId) { toast.error('Platform ID not set'); return; }
        let balance;
        try {
            const res = await ConnectionManager.executeCommand(`economy.balance "${playerId}"`);
            balance = parseInt(res) || 0;
            if (balance < vehicle.price) { toast.error(`Need ${vehicle.price} scrap`); return; }
        } catch { toast.error('Balance check failed'); return; }
        if (!confirm(`Buy ${vehicle.name} for ${vehicle.price} scrap? It will spawn at your position.`)) return;
        let position = null;
        try {
            // FIXED: Use playerId (Gamertag/PSN ID) instead of dashboard username
            const posRaw = await ConnectionManager.executeCommand(`printpos ${playerId}`);
            const match = posRaw.match(/\(([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\)/);
            if (match) position = { x: parseFloat(match[1]), y: parseFloat(match[2]), z: parseFloat(match[3]) };
            else throw new Error();
        } catch { toast.error('Could not get your position'); return; }
        try {
            await ConnectionManager.executeCommand(`economy.remove "${playerId}" ${vehicle.price}`);
            const spawnX = position.x;
            const spawnY = position.y + (vehicle.offsetY || 1);
            const spawnZ = position.z + (vehicle.offsetZ || 2);
            await ConnectionManager.executeCommand(`spawn ${vehicle.shortname} (${spawnX},${spawnY},${spawnZ})`);
            toast.success(`${vehicle.name} spawned near you!`);
            this.updateBalance();
        } catch (err) { toast.error(`Failed: ${err.message}`); }
    }

    openVehicleModal(id = null) {
        this.editingId = id;
        const modal = document.getElementById('garage-modal');
        document.getElementById('garage-modal-title').innerText = id ? 'Edit Vehicle' : 'Add Vehicle';
        document.getElementById('vehicle-name').value = '';
        document.getElementById('vehicle-shortname').value = '';
        document.getElementById('vehicle-price').value = '0';
        document.getElementById('vehicle-stock').value = '-1';
        document.getElementById('vehicle-image').value = '';
        document.getElementById('vehicle-offset-y').value = '1';
        document.getElementById('vehicle-offset-z').value = '2';
        document.getElementById('vehicle-category').value = 'land';
        document.getElementById('vehicle-enabled').checked = true;
        if (id) {
            const v = this.vehicles.find(v => v.id === id);
            if (v) {
                document.getElementById('vehicle-name').value = v.name;
                document.getElementById('vehicle-shortname').value = v.shortname;
                document.getElementById('vehicle-price').value = v.price;
                document.getElementById('vehicle-stock').value = v.stock;
                document.getElementById('vehicle-image').value = v.image || '';
                document.getElementById('vehicle-offset-y').value = v.offsetY || 1;
                document.getElementById('vehicle-offset-z').value = v.offsetZ || 2;
                document.getElementById('vehicle-category').value = v.category || 'land';
                document.getElementById('vehicle-enabled').checked = v.enabled !== false;
            }
        }
        modal.classList.remove('hidden');
    }

    saveVehicle() {
        const name = document.getElementById('vehicle-name').value.trim();
        const shortname = document.getElementById('vehicle-shortname').value.trim();
        const price = parseInt(document.getElementById('vehicle-price').value);
        const stock = parseInt(document.getElementById('vehicle-stock').value);
        const image = document.getElementById('vehicle-image').value.trim();
        const offsetY = parseFloat(document.getElementById('vehicle-offset-y').value);
        const offsetZ = parseFloat(document.getElementById('vehicle-offset-z').value);
        const category = document.getElementById('vehicle-category').value;
        const enabled = document.getElementById('vehicle-enabled').checked;
        if (!name || !shortname) { toast.error('Name and shortname required'); return; }
        if (this.editingId) {
            const idx = this.vehicles.findIndex(v => v.id === this.editingId);
            if (idx !== -1) this.vehicles[idx] = { ...this.vehicles[idx], name, shortname, price, stock, image, offsetY, offsetZ, category, enabled };
        } else {
            this.vehicles.push({ id: Date.now(), name, shortname, price, stock, image, offsetY, offsetZ, category, enabled });
        }
        this.saveVehicles();
        this.renderVehicles();
        document.getElementById('garage-modal').classList.add('hidden');
        toast.success('Vehicle saved');
    }

    deleteVehicle(id) {
        if (!confirm('Delete this vehicle?')) return;
        this.vehicles = this.vehicles.filter(v => v.id !== id);
        this.saveVehicles();
        this.renderVehicles();
        toast.info('Vehicle deleted');
    }

    escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, m => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
    }

    refresh() {
        this.loadVehicles().then(() => { this.renderVehicles(); this.updateBalance(); });
        toast.success('Garage refreshed');
    }
}

document.addEventListener('DOMContentLoaded', () => { window.garage = new Garage(); });