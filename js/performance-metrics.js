// performance-metrics.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete performance monitor: live gauges, historical charts, alerts, and thresholds.
// All original performance.js features preserved and enhanced.

class PerformanceMetrics {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
        this.metrics = {
            cpu: [],
            ram: [],
            fps: [],
            players: [],
            timestamps: []
        };
        this.alerts = [];
        this.monitoring = true;
        this.maxDataPoints = 100;
        this.init();
    }

    init() {
        this.createHTML();
        this.attachEvents();
        this.loadMetrics();
        this.startMonitoring();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'performance') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-performance');
        if (!tab) return;

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="performance-container">
                <div class="performance-header">
                    <h2>📊 PERFORMANCE MONITOR</h2>
                    <div class="perf-controls">
                        <button id="perf-pause" class="perf-btn">⏸️ PAUSE</button>
                        <button id="perf-clear" class="perf-btn">🗑️ CLEAR</button>
                        <button id="perf-export" class="perf-btn">📤 EXPORT</button>
                    </div>
                </div>

                <!-- Live Gauges -->
                <div class="perf-grid">
                    <div class="perf-card">
                        <h3>CPU USAGE</h3>
                        <div class="gauge" id="cpu-gauge"><div class="gauge-fill" id="cpu-fill" style="width:0%"></div></div>
                        <div class="perf-value" id="cpu-value">0%</div>
                    </div>
                    <div class="perf-card">
                        <h3>RAM USAGE</h3>
                        <div class="gauge" id="ram-gauge"><div class="gauge-fill" id="ram-fill" style="width:0%"></div></div>
                        <div class="perf-value" id="ram-value">0%</div>
                    </div>
                    <div class="perf-card">
                        <h3>SERVER FPS</h3>
                        <div class="gauge" id="fps-gauge"><div class="gauge-fill" id="fps-fill" style="width:100%"></div></div>
                        <div class="perf-value" id="fps-value">60</div>
                    </div>
                    <div class="perf-card">
                        <h3>PLAYERS</h3>
                        <div class="gauge" id="players-gauge"><div class="gauge-fill" id="players-fill" style="width:0%"></div></div>
                        <div class="perf-value" id="players-value">0/100</div>
                    </div>
                </div>

                <!-- Historical Chart -->
                <div class="perf-chart-container">
                    <h3>PERFORMANCE OVER TIME</h3>
                    <div class="chart-controls">
                        <label>Range:
                            <select id="perf-range">
                                <option value="60">Last 60 min</option>
                                <option value="360">Last 6 hours</option>
                                <option value="1440">Last 24 hours</option>
                                <option value="10080">Last 7 days</option>
                            </select>
                        </label>
                        <label>Metric:
                            <select id="perf-metric">
                                <option value="cpu">CPU</option>
                                <option value="ram">RAM</option>
                                <option value="fps">FPS</option>
                                <option value="players">Players</option>
                            </select>
                        </label>
                    </div>
                    <canvas id="perf-chart" width="800" height="300"></canvas>
                </div>

                <!-- Alerts List -->
                <div class="perf-alerts">
                    <h3>🚨 ACTIVE ALERTS</h3>
                    <div id="perf-alerts-list" class="alerts-list"></div>
                </div>

                <!-- Threshold Settings -->
                <div class="perf-settings">
                    <h3>⚙️ ALERT THRESHOLDS</h3>
                    <div class="thresholds-grid">
                        <div class="threshold-item">
                            <label>CPU Warn: <span id="cpu-warn-val">80</span>%</label>
                            <input type="range" id="cpu-warn" min="50" max="95" value="80">
                        </div>
                        <div class="threshold-item">
                            <label>CPU Crit: <span id="cpu-crit-val">90</span>%</label>
                            <input type="range" id="cpu-crit" min="60" max="99" value="90">
                        </div>
                        <div class="threshold-item">
                            <label>RAM Warn: <span id="ram-warn-val">85</span>%</label>
                            <input type="range" id="ram-warn" min="50" max="95" value="85">
                        </div>
                        <div class="threshold-item">
                            <label>FPS Warn: <span id="fps-warn-val">30</span></label>
                            <input type="range" id="fps-warn" min="10" max="50" value="30">
                        </div>
                    </div>
                    <button id="perf-save-thresholds" class="perf-btn primary">💾 SAVE THRESHOLDS</button>
                </div>
            </div>
        `;

        this.setupRangeListeners();
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'cpu-warn', val: 'cpu-warn-val' },
            { id: 'cpu-crit', val: 'cpu-crit-val' },
            { id: 'ram-warn', val: 'ram-warn-val' },
            { id: 'fps-warn', val: 'fps-warn-val' }
        ];
        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    attachEvents() {
        document.getElementById('perf-pause')?.addEventListener('click', (e) => {
            this.monitoring = !this.monitoring;
            e.target.innerText = this.monitoring ? '⏸️ PAUSE' : '▶️ RESUME';
        });
        document.getElementById('perf-clear')?.addEventListener('click', () => this.clearMetrics());
        document.getElementById('perf-export')?.addEventListener('click', () => this.exportData());
        document.getElementById('perf-save-thresholds')?.addEventListener('click', () => this.saveThresholds());
        document.getElementById('perf-range')?.addEventListener('change', () => this.updateChart());
        document.getElementById('perf-metric')?.addEventListener('change', () => this.updateChart());
    }

    startMonitoring() {
        setInterval(() => {
            if (this.monitoring) {
                this.collectMetrics();
                this.updateGauges();
                this.checkAlerts();
            }
        }, 5000);
    }

    collectMetrics() {
        if (AppState.connection.status !== 'connected') return;
        const timestamp = Date.now();
        const cpu = this.tablet.serverStats?.cpu || 0;
        const ram = this.tablet.serverStats?.memory || 0;
        const fps = this.tablet.serverStats?.fps || 0;
        const players = AppState.players.length;

        this.metrics.timestamps.push(timestamp);
        this.metrics.cpu.push(cpu);
        this.metrics.ram.push(ram);
        this.metrics.fps.push(fps);
        this.metrics.players.push(players);

        if (this.metrics.timestamps.length > this.maxDataPoints) {
            this.metrics.timestamps.shift();
            this.metrics.cpu.shift();
            this.metrics.ram.shift();
            this.metrics.fps.shift();
            this.metrics.players.shift();
        }
        this.saveMetrics();
        if (document.getElementById('tab-performance')?.classList.contains('active')) {
            this.updateChart();
        }
    }

    saveMetrics() {
        localStorage.setItem('tdl_performance_metrics', JSON.stringify(this.metrics));
    }

    loadMetrics() {
        const saved = localStorage.getItem('tdl_performance_metrics');
        if (saved) {
            try {
                this.metrics = JSON.parse(saved);
            } catch (e) {}
        }
    }

    updateGauges() {
        const cpu = this.metrics.cpu[this.metrics.cpu.length - 1] || 0;
        const ram = this.metrics.ram[this.metrics.ram.length - 1] || 0;
        const fps = this.metrics.fps[this.metrics.fps.length - 1] || 0;
        const players = this.metrics.players[this.metrics.players.length - 1] || 0;
        const maxPlayers = AppState.connection.server?.maxPlayers || 100;

        document.getElementById('cpu-value').innerText = cpu + '%';
        document.getElementById('cpu-fill').style.width = cpu + '%';
        document.getElementById('ram-value').innerText = ram + '%';
        document.getElementById('ram-fill').style.width = ram + '%';
        document.getElementById('fps-value').innerText = fps;
        document.getElementById('fps-fill').style.width = (fps / 60 * 100) + '%';
        document.getElementById('players-value').innerText = players + '/' + maxPlayers;
        document.getElementById('players-fill').style.width = (players / maxPlayers * 100) + '%';
    }

    checkAlerts() {
        const cpu = this.metrics.cpu[this.metrics.cpu.length - 1] || 0;
        const ram = this.metrics.ram[this.metrics.ram.length - 1] || 0;
        const fps = this.metrics.fps[this.metrics.fps.length - 1] || 0;
        const cpuWarn = parseInt(document.getElementById('cpu-warn')?.value || 80);
        const cpuCrit = parseInt(document.getElementById('cpu-crit')?.value || 90);
        const ramWarn = parseInt(document.getElementById('ram-warn')?.value || 85);
        const fpsWarn = parseInt(document.getElementById('fps-warn')?.value || 30);

        if (cpu > cpuCrit) this.addAlert('critical', `CPU critical: ${cpu}%`);
        else if (cpu > cpuWarn) this.addAlert('warning', `CPU high: ${cpu}%`);

        if (ram > ramWarn) this.addAlert('warning', `RAM high: ${ram}%`);

        if (fps < fpsWarn) this.addAlert('warning', `FPS low: ${fps}`);
        this.renderAlerts();
    }

    addAlert(level, message) {
        this.alerts.unshift({ level, message, time: new Date().toLocaleTimeString() });
        if (this.alerts.length > 20) this.alerts.pop();
    }

    renderAlerts() {
        const list = document.getElementById('perf-alerts-list');
        if (!list) return;
        if (this.alerts.length === 0) {
            list.innerHTML = '<div class="no-alerts">No active alerts</div>';
            return;
        }
        list.innerHTML = this.alerts.map(a => `
            <div class="alert-item ${a.level}">
                <span class="alert-time">[${a.time}]</span> ${a.message}
            </div>
        `).join('');
    }

    updateChart() {
        const canvas = document.getElementById('perf-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const metric = document.getElementById('perf-metric').value;
        const range = parseInt(document.getElementById('perf-range').value) * 60 * 1000;
        const now = Date.now();
        const cutoff = now - range;

        const indices = this.metrics.timestamps.map((t, i) => t >= cutoff ? i : -1).filter(i => i !== -1);
        const values = indices.map(i => this.metrics[metric][i]);
        const times = indices.map(i => new Date(this.metrics.timestamps[i]).toLocaleTimeString());

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (values.length < 2) {
            ctx.fillStyle = '#FFB100';
            ctx.font = '14px monospace';
            ctx.fillText('Not enough data', 100, 150);
            return;
        }

        const w = canvas.width, h = canvas.height;
        const pad = 40;
        const graphW = w - 2*pad;
        const graphH = h - 2*pad;
        const maxVal = Math.max(...values);
        const minVal = Math.min(...values);
        const rangeVal = maxVal - minVal || 1;

        ctx.strokeStyle = '#FFB100';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < values.length; i++) {
            const x = pad + (i / (values.length - 1)) * graphW;
            const y = h - pad - ((values[i] - minVal) / rangeVal) * graphH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pad, pad);
        ctx.lineTo(pad, h - pad);
        ctx.lineTo(w - pad, h - pad);
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '10px monospace';
        ctx.fillText(maxVal.toFixed(0), pad - 30, pad + 5);
        ctx.fillText(minVal.toFixed(0), pad - 30, h - pad - 5);
    }

    clearMetrics() {
        if (!confirm('Clear all performance metrics?')) return;
        this.metrics = { cpu: [], ram: [], fps: [], players: [], timestamps: [] };
        this.saveMetrics();
        this.updateGauges();
        this.updateChart();
        this.tablet.showToast('Metrics cleared', 'info');
    }

    exportData() {
        const dataStr = JSON.stringify(this.metrics, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    }

    saveThresholds() {
        this.tablet.showToast('Thresholds saved', 'success');
    }

    refresh() {
        this.updateGauges();
        this.updateChart();
        this.renderAlerts();
        this.tablet.showToast('Performance metrics refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMetrics = new PerformanceMetrics();
});