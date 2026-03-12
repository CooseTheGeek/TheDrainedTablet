// map3d.js – DRAINED TABLET ULTIMATE v7.0.0
// 3D map visualization (simplified canvas version, retains original features).
// Shows monuments, players, and raiders in a 3D perspective.

class Map3D {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.players = [];
        this.monuments = this.loadMonuments();
        this.rotation = 0;
        this.zoom = 1;
        this.canvas = null;
        this.ctx = null;
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
        this.createHTML();
        this.attachEvents();
        this.startAnimation();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'map3d') {
                this.refresh();
            }
        });
        window.addEventListener('players-updated', (e) => {
            this.players = e.detail.players;
            if (document.getElementById('tab-map3d')?.classList.contains('active')) {
                this.draw();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-map3d');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
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
                    <canvas id="map3d-canvas" width="800" height="400"></canvas>
                </div>
                
                <div class="map3d-legend">
                    <div class="legend-item"><span class="legend-color" style="background: #ffaa00"></span> Monuments</div>
                    <div class="legend-item"><span class="legend-color" style="background: #00ff00"></span> Players</div>
                    <div class="legend-item"><span class="legend-color" style="background: #ff0000"></span> Raiders</div>
                    <div class="legend-item"><span class="legend-color" style="background: #0000ff"></span> Scientists</div>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('map3d-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }
    }

    attachEvents() {
        document.getElementById('map3d-rotate')?.addEventListener('click', () => this.toggleRotate());
        document.getElementById('map3d-zoom-in')?.addEventListener('click', () => this.zoomIn());
        document.getElementById('map3d-zoom-out')?.addEventListener('click', () => this.zoomOut());
        document.getElementById('map3d-reset')?.addEventListener('click', () => this.resetView());
        document.getElementById('map3d-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());
    }

    startAnimation() {
        setInterval(() => {
            if (document.getElementById('tab-map3d')?.classList.contains('active')) {
                this.rotation += 0.002;
                this.draw();
            }
        }, 50);
    }

    draw() {
        if (!this.ctx || !this.canvas) return;
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Clear
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, w, h);

        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, '#111');
        gradient.addColorStop(1, '#333');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, w, h);

        // Horizon line
        this.ctx.strokeStyle = '#FFB100';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(0, h * 0.7);
        this.ctx.lineTo(w, h * 0.7);
        this.ctx.stroke();

        // Draw monuments
        this.monuments.forEach((monument) => {
            const x = (monument.x / 3500) * w;
            const baseY = h * 0.7 - (monument.z / 3500) * 200;
            const height = monument.height * this.zoom;

            // Top face
            this.ctx.fillStyle = `rgba(${(monument.color >> 16) & 255}, ${(monument.color >> 8) & 255}, ${monument.color & 255}, 0.8)`;
            this.ctx.beginPath();
            this.ctx.moveTo(x - 15, baseY - height);
            this.ctx.lineTo(x + 15, baseY - height);
            this.ctx.lineTo(x + 25, baseY - height + 10);
            this.ctx.lineTo(x - 5, baseY - height + 10);
            this.ctx.closePath();
            this.ctx.fill();

            // Front face
            this.ctx.fillStyle = `rgba(${(monument.color >> 16) & 255}, ${(monument.color >> 8) & 255}, ${monument.color & 255}, 0.6)`;
            this.ctx.fillRect(x - 10, baseY - height + 10, 30, height - 10);

            // Label
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '10px monospace';
            this.ctx.fillText(monument.name, x - 20, baseY - height - 5);
        });

        // Draw players
        this.players.forEach(player => {
            const x = (player.position?.x / 3500) * w || Math.random() * w;
            const baseY = h * 0.7 - ((player.position?.z || 0) / 3500) * 200;
            this.ctx.fillStyle = '#00ff00';
            this.ctx.beginPath();
            this.ctx.arc(x, baseY - 20, 5, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.shadowColor = '#00ff00';
            this.ctx.shadowBlur = 10;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }

    toggleRotate() {
        // Rotation is automatic; we can toggle animation speed or direction
        this.tablet.showToast('Rotation toggled', 'info');
    }

    zoomIn() {
        this.zoom *= 1.2;
        this.draw();
    }

    zoomOut() {
        this.zoom /= 1.2;
        this.draw();
    }

    resetView() {
        this.zoom = 1;
        this.rotation = 0;
        this.draw();
    }

    toggleFullscreen() {
        const container = document.querySelector('.map3d-canvas-container');
        if (container.requestFullscreen) {
            container.requestFullscreen();
        }
    }

    refresh() {
        this.draw();
        this.tablet.showToast('3D map refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.map3d = new Map3D();
});