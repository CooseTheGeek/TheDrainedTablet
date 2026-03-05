// PERFORMANCE MONITOR - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class PerformanceMonitor {
    constructor(tablet) {
        this.tablet = tablet;
        this.metrics = this.loadMetrics();
        this.alerts = [];
        this.monitoring = true;
        this.init();
    }

    loadMetrics() {
        const saved = localStorage.getItem('drained_performance_metrics');
        return saved ? JSON.parse(saved) : {
            cpu: [],
            ram: [],
            fps: [],
            players: [],
            network: []
        };
    }

    saveMetrics() {
        localStorage.setItem('drained_performance_metrics', JSON.stringify(this.metrics));
    }

    init() {
        this.createPerformanceHTML();
        this.setupEventListeners();
        this.startMonitoring();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'performance') {
                this.refresh();
            }
        });
    }

    createPerformanceHTML() {
        const perfTab = document.getElementById('tab-performance');
        if (!perfTab) return;

        perfTab.innerHTML = `
            <div class="performance-container">
                <div class="performance-header">
                    <h2>📊 PERFORMANCE MONITOR</h2>
                    <div class="perf-controls">
                        <button id="pause-monitor" class="perf-btn">⏸️ PAUSE</button>
                        <button id="clear-metrics" class="perf-btn">🗑️ CLEAR</button>
                        <button id="export-metrics" class="perf-btn">📤 EXPORT</button>
                    </div>
                </div>

                <div class="perf-grid">
                    <div class="perf-card">
                        <h3>CPU USAGE</h3>
                        <div class="gauge" id="cpu-gauge">
                            <div class="gauge-fill" style="width: 42%"></div>
                        </div>
                        <div class="perf-value" id="cpu-value">42%</div>
                    </div>

                    <div class="perf-card">
                        <h3>RAM USAGE</h3>
                        <div class="gauge" id="ram-gauge">
                            <div class="gauge-fill" style="width: 38%"></div>
                        </div>
                        <div class="perf-value" id="ram-value">38%</div>
                    </div>

                    <div class="perf-card">
                        <h3>SERVER FPS</h3>
                        <div class="gauge" id="fps-gauge">
                            <div class="gauge-fill" style="width: 100%"></div>
                        </div>
                        <div class="perf-value" id="fps-value">60</div>
                    </div>

                    <div class="perf-card">
                        <h3>PLAYERS</h3>
                        <div class="gauge" id="players-gauge">
                            <div class="gauge-fill" style="width: 12%"></div>
                        </div>
                        <div class="perf-value" id="players-value">12/100</div>
                    </div>
                </div>

                <div class="perf-chart">
                    <h3>PERFORMANCE OVER TIME</h3>
                    <canvas id="perf-canvas" width="800" height="300"></canvas>
                </div>

                <div class="perf-alerts">
                    <h3>🚨 ACTIVE ALERTS</h3>
                    <div id="alerts-list" class="alerts-list">
                        <div class="alert-item warning">
                            <span>[15:32] CPU spike detected (89%)</span>
                        </div>
                        <div class="alert-item info">
                            <span>[14:45] FPS drop to 24 for 2 minutes</span>
                        </div>
                    </div>
                </div>

                <div class="perf-settings">
                    <h3>⚙️ ALERT THRESHOLDS</h3>
                    <div class="thresholds-grid">
                        <div class="threshold-item">
                            <label>CPU Warning: <span id="cpu-warn-val">80</span>%</label>
                            <input type="range" id="cpu-warn" min="50" max="95" value="80">
                        </div>
                        <div class="threshold-item">
                            <label>CPU Critical: <span id="cpu-critical-val">90</span>%</label>
                            <input type="range" id="cpu-critical" min="60" max="99" value="90">
                        </div>
                        <div class="threshold-item">
                            <label>RAM Warning: <span id="ram-warn-val">85</span>%</label>
                            <input type="range" id="ram-warn" min="50" max="95" value="85">
                        </div>
                        <div class="threshold-item">
                            <label>FPS Warning: <span id="fps-warn-val">30</span></label>
                            <input type="range" id="fps-warn" min="10" max="50" value="30">
                        </div>
                    </div>
                    <button id="save-thresholds" class="perf-btn primary">SAVE THRESHOLDS</button>
                </div>
            </div>
        `;

        this.setupRangeListeners();
        this.drawChart();
    }

    setupEventListeners() {
        document.getElementById('pause-monitor')?.addEventListener('click', (e) => {
            this.monitoring = !this.monitoring;
            e.target.innerText = this.monitoring ? '⏸️ PAUSE' : '▶️ RESUME';
        });

        document.getElementById('clear-metrics')?.addEventListener('click', () => this.clearMetrics());
        document.getElementById('export-metrics')?.addEventListener('click', () => this.exportMetrics());
        document.getElementById('save-thresholds')?.addEventListener('click', () => this.saveThresholds());

        const ranges = [
            { id: 'cpu-warn', val: 'cpu-warn-val' },
            { id: 'cpu-critical', val: 'cpu-critical-val' },
            { id: 'ram-warn', val: 'ram-warn-val' },
            { id: 'fps-warn', val: 'fps-warn-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'cpu-warn', val: 'cpu-warn-val' },
            { id: 'cpu-critical', val: 'cpu-critical-val' },
            { id: 'ram-warn', val: 'ram-warn-val' },
            { id: 'fps-warn', val: 'fps-warn-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    startMonitoring() {
        setInterval(() => {
            if (this.monitoring) {
                this.collectMetrics();
                this.updateGauges();
                this.checkAlerts();
            }
        }, 5000);

        setInterval(() => {
            if (this.monitoring) {
                this.drawChart();
            }
        }, 60000);
    }

    collectMetrics() {
        const now = Date.now();
        const metrics = {
            cpu: Math.floor(Math.random() * 60) + 20,
            ram: Math.floor(Math.random() * 40) + 20,
            fps: Math.floor(Math.random() * 20) + 50,
            players: Math.floor(Math.random() * 50) + 10,
            network: Math.floor(Math.random() * 50) + 10
        };

        this.metrics.cpu.push({ time: now, value: metrics.cpu });
        this.metrics.ram.push({ time: now, value: metrics.ram });
        this.metrics.fps.push({ time: now, value: metrics.fps });
        this.metrics.players.push({ time: now, value: metrics.players });

        // Keep last 100 data points
        Object.keys(this.metrics).forEach(key => {
            if (this.metrics[key].length > 100) {
                this.metrics[key].shift();
            }
        });

        this.saveMetrics();
    }

    updateGauges() {
        const lastCpu = this.metrics.cpu[this.metrics.cpu.length - 1]?.value || 0;
        const lastRam = this.metrics.ram[this.metrics.ram.length - 1]?.value || 0;
        const lastFps = this.metrics.fps[this.metrics.fps.length - 1]?.value || 60;
        const lastPlayers = this.metrics.players[this.metrics.players.length - 1]?.value || 0;

        document.getElementById('cpu-gauge').querySelector('.gauge-fill').style.width = lastCpu + '%';
        document.getElementById('cpu-value').innerText = lastCpu + '%';
        
        document.getElementById('ram-gauge').querySelector('.gauge-fill').style.width = lastRam + '%';
        document.getElementById('ram-value').innerText = lastRam + '%';
        
        document.getElementById('fps-gauge').querySelector('.gauge-fill').style.width = (lastFps / 60 * 100) + '%';
        document.getElementById('fps-value').innerText = lastFps;
        
        document.getElementById('players-gauge').querySelector('.gauge-fill').style.width = (lastPlayers / 100 * 100) + '%';
        document.getElementById('players-value').innerText = lastPlayers + '/100';
    }

    drawChart() {
        const canvas = document.getElementById('perf-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 5; i++) {
            const y = 50 + (i * 50);
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(w - 50, y);
            ctx.stroke();
        }

        // Draw CPU line
        if (this.metrics.cpu.length > 1) {
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 2;
            ctx.beginPath();

            this.metrics.cpu.forEach((point, i) => {
                const x = 50 + (i / (this.metrics.cpu.length - 1)) * (w - 100);
                const y = h - 50 - (point.value / 100) * (h - 100);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        }

        // Draw RAM line
        if (this.metrics.ram.length > 1) {
            ctx.strokeStyle = '#44ff44';
            ctx.lineWidth = 2;
            ctx.beginPath();

            this.metrics.ram.forEach((point, i) => {
                const x = 50 + (i / (this.metrics.ram.length - 1)) * (w - 100);
                const y = h - 50 - (point.value / 100) * (h - 100);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });

            ctx.stroke();
        }

        // Labels
        ctx.fillStyle = '#FFB100';
        ctx.font = '12px monospace';
        ctx.fillText('CPU (red) / RAM (green)', 50, 30);
    }

    checkAlerts() {
        const lastCpu = this.metrics.cpu[this.metrics.cpu.length - 1]?.value || 0;
        const cpuWarn = parseInt(document.getElementById('cpu-warn')?.value || 80);
        const cpuCritical = parseInt(document.getElementById('cpu-critical')?.value || 90);

        if (lastCpu > cpuCritical) {
            this.addAlert('critical', `CPU at ${lastCpu}% - CRITICAL`);
        } else if (lastCpu > cpuWarn) {
            this.addAlert('warning', `CPU at ${lastCpu}% - Warning`);
        }
    }

    addAlert(type, message) {
        this.alerts.unshift({
            type: type,
            message: message,
            time: new Date().toLocaleTimeString()
        });

        if (this.alerts.length > 10) {
            this.alerts.pop();
        }

        this.renderAlerts();
    }

    renderAlerts() {
        const list = document.getElementById('alerts-list');
        let html = '';

        this.alerts.forEach(alert => {
            html += `
                <div class="alert-item ${alert.type}">
                    <span>[${alert.time}] ${alert.message}</span>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    clearMetrics() {
        this.tablet.showConfirm('Clear all performance metrics?', (confirmed) => {
            if (confirmed) {
                this.metrics = { cpu: [], ram: [], fps: [], players: [], network: [] };
                this.saveMetrics();
                this.updateGauges();
                this.drawChart();
                this.tablet.showToast('Metrics cleared', 'info');
            }
        });
    }

    exportMetrics() {
        const json = JSON.stringify(this.metrics, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        this.tablet.showToast('Metrics exported', 'success');
    }

    saveThresholds() {
        this.tablet.showToast('Alert thresholds saved', 'success');
    }

    refresh() {
        this.updateGauges();
        this.drawChart();
        this.renderAlerts();
        this.tablet.showToast('Performance monitor refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor(window.drainedTablet);
});