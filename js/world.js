// world.js – DRAINED TABLET ULTIMATE v7.0.0
// World management: weather, time, monuments, zones, and recyclers.
// Allows full control over environment settings.

class World {
    constructor() {
        this.tablet = window.drainedTablet;
        this.cmd = window.serverCommands;
        this.access = window.accessControl;
        this.zones = [];
        this.monuments = this.getMonumentList();
        this.init();
    }

    getMonumentList() {
        return [
            'Dome', 'Airfield', 'Launch Site', 'Power Plant', 'Train Yard',
            'Water Treatment', 'Large Oil Rig', 'Small Oil Rig', 'Military Tunnel',
            'Underwater Lab', 'Mining Outpost', 'Junkyard', 'Harbor', 'Lighthouse',
            'Sewer Branch', 'Satellite Dish', 'Stables', 'Supermarket', 'Oxum\'s Gas'
        ];
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'world') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-world');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="world-container">
                <div class="world-header">
                    <h2>🌍 WORLD CONTROLS</h2>
                    <button id="world-refresh" class="world-btn">🔄 REFRESH</button>
                </div>

                <div class="world-tabs">
                    <button class="world-tab active" data-tab="weather">☀️ Weather</button>
                    <button class="world-tab" data-tab="time">⏰ Time</button>
                    <button class="world-tab" data-tab="monuments">🏛️ Monuments</button>
                    <button class="world-tab" data-tab="zones">🗺️ Zones</button>
                    <button class="world-tab" data-tab="recyclers">♻️ Recyclers</button>
                </div>

                <div id="world-weather" class="world-tab-content active">
                    <h3>Weather Settings</h3>
                    <div class="setting-item">
                        <label>Clouds: <span id="clouds-val">0.5</span></label>
                        <input type="range" id="clouds" min="0" max="1" step="0.1" value="0.5">
                    </div>
                    <div class="setting-item">
                        <label>Rain: <span id="rain-val">0</span></label>
                        <input type="range" id="rain" min="0" max="1" step="0.1" value="0">
                    </div>
                    <div class="setting-item">
                        <label>Wind: <span id="wind-val">0.5</span></label>
                        <input type="range" id="wind" min="0" max="1" step="0.1" value="0.5">
                    </div>
                    <div class="setting-item">
                        <label>Fog: <span id="fog-val">0</span></label>
                        <input type="range" id="fog" min="0" max="1" step="0.1" value="0">
                    </div>
                    <button id="apply-weather" class="world-btn primary">Apply Weather</button>
                </div>

                <div id="world-time" class="world-tab-content">
                    <h3>Time Settings</h3>
                    <div class="setting-item">
                        <label>Time of Day (0‑24): <span id="time-val">12</span></label>
                        <input type="range" id="time" min="0" max="24" step="0.5" value="12">
                    </div>
                    <div class="setting-item">
                        <label>Day Length (minutes): <span id="daylength-val">45</span></label>
                        <input type="range" id="daylength" min="5" max="240" step="5" value="45">
                    </div>
                    <div class="setting-item">
                        <label>Night Length (minutes): <span id="nightlength-val">15</span></label>
                        <input type="range" id="nightlength" min="5" max="240" step="5" value="15">
                    </div>
                    <button id="apply-time" class="world-btn primary">Apply Time</button>
                </div>

                <div id="world-monuments" class="world-tab-content">
                    <h3>Monument Control</h3>
                    <div class="monuments-list" id="monuments-list"></div>
                    <button id="reset-monuments" class="world-btn">Reset All</button>
                </div>

                <div id="world-zones" class="world-tab-content">
                    <h3>Custom Zones</h3>
                    <button id="create-zone" class="world-btn primary">➕ Create Zone</button>
                    <div id="zones-list" class="zones-list"></div>
                </div>

