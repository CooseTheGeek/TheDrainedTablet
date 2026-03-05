// HEATMAP VISUALIZATION - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class HeatmapVisualizer {
    constructor(tablet) {
        this.tablet = tablet;
        this.data = this.loadData();
        this.zones = [];
        this.currentMode = 'players';
        this.timeRange = '24h';
        this.init();
    }

    loadData() {
        const saved = localStorage.getItem('drained_heatmap_data');
        return saved ? JSON.parse(saved) : {
            playerPositions: [],
            deathMarkers: [],
            pvpZones: [],
            buildZones: []
        };
    }

    saveData() {
        localStorage.setItem('drained_heatmap_data', JSON.stringify(this.data));
    }

    init() {
        this.createHeatmapHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'heatmap') {
                this.refresh();
            }
        });
    }

    createHeatmapHTML() {
        const heatmapTab = document.getElementById('tab-heatmap');
        if (!heatmapTab) return;

        heatmapTab.innerHTML = `
            <div class="heatmap-container">
                <div class="heatmap-header">
                    <h2>🔥 ACTIVITY HEATMAP</h2>
                </div>

                <div class="heatmap-controls">
                    <div class="control-group">
                        <label>Mode:</label>
                        <select id="heatmap-mode">
                            <option value="players">Player Activity</option>
                            <option value="deaths">Death Locations</option>
                            <option value="pvp">PvP Zones</option>
                            <option value="building">Building Activity</option>
                        </select>
                    </div>

                    <div class="control-group">
                        <label>Time Range:</label>
                        <select id="heatmap-time">
                            <option value="1h">Last Hour</option>
                            <option value="24h" selected>Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>

                    <div class="control-group">
                        <label>Opacity:</label>
                        <input type="range" id="heatmap-opacity" min="0.1" max="1" step="0.1" value="0.7">
                    </div>

                    <button id="generate-heatmap" class="heatmap-btn primary">GENERATE</button>
                    <button id="clear-heatmap" class="heatmap-btn">CLEAR</button>
                </div>

                <div class="heatmap-canvas-container">
                    <canvas id="heatmap-canvas" width="800" height="600"></canvas>
                </div>

                <div class="heatmap-legend">
                    <div class="legend-item"><span class="color-box low"></span> Low Activity</div>
                    <div class="legend-item"><span class="color-box medium"></span> Medium Activity</div>
                    <div class="legend-item"><span class="color-box high"></span> High Activity</div>
                    <div class="legend-item"><span class="color-box peak"></span> Peak Activity</div>
                </div>

                <div class="heatmap-stats">
                    <h3>STATISTICS</h3>
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value" id="total-points">0</div>
                            <div class="stat-label">Data Points</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="hotspot-count">0</div>
                            <div class="stat-label">Hotspots</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" id="peak-location">-</div>
                            <div class="stat-label">Peak Location</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('generate-heatmap')?.addEventListener('click', () => this.generateHeatmap());
        document.getElementById('clear-heatmap')?.addEventListener('click', () => this.clearHeatmap());
        
        document.getElementById('heatmap-mode')?.addEventListener('change', (e) => {
            this.currentMode = e.target.value;
        });

        document.getElementById('heatmap-time')?.addEventListener('change', (e) => {
            this.timeRange = e.target.value;
        });
    }

    generateHeatmap() {
        const canvas = document.getElementById('heatmap-canvas');
        const ctx = canvas.getContext('2d');
        const mode = this.currentMode;
        const opacity = parseFloat(document.getElementById('heatmap-opacity').value);

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw base map
        this.drawBaseMap(ctx);

        // Generate mock data based on mode
        const points = this.generateMockData(mode);
        
        // Draw heatmap
        this.drawHeatmap(ctx, points, opacity);

        // Update stats
        document.getElementById('total-points').innerText = points.length;
        document.getElementById('hotspot-count').innerText = Math.floor(Math.random() * 10 + 5);
        document.getElementById('peak-location').innerText = 'Dome';

        this.tablet.showToast(`Generated ${mode} heatmap`, 'success');
    }

    drawBaseMap(ctx) {
        // Draw grid
        ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * 800;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 600);
            ctx.stroke();

            const y = (i / 10) * 600;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(800, y);
            ctx.stroke();
        }

        // Draw monuments
        const monuments = [
            { x: 274, y: 85, name: 'Dome' },
            { x: 114, y: 342, name: 'Airfield' },
            { x: 685, y: 480, name: 'Launch' },
            { x: 502, y: 257, name: 'Power Plant' }
        ];

        ctx.fillStyle = '#FFB100';
        ctx.font = '12px monospace';
        monuments.forEach(m => {
            ctx.beginPath();
            ctx.arc(m.x, m.y, 4, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillText(m.name, m.x + 8, m.y - 8);
        });
    }

    drawHeatmap(ctx, points, opacity) {
        const width = 800;
        const height = 600;
        const cellSize = 20;
        const cols = Math.floor(width / cellSize);
        const rows = Math.floor(height / cellSize);

        // Create density grid
        const grid = Array(rows).fill().map(() => Array(cols).fill(0));

        points.forEach(point => {
            const col = Math.floor(point.x / cellSize);
            const row = Math.floor(point.y / cellSize);
            if (row >= 0 && row < rows && col >= 0 && col < cols) {
                grid[row][col] += point.weight || 1;
            }
        });

        // Find max density
        let maxDensity = 0;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                maxDensity = Math.max(maxDensity, grid[r][c]);
            }
        }

        // Draw heatmap cells
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 0) continue;

                const intensity = grid[r][c] / maxDensity;
                const color = this.getHeatColor(intensity, opacity);

                ctx.fillStyle = color;
                ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
            }
        }
    }

    getHeatColor(intensity, opacity) {
        if (intensity > 0.8) return `rgba(255, 0, 0, ${opacity})`;      // Peak - Red
        if (intensity > 0.6) return `rgba(255, 128, 0, ${opacity})`;   // High - Orange
        if (intensity > 0.4) return `rgba(255, 255, 0, ${opacity})`;   // Medium - Yellow
        if (intensity > 0.2) return `rgba(128, 255, 0, ${opacity})`;   // Low - Green
        return `rgba(0, 255, 0, ${opacity * 0.5})`;                    // Very Low - Light Green
    }

    generateMockData(mode) {
        const points = [];
        const count = mode === 'players' ? 500 : 
                     mode === 'deaths' ? 200 : 
                     mode === 'pvp' ? 300 : 150;

        // Hotspots
        const hotspots = [
            { x: 274, y: 85, weight: 5 },  // Dome
            { x: 114, y: 342, weight: 4 }, // Airfield
            { x: 685, y: 480, weight: 5 }, // Launch
            { x: 502, y: 257, weight: 3 }, // Power Plant
            { x: 400, y: 400, weight: 2 }, // Random
            { x: 600, y: 200, weight: 3 }  // Random
        ];

        for (let i = 0; i < count; i++) {
            const hotspot = hotspots[Math.floor(Math.random() * hotspots.length)];
            const x = hotspot.x + (Math.random() - 0.5) * 100;
            const y = hotspot.y + (Math.random() - 0.5) * 100;
            const weight = hotspot.weight * (0.5 + Math.random() * 0.5);

            points.push({
                x: Math.max(0, Math.min(800, x)),
                y: Math.max(0, Math.min(600, y)),
                weight: weight
            });
        }

        return points;
    }

    clearHeatmap() {
        const canvas = document.getElementById('heatmap-canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawBaseMap(ctx);
        this.tablet.showToast('Heatmap cleared', 'info');
    }

    refresh() {
        this.tablet.showToast('Heatmap visualizer refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.heatmapVisualizer = new HeatmapVisualizer(window.drainedTablet);
});