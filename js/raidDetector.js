// RAID DETECTOR - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class RaidDetector {
    constructor(tablet) {
        this.tablet = tablet;
        this.activeRaids = [];
        this.raidHistory = [];
        this.monitoring = false;
        this.monitoringInterval = null;
        
        this.init();
    }

    init() {
        this.createRaidHTML();
        this.setupEventListeners();
        this.loadFromStorage();
        
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
                        <button id="start-raid-monitor" class="raid-btn">▶️ START MONITORING</button>
                        <button id="clear-raid-history" class="raid-btn">🗑️ CLEAR HISTORY</button>
                    </div>
                </div>

                <div class="raid-status">
                    Status: <span id="raid-monitor-status">Not monitoring</span>
                </div>

                <div class="raid-active-section">
                    <h3>🚨 ACTIVE RAIDS</h3>
                    <div id="active-raids-list" class="raids-list"></div>
                </div>

                <div class="raid-history-section">
                    <h3>📜 RAID HISTORY</h3>
                    <div id="raid-history-list" class="raids-list"></div>
                </div>
            </div>
        `;

        document.getElementById('start-raid-monitor')?.addEventListener('click', () => this.toggleMonitoring());
        document.getElementById('clear-raid-history')?.addEventListener('click', () => this.clearHistory());
    }

    setupEventListeners() {
        // Listen for explosive events from RCON
        window.addEventListener('explosive-event', (e) => {
            if (this.monitoring) {
                this.handleExplosiveEvent(e.detail);
            }
        });
    }

    loadFromStorage() {
        const saved = localStorage.getItem('drained_raid_history');
        if (saved) {
            try {
                this.raidHistory = JSON.parse(saved);
            } catch (e) {
                this.raidHistory = [];
            }
        }
    }

    saveHistory() {
        localStorage.setItem('drained_raid_history', JSON.stringify(this.raidHistory.slice(0, 50)));
    }

    toggleMonitoring() {
        this.monitoring = !this.monitoring;
        const btn = document.getElementById('start-raid-monitor');
        const status = document.getElementById('raid-monitor-status');

        if (this.monitoring) {
            btn.innerText = '⏸️ PAUSE MONITORING';
            status.innerText = 'Monitoring active';
            status.style.color = '#00ff00';
            this.startMonitoring();
        } else {
            btn.innerText = '▶️ START MONITORING';
            status.innerText = 'Monitoring paused';
            status.style.color = '#888';
            this.stopMonitoring();
        }
    }

    startMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }
        this.monitoringInterval = setInterval(() => {
            this.checkForExplosions();
        }, 2000);
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    async checkForExplosions() {
        if (!this.tablet || !this.tablet.connected) return;

        try {
            // Send RCON command to get recent explosive events
            // This depends on server plugin support; we'll use a generic approach
            const response = await this.tablet.sendCommand('events.recent');
            if (response) {
                // Parse response – this would depend on actual output format
                // For now, we'll rely on event listeners
            }
        } catch (error) {
            console.error('Failed to check explosions:', error);
        }
    }

    handleExplosiveEvent(event) {
        const raid = {
            id: Date.now(),
            location: event.location || 'Unknown',
            attacker: event.player || 'Unknown',
            time: new Date().toLocaleTimeString(),
            explosives: event.count || 1,
            timestamp: Date.now()
        };

        this.activeRaids.unshift(raid);
        if (this.activeRaids.length > 10) {
            this.activeRaids.pop();
        }

        this.showRaidAlert(raid);
        this.updateDisplay();
    }

    showRaidAlert(raid) {
        const alert = document.createElement('div');
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #000;
            border: 3px solid #ff4444;
            color: #ff4444;
            padding: 20px;
            z-index: 2000;
            animation: slideIn 0.3s;
            max-width: 300px;
            box-shadow: 0 0 30px rgba(255, 0, 0, 0.3);
        `;

        alert.innerHTML = `
            <strong style="font-size: 18px;">🚨 RAID DETECTED!</strong>
            <hr style="border-color: #ff4444; margin: 10px 0;">
            <div><strong>Location:</strong> ${raid.location}</div>
            <div><strong>Attacker:</strong> ${raid.attacker}</div>
            <div><strong>Time:</strong> ${raid.time}</div>
            <div><strong>Explosives:</strong> ${raid.explosives}</div>
            <button style="margin-top: 10px; background: #000; color: #ff4444; border: 1px solid #ff4444; padding: 5px 10px; cursor: pointer;" onclick="this.parentElement.remove()">DISMISS</button>
        `;

        document.body.appendChild(alert);

        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 10000);

        this.raidHistory.unshift({
            ...raid,
            resolved: true
        });
        this.saveHistory();
    }

    updateDisplay() {
        const activeList = document.getElementById('active-raids-list');
        const historyList = document.getElementById('raid-history-list');

        if (activeList) {
            if (this.activeRaids.length === 0) {
                activeList.innerHTML = '<div class="no-raids">No active raids detected</div>';
            } else {
                activeList.innerHTML = this.activeRaids.map(raid => `
                    <div class="raid-item active">
                        <div><strong>🚨 RAID</strong> at ${raid.location}</div>
                        <div>Attacker: ${raid.attacker}</div>
                        <div>Time: ${raid.time}</div>
                        <div>Explosives: ${raid.explosives}</div>
                    </div>
                `).join('');
            }
        }

        if (historyList) {
            if (this.raidHistory.length === 0) {
                historyList.innerHTML = '<div class="no-raids">No raid history</div>';
            } else {
                historyList.innerHTML = this.raidHistory.slice(0, 20).map(raid => `
                    <div class="raid-item history">
                        <div><strong>${raid.location}</strong> - ${raid.attacker}</div>
                        <div>${raid.time} (${raid.explosives} explosives)</div>
                    </div>
                `).join('');
            }
        }
    }

    clearHistory() {
        this.tablet.showConfirm('Clear raid history?', (confirmed) => {
            if (confirmed) {
                this.raidHistory = [];
                this.saveHistory();
                this.updateDisplay();
                this.tablet.showToast('Raid history cleared', 'info');
            }
        });
    }

    refresh() {
        this.updateDisplay();
        this.tablet.showToast('Raid detector refreshed', 'success');
    }
}

// Add animation style
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .raid-item {
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #FFB100;
        background: #0a0a0a;
    }
    
    .raid-item.active {
        border-color: #ff4444;
    }
    
    .raid-item.history {
        opacity: 0.7;
    }
`;
document.head.appendChild(style);

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.raidDetector = new RaidDetector(window.drainedTablet);
});