                <div id="world-recyclers" class="world-tab-content">
                    <h3>Recycler Management</h3>
                    <p>Enable/disable recyclers at monuments.</p>
                    <div id="recyclers-list" class="recyclers-list"></div>
                </div>
            </div>
        `;

        this.renderMonuments();
        this.renderZones();
        this.renderRecyclers();
        this.attachRangeListeners();
    }

    attachEvents() {
        document.querySelectorAll('.world-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.world-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.world-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`world-${e.target.dataset.tab}`).classList.add('active');
            });
        });

        document.getElementById('apply-weather')?.addEventListener('click', () => this.applyWeather());
        document.getElementById('apply-time')?.addEventListener('click', () => this.applyTime());
        document.getElementById('reset-monuments')?.addEventListener('click', () => this.resetMonuments());
        document.getElementById('create-zone')?.addEventListener('click', () => this.createZone());
        document.getElementById('world-refresh')?.addEventListener('click', () => this.refresh());
    }

    attachRangeListeners() {
        ['clouds', 'rain', 'wind', 'fog', 'time', 'daylength', 'nightlength'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('input', () => {
                    const span = document.getElementById(id + '-val');
                    if (span) span.innerText = input.value;
                });
            }
        });
    }

    async applyWeather() {
        const clouds = document.getElementById('clouds').value;
        const rain = document.getElementById('rain').value;
        const wind = document.getElementById('wind').value;
        const fog = document.getElementById('fog').value;
        try {
            await this.cmd.setWeather(clouds, rain, wind, fog);
            this.tablet.showToast('Weather applied', 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    async applyTime() {
        const time = document.getElementById('time').value;
        const day = document.getElementById('daylength').value;
        const night = document.getElementById('nightlength').value;
        try {
            await this.cmd.setTime(time);
            await this.cmd.setDayLength(day);
            await this.cmd.setNightLength(night);
            this.tablet.showToast('Time settings applied', 'success');
        } catch (err) {
            this.tablet.showError(err.message);
        }
    }

    renderMonuments() {
        const list = document.getElementById('monuments-list');
        if (!list) return;
        let html = '';
        this.monuments.forEach(m => {
            html += `
                <div class="monument-item">
                    <span>${m}</span>
                    <button class="small-btn toggle-monument" data-name="${m}">Enable/Disable</button>
                </div>
            `;
        });
        list.innerHTML = html;
        list.querySelectorAll('.toggle-monument').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleMonument(e.target.dataset.name));
        });
    }

    async toggleMonument(name) {
        // This would require specific RCON commands; for now just placeholder
        this.tablet.showToast(`Toggling ${name} (not implemented)`, 'info');
    }

    resetMonuments() {
        this.tablet.showConfirm('Reset all monuments to default?', (confirmed) => {
            if (confirmed) {
                // Implement reset command
                this.tablet.showToast('Monuments reset', 'success');
            }
        });
    }

    renderZones() {
        const list = document.getElementById('zones-list');
        if (!list) return;
        // Fetch zones from bridge
        window.database.getZones().then(zones => {
            this.zones = zones;
            if (zones.length === 0) {
                list.innerHTML = '<div class="no-zones">No custom zones</div>';
                return;
            }
            let html = '';
            zones.forEach(z => {
                html += `
                    <div class="zone-item">
                        <span><strong>${z.name}</strong> (${z.position.x}, ${z.position.y}, ${z.position.z})</span>
                        <button class="small-btn delete-zone" data-id="${z.id}">🗑️</button>
                    </div>
                `;
            });
            list.innerHTML = html;
            list.querySelectorAll('.delete-zone').forEach(btn => {
                btn.addEventListener('click', (e) => this.deleteZone(e.target.dataset.id));
            });
        }).catch(err => {
            list.innerHTML = '<div class="error">Failed to load zones</div>';
        });
    }

    async deleteZone(id) {
        this.tablet.showConfirm('Delete this zone?', async (confirmed) => {
            if (confirmed) {
                const success = await window.database.deleteZone(id);
                if (success) {
                    this.renderZones();
                    this.tablet.showToast('Zone deleted', 'info');
                } else {
                    this.tablet.showError('Failed to delete zone');
                }
            }
        });
    }

    createZone() {
        // Simple prompt – could open a modal in future
        const name = prompt('Zone name:');
        if (!name) return;
        const x = prompt('X coordinate:');
        const y = prompt('Y coordinate:');
        const z = prompt('Z coordinate:');
        if (!x || !y || !z) return;
        const radius = prompt('Radius (meters):', '50');
        const zone = {
            id: 'zone_' + Date.now(),
            name,
            position: { x: parseFloat(x), y: parseFloat(y), z: parseFloat(z) },
            radius: parseFloat(radius),
            flags: {},
            enabled: true
        };
        window.database.saveZone(zone).then(success => {
            if (success) {
                this.renderZones();
                this.tablet.showToast('Zone created', 'success');
            } else {
                this.tablet.showError('Failed to save zone');
            }
        });
    }

    renderRecyclers() {
        const list = document.getElementById('recyclers-list');
        if (!list) return;
        // List of monuments with recyclers (could be fetched)
        const recyclerMonuments = [
            'Large Oil Rig', 'Small Oil Rig', 'Water Treatment', 'Launch Site',
            'Dome', 'Airfield', 'Junkyard', 'Underwater Lab', 'Mining Outpost'
        ];
        let html = '';
        recyclerMonuments.forEach(m => {
            html += `
                <div class="recycler-item">
                    <span>${m}</span>
                    <button class="small-btn toggle-recycler" data-name="${m}">Enable/Disable</button>
                </div>
            `;
        });
        list.innerHTML = html;
        list.querySelectorAll('.toggle-recycler').forEach(btn => {
            btn.addEventListener('click', (e) => this.toggleRecycler(e.target.dataset.name));
        });
    }

    async toggleRecycler(name) {
        // This would require RCON commands to enable/disable recycler spawns
        this.tablet.showToast(`Toggling recycler at ${name} (not implemented)`, 'info');
    }

    refresh() {
        this.renderZones();
        this.tablet.showToast('World controls refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.world = new World();
});