// vehicles.js – DRAINED TABLET ULTIMATE v7.0.0
// Vehicle spawn management with relative offset and custom coordinates.
// All spawn commands use admin's current position or user‑provided coordinates.

class Vehicles {
    constructor() {
        this.tablet = window.drainedTablet;
        this.cmd = window.serverCommands;
        this.access = window.accessControl;
        this.vehicleTypes = this.getVehicleTypes();
        this.init();
    }

    getVehicleTypes() {
        return {
            air: [
                { name: 'Hot Air Balloon', command: 'hotairballoon', offset: { y: 1, z: 6 } },
                { name: 'Minicopter', command: 'minicopter.entity', offset: { y: 1, z: 4 } },
                { name: 'Scrap Transport Heli', command: 'scraptransporthelicopter', offset: { y: 1, z: 6 } },
                { name: 'Attack Helicopter', command: 'attackhelicopter.entity', offset: { y: 1, z: 8 } }
            ],
            ground: [
                { name: '2‑Module Car', command: '2module_car_spawned.entity', offset: { y: 1, z: 3 } },
                { name: '3‑Module Car', command: '3module_car_spawned.entity', offset: { y: 1, z: 4 } },
                { name: '4‑Module Car', command: '4module_car_spawned.entity', offset: { y: 1, z: 5 } },
                { name: 'Pedal Bike', command: 'pedalbike', offset: { y: 1, z: 2 } },
                { name: 'Pedal Trike', command: 'pedaltrike', offset: { y: 1, z: 2 } },
                { name: 'Motorbike', command: 'motorbike', offset: { y: 1, z: 2 } },
                { name: 'Motorbike + Sidecar', command: 'motorbike_sidecar', offset: { y: 1, z: 2 } },
                { name: 'Horse', command: 'testridablehorse', offset: { y: 0, z: 2 } }
            ],
            water: [
                { name: 'Rowboat', command: 'rowboat', offset: { y: 2, z: 4 } },
                { name: 'RHIB', command: 'rhib', offset: { y: 2, z: 6 } }
            ]
        };
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'vehicles') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-vehicles');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="vehicles-container">
                <div class="vehicles-header">
                    <h2>🚗 VEHICLE SPAWNER</h2>
                    <button id="vehicles-refresh" class="vehicles-btn">🔄 REFRESH</button>
                </div>

                <div class="vehicles-location">
                    <h3>SPAWN LOCATION</h3>
                    <div class="coord-inputs">
                        <input type="number" id="vehicles-x" placeholder="X" value="0">
                        <input type="number" id="vehicles-y" placeholder="Y" value="0">
                        <input type="number" id="vehicles-z" placeholder="Z" value="0">
                    </div>
                    <div class="location-presets">
                        <button class="loc-preset" data-x="0" data-y="0" data-z="0">Current Position</button>
                        <button class="loc-preset" data-x="1245" data-y="45" data-z="678">Dome</button>
                        <button class="loc-preset" data-x="500" data-y="45" data-z="2000">Airfield</button>
                        <button class="loc-preset" data-x="3000" data-y="45" data-z="2800">Launch Site</button>
                    </div>
                    <div class="checkbox-item">
                        <label>
                            <input type="checkbox" id="use-relative" checked> Use relative offset
                        </label>
                    </div>
                </div>

                <div class="vehicles-categories">
                    <div class="vehicle-category">
                        <h3>✈️ AIR VEHICLES</h3>
                        <div id="air-vehicles" class="vehicle-grid"></div>
                    </div>
                    <div class="vehicle-category">
                        <h3>🛞 GROUND VEHICLES</h3>
                        <div id="ground-vehicles" class="vehicle-grid"></div>
                    </div>
                    <div class="vehicle-category">
                        <h3>🚤 WATER VEHICLES</h3>
                        <div id="water-vehicles" class="vehicle-grid"></div>
                    </div>
                </div>
            </div>
        `;

        this.renderCategory('air', 'air-vehicles');
        this.renderCategory('ground', 'ground-vehicles');
        this.renderCategory('water', 'water-vehicles');
    }

    renderCategory(cat, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const vehicles = this.vehicleTypes[cat];
        let html = '';
        vehicles.forEach(v => {
            html += `
                <div class="vehicle-card">
                    <span class="vehicle-name">${v.name}</span>
                    <button class="vehicle-spawn small-btn" data-cmd="${v.command}" data-offset-y="${v.offset.y}" data-offset-z="${v.offset.z}">SPAWN</button>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    attachEvents() {
        document.getElementById('vehicles-refresh')?.addEventListener('click', () => this.refresh());

        document.querySelectorAll('.loc-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.getElementById('vehicles-x').value = e.target.dataset.x;
                document.getElementById('vehicles-y').value = e.target.dataset.y;
                document.getElementById('vehicles-z').value = e.target.dataset.z;
            });
        });

        document.querySelectorAll('.vehicle-spawn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const cmd = e.target.dataset.cmd;
                const offsetY = parseFloat(e.target.dataset.offsetY);
                const offsetZ = parseFloat(e.target.dataset.offsetZ);
                await this.spawnVehicle(cmd, offsetY, offsetZ);
            });
        });
    }

    async spawnVehicle(command, offsetY, offsetZ) {
        if (!this.access.hasRole('master')) return;

        const useRelative = document.getElementById('use-relative').checked;
        let x = parseFloat(document.getElementById('vehicles-x').value);
        let y = parseFloat(document.getElementById('vehicles-y').value);
        let z = parseFloat(document.getElementById('vehicles-z').value);

        if (useRelative) {
            // If user wants relative, we need admin's current position.
            // We'll use the stored position from the last status? Or fetch now.
            // For simplicity, we assume the coordinates entered are already the admin's position.
            // But we can also attempt to get admin position via RCON.
            // We'll implement a helper to fetch admin position.
            const pos = await this.getAdminPosition();
            if (pos) {
                x = pos.x;
                y = pos.y;
                z = pos.z;
            } else {
                this.tablet.showToast('Could not get current position, using entered coordinates', 'info');
            }
        }

        // Apply offsets
        y += offsetY;
        z += offsetZ;

        try {
            await this.cmd.spawn(command, x, y, z);
            this.tablet.showToast(`Spawned ${command} at (${x}, ${y}, ${z})`, 'success');
        } catch (err) {
            this.tablet.showError(`Spawn failed: ${err.message}`);
        }
    }

    async getAdminPosition() {
        // Attempt to get admin position via RCON command `client.printpos` or similar.
        try {
            const result = await ConnectionManager.executeCommand('client.printpos');
            // Expected format: "Your position is: (123, 45, 678)"
            const match = result.match(/\((\d+),?\s*(\d+),?\s*(\d+)/);
            if (match) {
                return {
                    x: parseInt(match[1]),
                    y: parseInt(match[2]),
                    z: parseInt(match[3])
                };
            }
        } catch (e) {
            console.warn('Could not fetch admin position', e);
        }
        return null;
    }

    refresh() {
        this.tablet.showToast('Vehicles page refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.vehicles = new Vehicles();
});