// LIVE MAP - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class LiveMap {
    constructor(tablet) {
        this.tablet = tablet;
        this.mapImage = null;
        this.players = [];
        this.monuments = this.loadMonuments();
        this.entities = {
            scientists: [],
            murderers: [],
            scarecrows: [],
            bradley: null,
            heli: null,
            chinook: null,
            cargoShip: null,
            lockedCrates: [],
            animals: []
        };
        this.mapSize = 3500;
        this.mapSeed = 10325;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.dragging = false;
        self.lastMouseX = 0;
        self.lastMouseY = 0;
        self.showGrid = true;
        self.showPlayers = true;
        self.showEntities = true;
        self.showMonuments = true;
        self.selectedPlayer = null;
        self.init();
    }

    loadMonuments() {
        return [
            { id: 'dome', name: 'Dome', x: 1200, z: 500, icon: '🏛️', type: 'monument' },
            { id: 'harbor_small', name: 'Small Harbor', x: 800, z: 1200, icon: '⚓', type: 'harbor' },
            { id: 'harbor_large', name: 'Large Harbor', x: 2800, z: 800, icon: '⚓', type: 'harbor' },
            { id: 'airfield', name: 'Airfield', x: 500, z: 2000, icon: '✈️', type: 'monument' },
            { id: 'launch_site', name: 'Launch Site', x: 3000, z: 2800, icon: '🚀', type: 'monument' },
            { id: 'powerplant', name: 'Power Plant', x: 2200, z: 1500, icon: '⚡', type: 'monument' },
            { id: 'trainyard', name: 'Train Yard', x: 1800, z: 2500, icon: '🚂', type: 'monument' },
            { id: 'water_treatment', name: 'Water Treatment', x: 1000, z: 3000, icon: '💧', type: 'monument' },
            { id: 'lighthouse', name: 'Lighthouse', x: 400, z: 3200, icon: '🗼', type: 'monument' },
            { id: 'sewer', name: 'Sewer Branch', x: 2600, z: 400, icon: '🕳️', type: 'monument' },
            { id: 'oxums', name: 'Oxum\'s Gas Station', x: 1400, z: 1800, icon: '⛽', type: 'monument' },
            { id: 'quarry_sulfur', name: 'Sulfur Quarry', x: 200, z: 800, icon: '⛏️', type: 'quarry' },
            { id: 'quarry_stone', name: 'Stone Quarry', x: 3200, z: 200, icon: '⛏️', type: 'quarry' },
            { id: 'quarry_hqm', name: 'HQM Quarry', x: 2800, z: 3200, icon: '⛏️', type: 'quarry' },
            { id: 'satellite', name: 'Satellite Dish', x: 600, z: 2600, icon: '📡', type: 'monument' },
            { id: 'supermarket', name: 'Abandoned Supermarket', x: 2000, z: 600, icon: '🏪', type: 'monument' },
            { id: 'oilrig_large', name: 'Large Oil Rig', x: 3400, z: 3400, icon: '🛢️', type: 'oilrig' },
            { id: 'oilrig_small', name: 'Small Oil Rig', x: 100, z: 100, icon: '🛢️', type: 'oilrig' },
            { id: 'military_tunnel', name: 'Military Tunnel', x: 1400, z: 1400, icon: '🚇', type: 'monument' },
            { id: 'underwater_lab', name: 'Underwater Lab', x: 2200, z: 2200, icon: '🌊', type: 'monument' },
            { id: 'well_a', name: 'Water Well A', x: 400, z: 400, icon: '💧', type: 'well' },
            { id: 'well_b', name: 'Water Well B', x: 800, z: 800, icon: '💧', type: 'well' },
            { id: 'well_c', name: 'Water Well C', x: 1200, z: 1200, icon: '💧', type: 'well' },
            { id: 'well_d', name: 'Water Well D', x: 1600, z: 1600, icon: '💧', type: 'well' },
            { id: 'well_e', name: 'Water Well E', x: 2000, z: 2000, icon: '💧', type: 'well' },
            { id: 'mining_outpost', name: 'Mining Outpost', x: 2400, z: 2400, icon: '⛏️', type: 'monument' },
            { id: 'junkyard', name: 'Junkyard', x: 2800, z: 2800, icon: '🗑️', type: 'monument' }
        ];
    }

    init() {
        this.createMapHTML();
        this.setupEventListeners();
        this.loadMapImage();
        this.startTracking();
        
        // Listen for player updates
        window.addEventListener('player-update', (e) => {
            this.players = e.detail;
            this.drawMap();
        });
        
        // Listen for tab changes
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'livemap') {
                this.refresh();
            }
        });
    }

    createMapHTML() {
        const mapTab = document.getElementById('tab-livemap');
        if (!mapTab) return;

        mapTab.innerHTML = `
            <div class="map-container">
                <div class="map-toolbar">
                    <div class="toolbar-group">
                        <button id="map-zoom-in" class="map-btn" title="Zoom In">➕</button>
                        <button id="map-zoom-out" class="map-btn" title="Zoom Out">➖</button>
                        <button id="map-reset" class="map-btn" title="Reset View">🔄</button>
                        <button id="map-center" class="map-btn" title="Center on Selected">🎯</button>
                    </div>
                    
                    <div class="toolbar-group">
                        <button id="map-toggle-grid" class="map-btn active" title="Toggle Grid">🔲</button>
                        <button id="map-toggle-players" class="map-btn active" title="Toggle Players">👥</button>
                        <button id="map-toggle-entities" class="map-btn active" title="Toggle Entities">👾</button>
                        <button id="map-toggle-monuments" class="map-btn active" title="Toggle Monuments">🏛️</button>
                    </div>
                    
                    <div class="toolbar-group">
                        <span id="map-coordinates" class="map-coords">X: 0 Y: 0 Z: 0</span>
                        <button id="map-copy-coords" class="map-btn" title="Copy Coordinates">📋</button>
                    </div>
                    
                    <div class="toolbar-group">
                        <span id="map-players-count" class="map-info">0 players</span>
                        <span id="map-status" class="map-info">Loading map...</span>
                        <button id="map-refresh" class="map-btn" title="Refresh">🔄</button>
                    </div>
                </div>
                
                <div class="map-canvas-container">
                    <canvas id="live-map-canvas" width="1200" height="600"></canvas>
                    
                    <div class="map-legend">
                        <div class="legend-item"><span class="legend-color player-dot"></span> Players</div>
                        <div class="legend-item"><span class="legend-color selected-dot"></span> Selected Player</div>
                        <div class="legend-item"><span class="legend-color scientist-dot"></span> Scientists</div>
                        <div class="legend-item"><span class="legend-color murderer-dot"></span> Murderers</div>
                        <div class="legend-item"><span class="legend-color bradley-dot"></span> Bradley</div>
                        <div class="legend-item"><span class="legend-color heli-dot"></span> Helicopter</div>
                        <div class="legend-item"><span class="legend-color crate-dot"></span> Locked Crate</div>
                    </div>
                    
                    <div class="oil-rig-status" id="oil-rig-status">
                        <div class="rig-status large">
                            <span class="rig-name">Large Oil Rig:</span>
                            <span class="rig-indicator" id="oilrig-large-status">🟢 ACTIVE</span>
                        </div>
                        <div class="rig-status small">
                            <span class="rig-name">Small Oil Rig:</span>
                            <span class="rig-indicator" id="oilrig-small-status">🟢 ACTIVE</span>
                        </div>
                    </div>
                </div>
                
                <div class="map-search">
                    <input type="text" id="map-search-input" placeholder="Search players, entities, or monuments...">
                    <button id="map-search-btn" class="map-btn">🔍</button>
                    <div id="map-search-results" class="map-search-results hidden"></div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        const canvas = document.getElementById('live-map-canvas');
        
        // Zoom controls
        document.getElementById('map-zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('map-zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('map-reset')?.addEventListener('click', () => this.resetView());
        document.getElementById('map-center')?.addEventListener('click', () => this.centerOnSelected());
        
        // Toggle controls
        document.getElementById('map-toggle-grid')?.addEventListener('click', (e) => {
            this.showGrid = !this.showGrid;
            e.target.classList.toggle('active');
            this.drawMap();
        });
        
        document.getElementById('map-toggle-players')?.addEventListener('click', (e) => {
            this.showPlayers = !this.showPlayers;
            e.target.classList.toggle('active');
            this.drawMap();
        });
        
        document.getElementById('map-toggle-entities')?.addEventListener('click', (e) => {
            this.showEntities = !this.showEntities;
            e.target.classList.toggle('active');
            this.drawMap();
        });
        
        document.getElementById('map-toggle-monuments')?.addEventListener('click', (e) => {
            this.showMonuments = !this.showMonuments;
            e.target.classList.toggle('active');
            this.drawMap();
        });
        
        // Canvas interactions
        canvas.addEventListener('mousedown', (e) => this.startDrag(e));
        canvas.addEventListener('mousemove', (e) => this.drag(e));
        canvas.addEventListener('mouseup', () => this.stopDrag());
        canvas.addEventListener('mouseleave', () => this.stopDrag());
        canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Copy coordinates
        document.getElementById('map-copy-coords')?.addEventListener('click', () => this.copyCoordinates());
        
        // Refresh
        document.getElementById('map-refresh')?.addEventListener('click', () => this.refresh());
        
        // Search
        document.getElementById('map-search-btn')?.addEventListener('click', () => this.search());
        document.getElementById('map-search-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.search();
        });
    }

    loadMapImage() {
        const canvas = document.getElementById('live-map-canvas');
        const ctx = canvas.getContext('2d');
        
        // Try to load map from GPortal
        this.mapImage = new Image();
        this.mapImage.crossOrigin = 'anonymous';
        this.mapImage.src = `http://${this.tablet.serverConfig.ip}:28016/map.png`;
        
        this.mapImage.onload = () => {
            document.getElementById('map-status').innerText = 'Map loaded';
            this.drawMap();
        };
        
        this.mapImage.onerror = () => {
            document.getElementById('map-status').innerText = 'Using grid view';
            this.drawMap(); // Will draw grid instead
        };
    }

    drawMap() {
        const canvas = document.getElementById('live-map-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Apply zoom and pan
        ctx.save();
        ctx.translate(this.panX, this.panY);
        ctx.scale(this.zoom, this.zoom);
        
        // Draw map image or grid
        if (this.mapImage && this.mapImage.complete) {
            ctx.drawImage(this.mapImage, 0, 0, canvas.width / this.zoom, canvas.height / this.zoom);
        } else {
            this.drawGrid(ctx, canvas);
        }
        
        // Draw monuments
        if (this.showMonuments) {
            this.drawMonuments(ctx, canvas);
        }
        
        // Draw entities
        if (this.showEntities) {
            this.drawEntities(ctx, canvas);
        }
        
        // Draw players
        if (this.showPlayers) {
            this.drawPlayers(ctx, canvas);
        }
        
        ctx.restore();
        
        // Update info
        document.getElementById('map-players-count').innerText = this.players.length + ' players';
    }

    drawGrid(ctx, canvas) {
        const gridSize = 50 / this.zoom;
        const width = canvas.width / this.zoom;
        const height = canvas.height / this.zoom;
        
        ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        ctx.lineWidth = 1 / this.zoom;
        
        // Draw grid lines
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw grid labels
        ctx.fillStyle = '#FFB100';
        ctx.font = `${12 / this.zoom}px 'JetBrains Mono'`;
        ctx.textAlign = 'left';
        
        for (let i = 0; i < 10; i++) {
            const x = i * gridSize * 10;
            const y = i * gridSize * 10;
            ctx.fillText(String.fromCharCode(65 + i), x + 5, 20 / this.zoom);
            ctx.fillText((i + 1).toString(), 10 / this.zoom, y + 20 / this.zoom);
        }
    }

    drawMonuments(ctx, canvas) {
        this.monuments.forEach(monument => {
            const x = (monument.x / this.mapSize) * (canvas.width / this.zoom);
            const z = (monument.z / this.mapSize) * (canvas.height / this.zoom);
            
            // Draw monument icon
            ctx.font = `${20 / this.zoom}px Arial`;
            ctx.fillStyle = '#FFB100';
            ctx.fillText(monument.icon, x - 10 / this.zoom, z - 10 / this.zoom);
            
            // Draw monument name on hover (simplified)
            if (this.hoveredMonument === monument.id) {
                ctx.font = `${12 / this.zoom}px 'JetBrains Mono'`;
                ctx.fillStyle = '#FFF';
                ctx.fillText(monument.name, x, z - 20 / this.zoom);
            }
        });
    }

    drawEntities(ctx, canvas) {
        // Draw scientists
        this.entities.scientists.forEach(scientist => {
            const x = (scientist.x / this.mapSize) * (canvas.width / this.zoom);
            const z = (scientist.z / this.mapSize) * (canvas.height / this.zoom);
            
            ctx.beginPath();
            ctx.arc(x, z, 4 / this.zoom, 0, 2 * Math.PI);
            ctx.fillStyle = '#FF4444';
            ctx.fill();
        });
        
        // Draw Bradley
        if (this.entities.bradley) {
            const x = (this.entities.bradley.x / this.mapSize) * (canvas.width / this.zoom);
            const z = (this.entities.bradley.z / this.mapSize) * (canvas.height / this.zoom);
            
            ctx.font = `${25 / this.zoom}px Arial`;
            ctx.fillStyle = '#FFAA00';
            ctx.fillText('💥', x - 12 / this.zoom, z - 12 / this.zoom);
        }
        
        // Draw Helicopter
        if (this.entities.heli) {
            const x = (this.entities.heli.x / this.mapSize) * (canvas.width / this.zoom);
            const z = (this.entities.heli.z / this.mapSize) * (canvas.height / this.zoom);
            
            ctx.font = `${25 / this.zoom}px Arial`;
            ctx.fillStyle = '#FF5500';
            ctx.fillText('🚁', x - 12 / this.zoom, z - 12 / this.zoom);
        }
        
        // Draw Cargo Ship
        if (this.entities.cargoShip) {
            const x = (this.entities.cargoShip.x / this.mapSize) * (canvas.width / this.zoom);
            const z = (this.entities.cargoShip.z / this.mapSize) * (canvas.height / this.zoom);
            
            ctx.font = `${25 / this.zoom}px Arial`;
            ctx.fillStyle = '#00AAFF';
            ctx.fillText('🚢', x - 12 / this.zoom, z - 12 / this.zoom);
        }
        
        // Draw Locked Crates
        this.entities.lockedCrates.forEach(crate => {
            const x = (crate.x / this.mapSize) * (canvas.width / this.zoom);
            const z = (crate.z / this.mapSize) * (canvas.height / this.zoom);
            
            ctx.beginPath();
            ctx.arc(x, z, 6 / this.zoom, 0, 2 * Math.PI);
            ctx.fillStyle = '#FFB100';
            ctx.fill();
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2 / this.zoom;
            ctx.stroke();
        });
    }

    drawPlayers(ctx, canvas) {
        this.players.forEach(player => {
            const x = (player.x / this.mapSize) * (canvas.width / this.zoom);
            const z = (player.z / this.mapSize) * (canvas.height / this.zoom);
            
            // Draw player dot
            ctx.beginPath();
            ctx.arc(x, z, 6 / this.zoom, 0, 2 * Math.PI);
            
            if (player.name === this.selectedPlayer) {
                ctx.fillStyle = '#FFB100';
                ctx.shadowColor = '#FFB100';
                ctx.shadowBlur = 10 / this.zoom;
            } else {
                ctx.fillStyle = 'rgba(255, 177, 0, 0.7)';
            }
            
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Draw player name
            if (this.zoom > 0.5) {
                ctx.font = `${12 / this.zoom}px 'JetBrains Mono'`;
                ctx.fillStyle = '#FFF';
                ctx.fillText(player.name, x + 10 / this.zoom, z - 10 / this.zoom);
            }
        });
    }

    startDrag(e) {
        this.dragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }

    drag(e) {
        if (!this.dragging) return;
        
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        
        this.panX += dx;
        this.panY += dy;
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        this.drawMap();
    }

    stopDrag() {
        this.dragging = false;
    }

    handleWheel(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.zoom = Math.max(0.5, Math.min(3, this.zoom + delta));
        this.drawMap();
    }

    handleMouseMove(e) {
        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const canvasX = (e.clientX - rect.left - this.panX) * scaleX / this.zoom;
        const canvasY = (e.clientY - rect.top - this.panY) * scaleY / this.zoom;
        
        const gameX = Math.round((canvasX / (canvas.width / this.zoom)) * this.mapSize);
        const gameZ = Math.round((canvasY / (canvas.height / this.zoom)) * this.mapSize);
        
        document.getElementById('map-coordinates').innerText = `X: ${gameX} Y: 0 Z: ${gameZ}`;
    }

    handleCanvasClick(e) {
        // Select player or entity
        const canvas = e.target;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const canvasX = (e.clientX - rect.left - this.panX) * scaleX / this.zoom;
        const canvasY = (e.clientY - rect.top - this.panY) * scaleY / this.zoom;
        
        const gameX = (canvasX / (canvas.width / this.zoom)) * this.mapSize;
        const gameZ = (canvasY / (canvas.height / this.zoom)) * this.mapSize;
        
        // Find nearby player
        const clickedPlayer = this.players.find(player => {
            const playerX = (player.x / this.mapSize) * (canvas.width / this.zoom);
            const playerZ = (player.z / this.mapSize) * (canvas.height / this.zoom);
            const distance = Math.sqrt(Math.pow(canvasX - playerX, 2) + Math.pow(canvasY - playerZ, 2));
            return distance < 20 / this.zoom;
        });
        
        if (clickedPlayer) {
            this.selectedPlayer = clickedPlayer.name;
            this.tablet.showToast(`Selected: ${clickedPlayer.name}`, 'success');
            this.drawMap();
        }
    }

    zoomIn() {
        this.zoom = Math.min(3, this.zoom + 0.2);
        this.drawMap();
    }

    zoomOut() {
        this.zoom = Math.max(0.5, this.zoom - 0.2);
        this.drawMap();
    }

    resetView() {
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.drawMap();
    }

    centerOnSelected() {
        if (!this.selectedPlayer) {
            this.tablet.showToast('No player selected', 'info');
            return;
        }
        
        const player = this.players.find(p => p.name === this.selectedPlayer);
        if (!player) return;
        
        const canvas = document.getElementById('live-map-canvas');
        this.panX = canvas.width / 2 - (player.x / this.mapSize) * canvas.width;
        this.panY = canvas.height / 2 - (player.z / this.mapSize) * canvas.height;
        
        this.drawMap();
    }

    copyCoordinates() {
        const coords = document.getElementById('map-coordinates').innerText;
        navigator.clipboard.writeText(coords);
        this.tablet.showToast('Coordinates copied', 'success');
    }

    search() {
        const searchTerm = document.getElementById('map-search-input').value.toLowerCase().trim();
        if (!searchTerm) return;
        
        const results = [];
        
        // Search players
        this.players.forEach(player => {
            if (player.name.toLowerCase().includes(searchTerm)) {
                results.push({ type: 'player', name: player.name, x: player.x, z: player.z });
            }
        });
        
        // Search monuments
        this.monuments.forEach(monument => {
            if (monument.name.toLowerCase().includes(searchTerm)) {
                results.push({ type: 'monument', name: monument.name, x: monument.x, z: monument.z });
            }
        });
        
        this.displaySearchResults(results);
    }

    displaySearchResults(results) {
        const resultsDiv = document.getElementById('map-search-results');
        resultsDiv.classList.remove('hidden');
        
        if (results.length === 0) {
            resultsDiv.innerHTML = '<div class="no-results">No results found</div>';
            return;
        }
        
        let html = '';
        results.forEach(result => {
            html += `
                <div class="search-result" onclick="liveMap.goToLocation(${result.x}, ${result.z})">
                    <span class="result-type">${result.type === 'player' ? '👤' : '🏛️'}</span>
                    <span class="result-name">${result.name}</span>
                    <span class="result-coords">(${result.x}, 0, ${result.z})</span>
                </div>
            `;
        });
        
        resultsDiv.innerHTML = html;
    }

    goToLocation(x, z) {
        const canvas = document.getElementById('live-map-canvas');
        this.panX = canvas.width / 2 - (x / this.mapSize) * canvas.width;
        this.panY = canvas.height / 2 - (z / this.mapSize) * canvas.height;
        
        this.drawMap();
        document.getElementById('map-search-results').classList.add('hidden');
        document.getElementById('map-search-input').value = '';
    }

    async startTracking() {
        // Update every 10 seconds
        setInterval(() => this.updateEntities(), 10000);
    }

    async updateEntities() {
        if (!this.tablet.connected) return;
        
        // In real version, this would query RCON
        // Mock data for demo
        this.entities.bradley = {
            x: Math.random() * this.mapSize,
            z: Math.random() * this.mapSize,
            alive: true
        };
        
        this.entities.heli = {
            x: Math.random() * this.mapSize,
            z: Math.random() * this.mapSize,
            active: true
        };
        
        this.entities.lockedCrates = [
            { x: 1200, z: 800 },
            { x: 2500, z: 1500 },
            { x: 3000, z: 2800 }
        ];
        
        // Update oil rig status
        document.getElementById('oilrig-large-status').innerText = Math.random() > 0.7 ? '🔴 TAKEN' : '🟢 ACTIVE';
        document.getElementById('oilrig-small-status').innerText = Math.random() > 0.7 ? '🔴 TAKEN' : '🟢 ACTIVE';
        
        this.drawMap();
    }

    refresh() {
        this.loadMapImage();
        this.updateEntities();
        this.tablet.showToast('Map refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.liveMap = new LiveMap(window.drainedTablet);
});