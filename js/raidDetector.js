// RAID DETECTOR - EXCLUSIVE FEATURE
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class RaidDetector {
    constructor(tablet) {
        this.tablet = tablet;
        this.activeRaids = [];
        this.raidHistory = this.loadHistory();
        this.soundThreshold = 0.7;
        this.explosiveTypes = ['explosive.timed', 'explosive.satchel', 'ammo.rocket.basic', 'grenade.f1'];
        this.monitoring = true;
        this.init();
    }

    loadHistory() {
        const saved = localStorage.getItem('drained_raid_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
        localStorage.setItem('drained_raid_history', JSON.stringify(this.raidHistory));
    }

    init() {
        this.createRaidHTML();
        this.setupEventListeners();
        this.startMonitoring();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'raid') {
                this.refresh();
            }
        });
    }

    createRaidHTML() {
        const raidTab = document.getElementById('tab-raid');
        if (!raidTab) return;

        raidTab.innerHTML = `
            <div class="raid-container">
                <div class="raid-header">
                    <h2>⚡ RAID DETECTOR</h2>
                    <div class="raid-controls">
                        <button id="raid-toggle" class="raid-btn ${this.monitoring ? 'active' : ''}">
                            ${this.monitoring ? '🟢 MONITORING' : '🔴 PAUSED'}
                        </button>
                        <button id="raid-refresh" class="raid-btn">🔄 REFRESH</button>
                        <button id="raid-clear" class="raid-btn">🗑️ CLEAR HISTORY</button>
                    </div>
                </div>
                
                <div class="raid-active" id="raid-active">
                    <h3>🟥 ACTIVE RAIDS</h3>
                    <div id="active-raids-list"></div>
                </div>
                
                <div class="raid-map">
                    <canvas id="raid-map-canvas" width="800" height="400"></canvas>
                </div>
                
                <div class="raid-history">
                    <h3>📜 RAID HISTORY</h3>
                    <div id="raid-history-list"></div>
                </div>
                
                <div class="raid-settings">
                    <h4>DETECTION SETTINGS</h4>
                    <div class="settings-group">
                        <label>Sensitivity: <span id="sensitivity-value">${this.soundThreshold * 100}%</span></label>
                        <input type="range" id="raid-sensitivity" min="0.1" max="1" step="0.1" value="${this.soundThreshold}">
                    </div>
                    <div class="settings-group">
                        <label>Alert Sound:</label>
                        <select id="raid-alert-sound">
                            <option value="beep">Beep</option>
                            <option value="alarm">Alarm</option>
                            <option value="voice">Voice Alert</option>
                            <option value="none">None</option>
                        </select>
                    </div>
                    <button id="raid-test" class="raid-btn">TEST ALERT</button>
                </div>
            </div>
        `;

        this.updateActiveRaids();
        this.updateRaidHistory();
        this.drawRaidMap();
    }

    setupEventListeners() {
        document.getElementById('raid-toggle')?.addEventListener('click', () => this.toggleMonitoring());
        document.getElementById('raid-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('raid-clear')?.addEventListener('click', () => this.clearHistory());
        document.getElementById('raid-sensitivity')?.addEventListener('input', (e) => {
            this.soundThreshold = parseFloat(e.target.value);
            document.getElementById('sensitivity-value').innerText = Math.round(this.soundThreshold * 100) + '%';
        });
        document.getElementById('raid-test')?.addEventListener('click', () => this.testAlert());
    }

    startMonitoring() {
        setInterval(() => {
            if (this.monitoring && this.tablet.connected) {
                this.scanForRaids();
            }
        }, 5000);
    }

    scanForRaids() {
        // In real version, this would analyze RCON logs
        // Simulate random raid detection
        if (Math.random() > 0.8) {
            this.detectRaid(this.generateMockRaid());
        }
        
        this.updateActiveRaids();
        this.drawRaidMap();
    }

    generateMockRaid() {
        const bases = ['Dome', 'Airfield', 'Launch Site', 'Power Plant', 'Train Yard'];
        const raiders = ['RustGod', 'PvPKing', 'RaiderSue', 'ExplosiveMan', 'C4Master'];
        
        return {
            id: 'raid_' + Date.now(),
            location: bases[Math.floor(Math.random() * bases.length)],
            x: Math.floor(Math.random() * 3500),
            z: Math.floor(Math.random() * 3500),
            attackers: raiders.slice(0, Math.floor(Math.random() * 3) + 1),
            owner: 'BuilderBob',
            startTime: Date.now(),
            explosivesUsed: Math.floor(Math.random() * 20) + 5,
            wallHealth: Math.floor(Math.random() * 100),
            intensity: Math.random(),
            active: true
        };
    }

    detectRaid(raid) {
        this.activeRaids.push(raid);
        
        // Trigger alert
        this.triggerAlert(raid);
        
        // Log to history
        this.raidHistory.unshift({
            ...raid,
            active: false,
            endTime: Date.now() + Math.floor(Math.random() * 600000),
            success: Math.random() > 0.5
        });
        
        this.saveHistory();
        this.updateActiveRaids();
        this.updateRaidHistory();
        
        // Show notification
        this.tablet.showToast(`🚨 RAID DETECTED at ${raid.location}!`, 'error');
    }

    triggerAlert(raid) {
        const sound = document.getElementById('raid-alert-sound')?.value || 'beep';
        
        if (sound === 'beep') {
            // Play beep sound
            console.log('🔊 BEEP - Raid detected');
        } else if (sound === 'alarm') {
            console.log('🔊 ALARM - Raid detected');
        } else if (sound === 'voice') {
            console.log('🔊 VOICE - Raid detected at ' + raid.location);
        }
        
        // Visual alert
        const alert = document.createElement('div');
        alert.className = 'raid-alert';
        alert.innerHTML = `
            <div class="raid-alert-content">
                <h3>🚨 RAID DETECTED!</h3>
                <p>Location: ${raid.location}</p>
                <p>Attackers: ${raid.attackers.join(', ')}</p>
                <p>Wall HP: ${raid.wallHealth}%</p>
                <button onclick="raidDetector.dismissAlert(this)">DISMISS</button>
            </div>
        `;
        document.body.appendChild(alert);
        
        setTimeout(() => alert.remove(), 10000);
    }

    dismissAlert(element) {
        element.closest('.raid-alert').remove();
    }

    updateActiveRaids() {
        const list = document.getElementById('active-raids-list');
        if (!list) return;

        if (this.activeRaids.length === 0) {
            list.innerHTML = '<div class="no-raids">No active raids detected</div>';
            return;
        }

        let html = '';
        this.activeRaids.forEach(raid => {
            const duration = Math.floor((Date.now() - raid.startTime) / 1000 / 60);
            html += `
                <div class="raid-card active">
                    <div class="raid-card-header">
                        <span class="raid-location">🚨 ${raid.location}</span>
                        <span class="raid-intensity" style="width: ${raid.intensity * 100}%"></span>
                    </div>
                    <div class="raid-card-body">
                        <p>Attackers: ${raid.attackers.join(', ')}</p>
                        <p>Owner: ${raid.owner}</p>
                        <p>Duration: ${duration} minutes</p>
                        <p>Explosives: ${raid.explosivesUsed}</p>
                        <p>Wall HP: ${raid.wallHealth}%</p>
                        <progress value="${raid.wallHealth}" max="100"></progress>
                    </div>
                    <div class="raid-card-actions">
                        <button onclick="raidDetector.intervene('${raid.id}')">🛡️ INTERVENE</button>
                        <button onclick="raidDetector.alertOwner('${raid.id}')">🔔 ALERT OWNER</button>
                        <button onclick="raidDetector.spawnGuards('${raid.id}')">👮 SPAWN GUARDS</button>
                    </div>
                </div>
            `;
        });

        list.innerHTML = html;
    }

    updateRaidHistory() {
        const list = document.getElementById('raid-history-list');
        if (!list) return;

        if (this.raidHistory.length === 0) {
            list.innerHTML = '<div class="no-history">No raid history</div>';
            return;
        }

        let html = '<table class="raid-history-table"><tr><th>Time</th><th>Location</th><th>Attackers</th><th>Result</th></tr>';
        
        this.raidHistory.slice(0, 20).forEach(raid => {
            const time = new Date(raid.startTime).toLocaleString();
            html += `
                <tr class="${raid.success ? 'success' : 'failed'}">
                    <td>${time}</td>
                    <td>${raid.location}</td>
                    <td>${raid.attackers.length}</td>
                    <td>${raid.success ? '✅ SUCCESS' : '❌ FAILED'}</td>
                </tr>
            `;
        });
        
        html += '</table>';
        list.innerHTML = html;
    }

    drawRaidMap() {
        const canvas = document.getElementById('raid-map-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();

            const y = (i / 10) * canvas.height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw active raids
        this.activeRaids.forEach(raid => {
            const x = (raid.x / 3500) * canvas.width;
            const y = (raid.z / 3500) * canvas.height;

            // Pulsing red dot
            ctx.beginPath();
            ctx.arc(x, y, 10 + Math.sin(Date.now() / 200) * 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px monospace';
            ctx.fillText(raid.location, x + 15, y - 15);
        });

        // Draw past raids
        this.raidHistory.slice(0, 10).forEach(raid => {
            const x = (raid.x / 3500) * canvas.width;
            const y = (raid.z / 3500) * canvas.height;

            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fillStyle = raid.success ? 'rgba(255, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
            ctx.fill();
        });
    }

    intervene(raidId) {
        const raid = this.activeRaids.find(r => r.id === raidId);
        if (!raid) return;

        this.tablet.showConfirm(`Intervene in raid at ${raid.location}?`, (confirmed) => {
            if (confirmed) {
                this.activeRaids = this.activeRaids.filter(r => r.id !== raidId);
                this.tablet.showToast(`Intervened in raid at ${raid.location}`, 'success');
                this.updateActiveRaids();
                this.drawRaidMap();
            }
        });
    }

    alertOwner(raidId) {
        const raid = this.activeRaids.find(r => r.id === raidId);
        if (!raid) return;

        this.tablet.showToast(`Alerted ${raid.owner} about raid`, 'info');
    }

    spawnGuards(raidId) {
        const raid = this.activeRaids.find(r => r.id === raidId);
        if (!raid) return;

        this.tablet.showToast(`Spawning guards at ${raid.location}`, 'success');
    }

    toggleMonitoring() {
        this.monitoring = !this.monitoring;
        const btn = document.getElementById('raid-toggle');
        btn.innerText = this.monitoring ? '🟢 MONITORING' : '🔴 PAUSED';
        btn.classList.toggle('active');
        this.tablet.showToast(`Raid monitoring ${this.monitoring ? 'started' : 'paused'}`, 'info');
    }

    refresh() {
        this.updateActiveRaids();
        this.updateRaidHistory();
        this.drawRaidMap();
        this.tablet.showToast('Raid detector refreshed', 'success');
    }

    clearHistory() {
        this.tablet.showConfirm('Clear all raid history?', (confirmed) => {
            if (confirmed) {
                this.raidHistory = [];
                this.saveHistory();
                this.updateRaidHistory();
                this.tablet.showToast('Raid history cleared', 'info');
            }
        });
    }

    testAlert() {
        const testRaid = {
            id: 'test_' + Date.now(),
            location: 'TEST LOCATION',
            x: 1750,
            z: 1750,
            attackers: ['TestPlayer1', 'TestPlayer2'],
            owner: 'TestOwner',
            startTime: Date.now(),
            explosivesUsed: 10,
            wallHealth: 50,
            intensity: 0.8,
            active: true
        };
        
        this.detectRaid(testRaid);
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.raidDetector = new RaidDetector(window.drainedTablet);
});