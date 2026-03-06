// MOBILE SYNC - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class MobileSync {
    constructor(tablet) {
        this.tablet = tablet;
        this.connectedDevices = this.loadDevices();
        this.apiKey = this.generateApiKey();
        this.syncEnabled = true;
        this.ws = null;
        this.wsPort = 8080; // Default WebSocket port for mobile sync
        this.init();
    }

    loadDevices() {
        const saved = localStorage.getItem('drained_mobile_devices');
        return saved ? JSON.parse(saved) : [];
    }

    saveDevices() {
        localStorage.setItem('drained_mobile_devices', JSON.stringify(this.connectedDevices));
    }

    generateApiKey() {
        return 'drained_' + Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    }

    init() {
        this.createMobileHTML();
        this.setupEventListeners();
        this.startWebSocketServer();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'mobile') {
                this.refresh();
            }
        });
    }

    createMobileHTML() {
        const mobileTab = document.getElementById('tab-mobile');
        if (!mobileTab) return;

        mobileTab.innerHTML = `
            <div class="mobile-container">
                <div class="mobile-header">
                    <h2>📱 MOBILE SYNC</h2>
                    <div class="sync-status">
                        <span id="sync-indicator" class="status-online">🟢</span>
                        <span>Sync Active</span>
                    </div>
                </div>

                <div class="mobile-grid">
                    <div class="qr-section">
                        <h3>📷 CONNECT PHONE</h3>
                        <div class="qr-code" id="qr-code">
                            <div class="qr-placeholder">
                                [QR CODE]
                                <div class="qr-code-text">DRAINED-${this.apiKey.slice(-6)}</div>
                            </div>
                        </div>
                        <p class="qr-hint">Scan with phone camera or enter code manually</p>
                        <div class="manual-code">
                            <input type="text" id="manual-code" placeholder="Enter code">
                            <button id="connect-manual" class="mobile-btn">CONNECT</button>
                        </div>
                    </div>

                    <div class="devices-section">
                        <h3>📱 CONNECTED DEVICES</h3>
                        <div id="devices-list" class="devices-list"></div>
                    </div>

                    <div class="notification-settings">
                        <h3>🔔 NOTIFICATION SETTINGS</h3>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-joins" checked>
                                Player Joins
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-leaves" checked>
                                Player Leaves
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-events" checked>
                                Server Events
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-raids" checked>
                                Raid Alerts
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-bans" checked>
                                Bans/Kicks
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label>Quiet Hours:</label>
                            <div class="time-range">
                                <input type="time" id="quiet-start" value="23:00">
                                <span>to</span>
                                <input type="time" id="quiet-end" value="07:00">
                            </div>
                        </div>
                        
                        <button id="save-notifications" class="mobile-btn">SAVE SETTINGS</button>
                    </div>

                    <div class="mobile-commands">
                        <h3>📱 MOBILE COMMANDS</h3>
                        <div class="command-item">
                            <code>/status</code> - Server status
                        </div>
                        <div class="command-item">
                            <code>/players</code> - Online players
                        </div>
                        <div class="command-item">
                            <code>/kick [player]</code> - Kick player
                        </div>
                        <div class="command-item">
                            <code>/ban [player]</code> - Ban player
                        </div>
                        <div class="command-item">
                            <code>/event [name]</code> - Trigger event
                        </div>
                        <div class="command-item">
                            <code>/say [message]</code> - Broadcast
                        </div>
                    </div>

                    <div class="sync-stats">
                        <h3>📊 SYNC STATISTICS</h3>
                        <div class="stat-row">
                            <span>Connected Devices:</span>
                            <span id="stat-devices">${this.connectedDevices.length}</span>
                        </div>
                        <div class="stat-row">
                            <span>Notifications Today:</span>
                            <span id="stat-notifications">24</span>
                        </div>
                        <div class="stat-row">
                            <span>Commands Today:</span>
                            <span id="stat-commands">12</span>
                        </div>
                        <div class="stat-row">
                            <span>Last Sync:</span>
                            <span id="stat-lastsync">Just now</span>
                        </div>
                    </div>
                </div>

                <div class="mobile-actions">
                    <button id="refresh-qr" class="mobile-btn">🔄 REFRESH QR</button>
                    <button id="test-notification" class="mobile-btn">📱 TEST NOTIFICATION</button>
                    <button id="clear-devices" class="mobile-btn warning">🗑️ CLEAR DEVICES</button>
                </div>
            </div>
        `;

        this.renderDevices();
    }

    setupEventListeners() {
        document.getElementById('connect-manual')?.addEventListener('click', () => this.connectManual());
        document.getElementById('refresh-qr')?.addEventListener('click', () => this.refreshQR());
        document.getElementById('test-notification')?.addEventListener('click', () => this.testNotification());
        document.getElementById('clear-devices')?.addEventListener('click', () => this.clearDevices());
        document.getElementById('save-notifications')?.addEventListener('click', () => this.saveSettings());

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-device')) {
                const id = e.target.dataset.id;
                this.removeDevice(id);
            }
        });
    }

    renderDevices() {
        const list = document.getElementById('devices-list');
        
        if (this.connectedDevices.length === 0) {
            list.innerHTML = '<div class="no-devices">No devices connected</div>';
            return;
        }

        let html = '';
        this.connectedDevices.forEach(device => {
            html += `
                <div class="device-item">
                    <div class="device-info">
                        <span class="device-name">${device.name}</span>
                        <span class="device-model">${device.model}</span>
                        <span class="device-time">Last sync: ${device.lastSync}</span>
                    </div>
                    <button class="small-btn remove-device" data-id="${device.id}">✕</button>
                </div>
            `;
        });

        list.innerHTML = html;
        document.getElementById('stat-devices').innerText = this.connectedDevices.length;
    }

    connectManual() {
        const code = document.getElementById('manual-code').value.trim();
        if (!code) {
            this.tablet.showError('Enter connection code');
            return;
        }

        // Simulate connection – in real implementation, would validate via WebSocket
        const device = {
            id: 'dev_' + Date.now(),
            name: 'Unknown Device',
            model: 'Mobile Phone',
            lastSync: 'Just now',
            code: code
        };

        this.connectedDevices.push(device);
        this.saveDevices();
        this.renderDevices();
        this.tablet.showToast('Device connected!', 'success');
    }

    removeDevice(id) {
        this.connectedDevices = this.connectedDevices.filter(d => d.id !== id);
        this.saveDevices();
        this.renderDevices();
        this.tablet.showToast('Device removed', 'info');
    }

    refreshQR() {
        this.apiKey = this.generateApiKey();
        const qrText = document.querySelector('.qr-code-text');
        if (qrText) {
            qrText.innerText = 'DRAINED-' + this.apiKey.slice(-6);
        }
        this.tablet.showToast('QR code refreshed', 'success');
    }

    testNotification() {
        // In real implementation, would push to connected devices
        this.tablet.showToast('Test notification sent to connected devices', 'success');
    }

    clearDevices() {
        this.tablet.showConfirm('Disconnect all devices?', (confirmed) => {
            if (confirmed) {
                this.connectedDevices = [];
                this.saveDevices();
                this.renderDevices();
                this.tablet.showToast('All devices disconnected', 'info');
            }
        });
    }

    saveSettings() {
        // Save quiet hours etc. (implement as needed)
        this.tablet.showToast('Notification settings saved', 'success');
    }

    startWebSocketServer() {
        // In a real implementation, this would start a WebSocket server
        // For browser environment, we'd need a backend service
        // Here we'll simulate by setting up a client WebSocket that connects to a server
        // The actual implementation would depend on your hosting setup.
        // For now, we'll just log that it's ready.
        console.log('📱 Mobile sync WebSocket server simulated on port', this.wsPort);
        this.syncEnabled = true;
    }

    refresh() {
        this.renderDevices();
        this.tablet.showToast('Mobile sync refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.mobileSync = new MobileSync(window.drainedTablet);
});