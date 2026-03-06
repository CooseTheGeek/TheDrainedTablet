// 3D MAP VIEW - EXCLUSIVE FEATURE
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class Map3D {
    constructor(tablet) {
        this.tablet = tablet;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.players = [];
        this.monuments = this.loadMonuments();
        this.rotation = 0;
        this.zoom = 1;
        this.init();
    }

    loadMonuments() {
        return [
            { name: 'Dome', x: 1200, z: 500, height: 100, color: 0xffaa00 },
            { name: 'Airfield', x: 500, z: 2000, height: 50, color: 0x00aaff },
            { name: 'Launch Site', x: 3000, z: 2800, height: 200, color: 0xff5500 },
            { name: 'Power Plant', x: 2200, z: 1500, height: 80, color: 0xffff00 },
            { name: 'Large Oil Rig', x: 3400, z: 3400, height: 150, color: 0xff0000 }
        ];
    }

    init() {
        console.log('Map3D initializing...');
        this.create3DHTML();
        this.setupEventListeners();
        this.initThreeJS();
        this.startAnimation();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'map3d') {
                this.refresh();
            }
        });
        
        window.addEventListener('player-update', (e) => {
            this.players = e.detail;
            this.updatePlayers();
        });
    }

    startAnimation() {
        // Stub method to prevent errors
        console.log('3D map animation started (stub)');
        // If you want continuous updates, you could implement requestAnimationFrame here
    }

    create3DHTML() {
        const map3dTab = document.getElementById('tab-map3d');
        if (!map3dTab) {
            console.error('Map3D tab not found');
            return;
        }

        map3dTab.innerHTML = `
            <div class="map3d-container">
                <div class="map3d-header">
                    <h2>🏔️ 3D MAP VIEW</h2>
                    <div class="map3d-controls">
                        <button id="map3d-rotate" class="map3d-btn">🔄 ROTATE</button>
                        <button id="map3d-zoom-in" class="map3d-btn">➕</button>
                        <button id="map3d-zoom-out" class="map3d-btn">➖</button>
                        <button id="map3d-reset" class="map3d-btn">🔄 RESET</button>
                        <button id="map3d-fullscreen" class="map3d-btn">⛶ FULLSCREEN</button>
                    </div>
                </div>
                
                <div class="map3d-canvas-container">
                    <div id="map3d-canvas"></div>
                </div>
                
                <div class="map3d-legend">
                    <div class="legend-item"><span class="legend-color" style="background: #ffaa00"></span> Monuments</div>
                    <div class="legend-item"><span class="legend-color" style="background: #00ff00"></span> Players</div>
                    <div class="legend-item"><span class="legend-color" style="background: #ff0000"></span> Raiders</div>
                    <div class="legend-item"><span class="legend-color" style="background: #0000ff"></span> Scientists</div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('map3d-rotate')?.addEventListener('click', () => this.toggleRotate());
        document.getElementById('map3d-zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('map3d-zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('map3d-reset')?.addEventListener('click', () => this.resetView());
        document.getElementById('map3d-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    }

    initThreeJS() {
        const container = document.getElementById('map3d-canvas');
        if (!container) return;

        // Create a simple canvas-based 3D view
        const canvas = document.createElement('canvas');
        canvas.width = container.clientWidth;
        canvas.height = 500;
        container.appendChild(canvas);

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        this.draw3DView();
    }

    draw3DView() {
        if (!this.ctx || !this.canvas) return;

        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // Draw sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#111');
        gradient.addColorStop(1, '#333');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // Draw horizon line
        ctx.strokeStyle = '#FFB100';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.7);
        ctx.lineTo(w, h * 0.7);
        ctx.stroke();

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i < 20; i++) {
            const x = (i / 20) * w;
            const y = h * 0.7;
            const height = (i % 5) * 50;

            // Perspective lines
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 50, h);
            ctx.stroke();
        }

        // Draw monuments as 3D blocks
        this.monuments.forEach((monument) => {
            const x = (monument.x / 3500) * w;
            const baseY = h * 0.7 - (monument.z / 3500) * 200;
            const height = monument.height;

            // Draw 3D block
            ctx.fillStyle = `rgba(${(monument.color >> 16) & 255}, ${(monument.color >> 8) & 255}, ${monument.color & 255}, 0.8)`;
            
            // Top face
            ctx.beginPath();
            ctx.moveTo(x - 15, baseY - height);
            ctx.lineTo(x + 15, baseY - height);
            ctx.lineTo(x + 25, baseY - height + 10);
            ctx.lineTo(x - 5, baseY - height + 10);
            ctx.closePath();
            ctx.fill();

            // Front face
            ctx.fillStyle = `rgba(${(monument.color >> 16) & 255}, ${(monument.color >> 8) & 255}, ${monument.color & 255}, 0.6)`;
            ctx.fillRect(x - 10, baseY - height + 10, 30, height - 10);

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '10px monospace';
            ctx.fillText(monument.name, x - 20, baseY - height - 5);
        });

        // Draw players
        this.players.forEach(player => {
            const x = (player.x / 3500) * w;
            const baseY = h * 0.7 - (player.z / 3500) * 200;

            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.arc(x, baseY - 20, 5, 0, 2 * Math.PI);
            ctx.fill();
            
            // Glow effect
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        requestAnimationFrame(() => this.draw3DView());
    }

    updatePlayers() {
        // Redraw with new player positions
        this.draw3DView();
    }

    toggleRotate() {
        this.tablet.showToast('Rotate toggled', 'info');
    }

    zoomIn() {
        this.zoom *= 1.2;
        this.draw3DView();
    }

    zoomOut() {
        this.zoom /= 1.2;
        this.draw3DView();
    }

    resetView() {
        this.zoom = 1;
        this.rotation = 0;
        this.draw3DView();
    }

    toggleFullscreen() {
        const container = document.querySelector('.map3d-canvas-container');
        if (container.requestFullscreen) {
            container.requestFullscreen();
        }
    }

    refresh() {
        this.draw3DView();
        this.tablet.showToast('3D map refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.map3d = new Map3D(window.drainedTablet);
});
