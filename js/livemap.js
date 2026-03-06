// LIVE MAP - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek)
// CONNECTS TO GPORTAL - NO MOCK DATA

class LiveMap {
    constructor() {
        this.tablet = window.drainedTablet;
        this.canvas = null;
        this.ctx = null;
        this.mapImage = null;
        this.mapUrl = '';
        this.players = [];
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.dragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.markers = [];
        this.mapLoaded = false;
        this.useFallback = false;
        
        this.init();
    }

    init() {
        console.log('LiveMap initializing...');
        this.setupCanvas();
        this.setupEventListeners();
        this.loadMap();
        
        // Listen for player updates
        window.addEventListener('players-updated', (e) => {
            this.players = e.detail.players;
            if (this.mapLoaded || this.useFallback) {
                this.drawMap();
            }
        });

        // Listen for tab changes
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'livemap') {
                this.refresh();
            }
        });

        // Listen for manual refresh event
        window.addEventListener('map-refresh', () => {
            this.loadMap();
        });
    }

    setupCanvas() {
        this.canvas = document.getElementById('live-map');
        if (!this.canvas) {
            console.error('Live map canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        
        this.canvas.width = containerWidth;
        this.canvas.height = containerWidth * 0.5; // 2:1 aspect ratio
        if (this.mapLoaded || this.useFallback) {
            this.drawMap();
        }
    }

    setupEventListeners() {
        // Canvas interactions
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
            this.canvas.addEventListener('mousemove', (e) => this.drag(e));
            this.canvas.addEventListener('mouseup', () => this.stopDrag());
            this.canvas.addEventListener('mouseleave', () => this.stopDrag());
            this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
            this.canvas.addEventListener('mousemove', (e) => this.trackMouse(e));
        }
    }

    loadMap() {
        if (!this.canvas) return;

        // Get map URL from GPortal
        const ip = this.tablet.serverConfig.ip;
        const mapPort = 28016; // Default GPortal map port
        
        // Try HTTPS first, then fallback to HTTP (will be blocked but we have grid fallback)
        this.mapUrl = `https://${ip}:${mapPort}/map.png`;
        
        // Update status
        const coordsEl = document.querySelector('.map-coords');
        if (coordsEl) coordsEl.innerText = 'Loading map...';

        this.mapImage = new Image();
        this.mapImage.crossOrigin = 'anonymous';
        this.mapImage.src = this.mapUrl;

        this.mapImage.onload = () => {
            console.log('Map image loaded successfully');
            this.mapLoaded = true;
            this.useFallback = false;
            this.drawMap();
            if (coordsEl) coordsEl.innerText = 'Map loaded';
        };

        this.mapImage.onerror = () => {
            console.warn('Failed to load map image over HTTPS, using grid fallback');
            this.mapLoaded = false;
            this.useFallback = true;
            this.drawGrid();
            if (coordsEl) coordsEl.innerText = 'Map unavailable - showing grid';
            
            // Try HTTP as last resort (will be blocked by mixed content, but we already have fallback)
            const httpUrl = `http://${ip}:${mapPort}/map.png`;
            const httpImg = new Image();
            httpImg.src = httpUrl;
            httpImg.onload = () => {
                console.log('Map image loaded over HTTP');
                this.mapImage = httpImg;
                this.mapLoaded = true;
                this.useFallback = false;
                this.drawMap();
                if (coordsEl) coordsEl.innerText = 'Map loaded (HTTP)';
            };
        };
    }

    drawMap() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply zoom and pan
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);

        // Draw map or grid
        if (this.mapLoaded && this.mapImage && this.mapImage.complete) {
            this.ctx.drawImage(this.mapImage, 0, 0, this.canvas.width / this.zoom, this.canvas.height / this.zoom);
        } else {
            this.drawGrid();
        }

        // Draw player markers (real players only)
        this.drawPlayers();

        this.ctx.restore();
    }

    drawGrid() {
        if (!this.ctx) return;

        const width = this.canvas.width / this.zoom;
        const height = this.canvas.height / this.zoom;
        const gridSize = 50 / this.zoom;

        // Fill background
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        this.ctx.lineWidth = 1 / this.zoom;

        // Draw vertical lines
        for (let x = 0; x <= width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y <= height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }

        // Draw grid labels
        this.ctx.fillStyle = '#FFB100';
        this.ctx.font = `${12 / this.zoom}px 'Inter'`;
        this.ctx.textAlign = 'left';

        for (let i = 0; i < 10; i++) {
            const x = i * gridSize * 10 + 5;
            const y = i * gridSize * 10 + 20;
            this.ctx.fillText(String.fromCharCode(65 + i), x / this.zoom, 20 / this.zoom);
            this.ctx.fillText((i + 1).toString(), 10 / this.zoom, y / this.zoom);
        }

        // Draw "MAP UNAVAILABLE" text
        this.ctx.font = `${24 / this.zoom}px 'Inter'`;
        this.ctx.fillStyle = 'rgba(255, 177, 0, 0.5)';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('MAP UNAVAILABLE', width / 2, height / 2 - 20 / this.zoom);
        this.ctx.font = `${16 / this.zoom}px 'Inter'`;
        this.ctx.fillText('Using grid fallback', width / 2, height / 2 + 20 / this.zoom);
    }

    drawPlayers() {
        if (!this.ctx || !this.players || this.players.length === 0) return;

        const mapSize = this.tablet.serverConfig.mapSize || 3500;
        const width = this.canvas.width / this.zoom;
        const height = this.canvas.height / this.zoom;

        this.players.forEach(player => {
            if (!player.position) return; // skip if no position data
            
            // Convert world coordinates to pixel coordinates
            // Simple linear mapping (can be improved with calibration data)
            const x = (player.position.x / mapSize + 0.5) * width;
            const y = (player.position.z / mapSize + 0.5) * height;

            // Draw player dot
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6 / this.zoom, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#FFB100';
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2 / this.zoom;
            this.ctx.stroke();

            // Draw player name
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = `${12 / this.zoom}px 'Inter'`;
            this.ctx.fillText(player.name, x + 10 / this.zoom, y - 10 / this.zoom);
        });
    }

    startDrag(e) {
        this.dragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.canvas.style.cursor = 'grabbing';
    }

    drag(e) {
        if (!this.dragging) return;

        const dx = e.clientX - this.lastX;
        const dy = e.clientY - this.lastY;

        this.panX += dx;
        this.panY += dy;

        this.lastX = e.clientX;
        this.lastY = e.clientY;

        this.drawMap();
    }

    stopDrag() {
        this.dragging = false;
        this.canvas.style.cursor = 'grab';
    }

    handleWheel(e) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.zoom = Math.max(0.5, Math.min(3, this.zoom + delta));
        this.drawMap();
    }

    trackMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;

        const x = ((e.clientX - rect.left - this.panX) * scaleX) / this.zoom;
        const y = ((e.clientY - rect.top - this.panY) * scaleY) / this.zoom;

        const mapSize = this.tablet.serverConfig.mapSize || 3500;
        const gameX = Math.round((x / (this.canvas.width / this.zoom) - 0.5) * mapSize);
        const gameZ = Math.round((y / (this.canvas.height / this.zoom) - 0.5) * mapSize);

        const coordsEl = document.querySelector('.map-coords');
        if (coordsEl) {
            coordsEl.innerHTML = `X: ${gameX}  Z: ${gameZ}`;
        }
    }

    refresh() {
        console.log('Refreshing live map');
        this.loadMap();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.liveMap = new LiveMap();
});
