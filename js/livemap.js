// livemap.js – DRAINED TABLET ULTIMATE v7.0.0
// Live map with real player positions, monument markers, and responsive hamburger tabs.
// Fetches monument positions automatically via RCON (GPortal bridge).

class Livemap {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.mapConfig = window.MAP_CONFIG;
        this.canvas = null;
        this.ctx = null;
        this.mapImage = null;
        this.imageLoaded = false;
        this.players = [];
        this.monuments = [];
        this.filteredMonuments = [];
        this.activeCategory = 'all';
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.dragging = false;
        this.lastX = 0;
        this.lastY = 0;
        this.resizeObserver = null;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.loadMapImage();
        this.fetchMonuments();
        window.addEventListener('players-updated', (e) => {
            this.players = e.detail.players;
            this.draw();
        });
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'livemap') {
                this.refresh();
            }
        });
        window.addEventListener('resize', () => this.handleResize());
        this.setupResizeObserver();
    }

    createHTML() {
        const tab = document.getElementById('tab-livemap');
        if (!tab) return;

        tab.innerHTML = `
            <div class="map-wrapper">
                <button class="map-hamburger" aria-label="Menu" aria-expanded="false">
                    <span></span><span></span><span></span>
                </button>
                <nav class="map-tab-nav">
                    <button class="map-tab-btn active" data-category="all">All</button>
                    <button class="map-tab-btn" data-category="quarries">Quarries</button>
                    <button class="map-tab-btn" data-category="bases">Bases & Camps</button>
                    <button class="map-tab-btn" data-category="villages">Villages</button>
                    <button class="map-tab-btn" data-category="other">Other</button>
                </nav>
                <div class="map-container">
                    <canvas id="live-map-canvas"></canvas>
                    <div id="map-coords" class="map-coords"></div>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('live-map-canvas');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
            this.setCanvasSize();
        }
    }

    attachEvents() {
        // Tab buttons
        document.querySelectorAll('.map-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.map-tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.activeCategory = e.target.dataset.category;
                this.filterMonuments();
                this.draw();
                if (window.innerWidth <= 768) {
                    document.querySelector('.map-tab-nav').classList.remove('open');
                    document.querySelector('.map-hamburger').setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Hamburger toggle
        const hamburger = document.querySelector('.map-hamburger');
        const tabNav = document.querySelector('.map-tab-nav');
        hamburger.addEventListener('click', () => {
            const expanded = hamburger.getAttribute('aria-expanded') === 'true' ? false : true;
            hamburger.setAttribute('aria-expanded', expanded);
            tabNav.classList.toggle('open');
        });

        // Canvas events for pan/zoom
        this.canvas.addEventListener('mousedown', (e) => this.startDrag(e));
        this.canvas.addEventListener('mousemove', (e) => this.drag(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrag());
        this.canvas.addEventListener('mouseleave', () => this.stopDrag());
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('mousemove', (e) => this.trackMouse(e));
    }

    setupResizeObserver() {
        this.resizeObserver = new ResizeObserver(() => this.handleResize());
        const container = document.querySelector('.map-container');
        if (container) this.resizeObserver.observe(container);
    }

    handleResize() {
        this.setCanvasSize();
        if (this.imageLoaded) this.draw();
    }

    setCanvasSize() {
        const container = document.querySelector('.map-container');
        if (!container || !this.canvas) return;
        const width = container.clientWidth;
        const height = width * (this.mapConfig.map.measured.h / this.mapConfig.map.measured.w);
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
    }

    loadMapImage() {
        const imgUrl = this.mapConfig.map.imageUrl;
        this.mapImage = new Image();
        this.mapImage.crossOrigin = 'anonymous';
        this.mapImage.src = imgUrl;
        this.mapImage.onload = () => {
            this.imageLoaded = true;
            this.draw();
        };
        this.mapImage.onerror = () => {
            console.warn('Map image failed to load, using fallback grid');
            this.imageLoaded = false;
            this.draw();
        };
    }

    async fetchMonuments() {
        try {
            // Send command via GPortal bridge
            const res = await fetch(`${AppState.connection.bridgeUrl}/api/gportal/command`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: 'find_entity *' })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Failed to fetch monuments');
            const raw = data.result || '';
            this.monuments = this.parseMonuments(raw);
            this.filterMonuments();
            this.draw();
        } catch (err) {
            console.error('Failed to fetch monuments:', err);
            // Fallback to mock data for demo
            this.monuments = this.getMockMonuments();
            this.filterMonuments();
            this.draw();
        }
    }

    parseMonuments(raw) {
        const lines = raw.split('\n');
        const monuments = [];
        const seenNames = new Map();

        for (const line of lines) {
            const match = line.match(/Monument "([^"]+)" at \((-?\d+\.?\d*),\s*(-?\d+\.?\d*),\s*(-?\d+\.?\d*)\)/);
            if (match) {
                const internalName = match[1];
                const worldX = parseFloat(match[2]);
                const worldZ = parseFloat(match[4]);
                let displayName = internalName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                // Handle duplicates
                if (seenNames.has(displayName)) {
                    const count = seenNames.get(displayName) + 1;
                    seenNames.set(displayName, count);
                    displayName = `${displayName} (${count})`;
                } else {
                    seenNames.set(displayName, 1);
                }

                const category = this.getCategory(displayName);
                const pixel = this.worldToPixel(worldX, worldZ);
                monuments.push({
                    id: internalName,
                    name: displayName,
                    worldX,
                    worldZ,
                    pixelX: pixel.x,
                    pixelY: pixel.y,
                    category,
                });
            }
        }
        return monuments;
    }

    worldToPixel(worldX, worldZ) {
        const anchors = this.mapConfig.map.anchors;
        const a1 = anchors[0];
        const a2 = anchors[1];
        const scaleX = (a2.pixelX - a1.pixelX) / (a2.worldX - a1.worldX);
        const scaleZ = (a2.pixelY - a1.pixelY) / (a2.worldZ - a1.worldZ);
        const pixelX = a1.pixelX + (worldX - a1.worldX) * scaleX;
        const pixelY = a1.pixelY + (worldZ - a1.worldZ) * scaleZ;
        return { x: pixelX, y: pixelY };
    }

    getCategory(name) {
        const lower = name.toLowerCase();
        if (lower.includes('quarry')) return 'quarries';
        if (lower.includes('camp') || lower.includes('outpost') || lower.includes('military') || lower.includes('barn')) return 'bases';
        if (lower.includes('village') || lower.includes('ranch')) return 'villages';
        return 'other';
    }

    filterMonuments() {
        if (this.activeCategory === 'all') {
            this.filteredMonuments = this.monuments;
        } else {
            this.filteredMonuments = this.monuments.filter(m => m.category === this.activeCategory);
        }
    }

    draw() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.ctx.translate(this.panX, this.panY);
        this.ctx.scale(this.zoom, this.zoom);

        if (this.imageLoaded && this.mapImage) {
            this.ctx.drawImage(this.mapImage, 0, 0, this.canvas.width / this.zoom, this.canvas.height / this.zoom);
        } else {
            this.drawGrid();
        }

        this.drawMonuments();
        this.drawPlayers();
        this.ctx.restore();
    }

    drawGrid() {
        const w = this.canvas.width / this.zoom;
        const h = this.canvas.height / this.zoom;
        const gridSize = 50 / this.zoom;

        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, w, h);

        this.ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        this.ctx.lineWidth = 1 / this.zoom;
        for (let x = 0; x <= w; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, h);
            this.ctx.stroke();
        }
        for (let y = 0; y <= h; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
            this.ctx.stroke();
        }

        this.ctx.fillStyle = '#FFB100';
        this.ctx.font = `${12 / this.zoom}px 'Inter'`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Map image not loaded', w/2, h/2);
        this.ctx.font = `${10 / this.zoom}px 'Inter'`;
        this.ctx.fillText('Using grid fallback', w/2, h/2 + 20 / this.zoom);
    }

    drawMonuments() {
        for (const m of this.filteredMonuments) {
            const x = m.pixelX / (this.mapConfig.map.measured.w / this.zoom);
            const y = m.pixelY / (this.mapConfig.map.measured.h / this.zoom);
            this.ctx.beginPath();
            this.ctx.arc(x, y, 6 / this.zoom, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#FFB100';
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1 / this.zoom;
            this.ctx.stroke();
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `${10 / this.zoom}px 'Inter'`;
            this.ctx.fillText(m.name, x + 8 / this.zoom, y - 6 / this.zoom);
        }
    }

    drawPlayers() {
        if (!this.players.length) return;
        const mapSize = this.mapConfig.map.worldSize;
        const w = this.canvas.width / this.zoom;
        const h = this.canvas.height / this.zoom;

        for (const player of this.players) {
            if (!player.position) continue;
            const x = ((player.position.x / mapSize) + 0.5) * w;
            const y = ((player.position.z / mapSize) + 0.5) * h;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5 / this.zoom, 0, 2 * Math.PI);
            this.ctx.fillStyle = '#00ff00';
            this.ctx.fill();
            this.ctx.fillStyle = '#fff';
            this.ctx.font = `${10 / this.zoom}px 'Inter'`;
            this.ctx.fillText(player.name, x + 8 / this.zoom, y - 6 / this.zoom);
        }
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
        this.draw();
    }

    stopDrag() {
        this.dragging = false;
        this.canvas.style.cursor = 'grab';
    }

    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.zoom = Math.max(0.5, Math.min(3, this.zoom + delta));
        this.draw();
    }

    trackMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        const x = ((e.clientX - rect.left - this.panX) * scaleX) / this.zoom;
        const y = ((e.clientY - rect.top - this.panY) * scaleY) / this.zoom;
        const mapSize = this.mapConfig.map.worldSize;
        const gameX = Math.round((x / (this.canvas.width / this.zoom) - 0.5) * mapSize);
        const gameZ = Math.round((y / (this.canvas.height / this.zoom) - 0.5) * mapSize);
        const coordsEl = document.getElementById('map-coords');
        if (coordsEl) coordsEl.innerText = `X: ${gameX}  Z: ${gameZ}`;
    }

    getMockMonuments() {
        // Fallback data in case RCON fails
        return [
            { name: 'HQM Quarry', category: 'quarries', pixelX: 420, pixelY: 560 },
            { name: 'Stone Quarry', category: 'quarries', pixelX: 540, pixelY: 410 },
            { name: 'Sulfur Quarry', category: 'quarries', pixelX: 380, pixelY: 640 },
            { name: 'Bandit Camp', category: 'bases', pixelX: 780, pixelY: 320 },
            { name: 'Outpost', category: 'bases', pixelX: 280, pixelY: 720 },
            { name: 'Fishing Village', category: 'villages', pixelX: 260, pixelY: 520 },
            { name: 'Large Fishing Village', category: 'villages', pixelX: 520, pixelY: 300 },
            { name: 'Airfield', category: 'other', pixelX: 640, pixelY: 350 },
            { name: 'Launch Site', category: 'other', pixelX: 870, pixelY: 670 }
        ];
    }

    refresh() {
        this.fetchMonuments();
        this.draw();
        this.tablet.showToast('Live map refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.livemap = new Livemap();
});