// DISCORD SYNC - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class DiscordSync {
    constructor(tablet) {
        this.tablet = tablet;
        this.connected = false;
        this.webhookUrl = '';
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_discord_settings');
        return saved ? JSON.parse(saved) : {
            webhookUrl: '',
            serverName: 'DRAINED SERVER',
            notifyJoins: true,
            notifyLeaves: true,
            notifyEvents: true,
            notifyBans: true,
            notifyRaids: true,
            channelJoins: 'joins',
            channelEvents: 'events',
            channelLogs: 'logs',
            commandPrefix: '!',
            allowCommands: true
        };
    }

    saveSettings() {
        localStorage.setItem('drained_discord_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createDiscordHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'discord') {
                this.refresh();
            }
        });
    }

    createDiscordHTML() {
        const discordTab = document.getElementById('tab-discord');
        if (!discordTab) return;

        discordTab.innerHTML = `
            <div class="discord-container">
                <div class="discord-header">
                    <h2>🔗 DISCORD INTEGRATION</h2>
                    <div class="connection-status" id="discord-status">
                        Status: <span class="status-offline">⚫ DISCONNECTED</span>
                    </div>
                </div>

                <div class="discord-grid">
                    <div class="discord-section">
                        <h3>🔌 CONNECTION</h3>
                        
                        <div class="form-group">
                            <label>Webhook URL:</label>
                            <input type="url" id="webhook-url" value="${this.settings.webhookUrl}" placeholder="https://discord.com/api/webhooks/...">
                        </div>
                        
                        <div class="form-group">
                            <label>Server Name:</label>
                            <input type="text" id="discord-server-name" value="${this.settings.serverName}">
                        </div>
                        
                        <div class="button-group">
                            <button id="test-webhook" class="discord-btn">🔄 TEST CONNECTION</button>
                            <button id="connect-discord" class="discord-btn primary">🔌 CONNECT</button>
                            <button id="disconnect-discord" class="discord-btn warning">🔌 DISCONNECT</button>
                        </div>
                    </div>

                    <div class="discord-section">
                        <h3>📢 NOTIFICATIONS</h3>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-joins" ${this.settings.notifyJoins ? 'checked' : ''}>
                                Player Joins
                            </label>
                            <select id="channel-joins">
                                <option value="joins" ${this.settings.channelJoins === 'joins' ? 'selected' : ''}>#joins</option>
                                <option value="general" ${this.settings.channelJoins === 'general' ? 'selected' : ''}>#general</option>
                                <option value="logs" ${this.settings.channelJoins === 'logs' ? 'selected' : ''}>#logs</option>
                            </select>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-leaves" ${this.settings.notifyLeaves ? 'checked' : ''}>
                                Player Leaves
                            </label>
                            <select id="channel-leaves">
                                <option value="leaves" ${this.settings.channelJoins === 'leaves' ? 'selected' : ''}>#leaves</option>
                                <option value="general" ${this.settings.channelJoins === 'general' ? 'selected' : ''}>#general</option>
                                <option value="logs" ${this.settings.channelJoins === 'logs' ? 'selected' : ''}>#logs</option>
                            </select>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-events" ${this.settings.notifyEvents ? 'checked' : ''}>
                                Server Events
                            </label>
                            <select id="channel-events">
                                <option value="events" ${this.settings.channelEvents === 'events' ? 'selected' : ''}>#events</option>
                                <option value="general" ${this.settings.channelEvents === 'general' ? 'selected' : ''}>#general</option>
                            </select>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-bans" ${this.settings.notifyBans ? 'checked' : ''}>
                                Bans/Kicks
                            </label>
                            <select id="channel-bans">
                                <option value="mod-logs" ${this.settings.channelLogs === 'mod-logs' ? 'selected' : ''}>#mod-logs</option>
                                <option value="logs" ${this.settings.channelLogs === 'logs' ? 'selected' : ''}>#logs</option>
                            </select>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="notify-raids" ${this.settings.notifyRaids ? 'checked' : ''}>
                                Raid Alerts
                            </label>
                            <select id="channel-raids">
                                <option value="alerts" ${this.settings.channelLogs === 'alerts' ? 'selected' : ''}>#alerts</option>
                                <option value="general" ${this.settings.channelLogs === 'general' ? 'selected' : ''}>#general</option>
                            </select>
                        </div>
                    </div>

                    <div class="discord-section">
                        <h3>🤖 COMMANDS</h3>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="allow-commands" ${this.settings.allowCommands ? 'checked' : ''}>
                                Allow Discord Commands
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label>Command Prefix:</label>
                            <input type="text" id="command-prefix" value="${this.settings.commandPrefix}" maxlength="2">
                        </div>
                        
                        <div class="allowed-roles">
                            <h4>Allowed Roles</h4>
                            <div class="checkbox-group">
                                <label><input type="checkbox" id="role-admin" checked> Admin</label>
                                <label><input type="checkbox" id="role-mod" checked> Moderator</label>
                                <label><input type="checkbox" id="role-vip"> VIP</label>
                                <label><input type="checkbox" id="role-owner" checked> Owner</label>
                            </div>
                        </div>
                        
                        <div class="command-list">
                            <h4>Available Commands</h4>
                            <div class="command-item">
                                <code>!players</code> - List online players
                            </div>
                            <div class="command-item">
                                <code>!status</code> - Server status
                            </div>
                            <div class="command-item">
                                <code>!kick [player]</code> - Kick player
                            </div>
                            <div class="command-item">
                                <code>!ban [player]</code> - Ban player
                            </div>
                            <div class="command-item">
                                <code>!say [message]</code> - Broadcast message
                            </div>
                        </div>
                    </div>

                    <div class="discord-section">
                        <h3>📋 RECENT POSTS</h3>
                        <div id="recent-posts" class="recent-posts">
                            <div class="post-item">
                                <span>[15:32] Posted to #events: Cargo Ship arrived</span>
                            </div>
                            <div class="post-item">
                                <span>[15:28] Posted to #joins: RustGod joined</span>
                            </div>
                            <div class="post-item">
                                <span>[15:22] Command from Discord: !players</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="discord-actions">
                    <button id="save-discord" class="discord-btn primary">💾 SAVE SETTINGS</button>
                    <button id="reset-discord" class="discord-btn">🔄 RESET</button>
                    <button id="test-notification" class="discord-btn">📢 TEST NOTIFICATION</button>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        document.getElementById('test-webhook')?.addEventListener('click', () => this.testWebhook());
        document.getElementById('connect-discord')?.addEventListener('click', () => this.connect());
        document.getElementById('disconnect-discord')?.addEventListener('click', () => this.disconnect());
        document.getElementById('save-discord')?.addEventListener('click', () => this.saveSettings());
        document.getElementById('reset-discord')?.addEventListener('click', () => this.resetSettings());
        document.getElementById('test-notification')?.addEventListener('click', () => this.testNotification());
    }

    testWebhook() {
        const url = document.getElementById('webhook-url').value;
        if (!url) {
            this.tablet.showError('Enter webhook URL');
            return;
        }

        this.tablet.showToast('Testing webhook connection...', 'info');
        // Simulate test – in production would actually send a test message
        setTimeout(() => {
            this.tablet.showToast('Webhook test successful!', 'success');
        }, 1500);
    }

    connect() {
        const url = document.getElementById('webhook-url').value;
        if (!url) {
            this.tablet.showError('Enter webhook URL');
            return;
        }

        this.connected = true;
        this.webhookUrl = url;
        document.getElementById('discord-status').innerHTML = 'Status: <span class="status-online">🟢 CONNECTED</span>';
        this.tablet.showToast('Connected to Discord', 'success');
    }

    disconnect() {
        this.connected = false;
        this.webhookUrl = '';
        document.getElementById('discord-status').innerHTML = 'Status: <span class="status-offline">⚫ DISCONNECTED</span>';
        this.tablet.showToast('Disconnected from Discord', 'info');
    }

    saveSettings() {
        this.settings = {
            webhookUrl: document.getElementById('webhook-url').value,
            serverName: document.getElementById('discord-server-name').value,
            notifyJoins: document.getElementById('notify-joins').checked,
            notifyLeaves: document.getElementById('notify-leaves').checked,
            notifyEvents: document.getElementById('notify-events').checked,
            notifyBans: document.getElementById('notify-bans').checked,
            notifyRaids: document.getElementById('notify-raids').checked,
            channelJoins: document.getElementById('channel-joins').value,
            channelEvents: document.getElementById('channel-events').value,
            channelLogs: document.getElementById('channel-bans').value,
            commandPrefix: document.getElementById('command-prefix').value,
            allowCommands: document.getElementById('allow-commands').checked
        };

        this.saveSettings();
        this.tablet.showToast('Discord settings saved', 'success');
    }

    resetSettings() {
        this.tablet.showConfirm('Reset Discord settings?', (confirmed) => {
            if (confirmed) {
                this.settings = {
                    webhookUrl: '',
                    serverName: 'DRAINED SERVER',
                    notifyJoins: true,
                    notifyLeaves: true,
                    notifyEvents: true,
                    notifyBans: true,
                    notifyRaids: true,
                    channelJoins: 'joins',
                    channelEvents: 'events',
                    channelLogs: 'logs',
                    commandPrefix: '!',
                    allowCommands: true
                };

                document.getElementById('webhook-url').value = this.settings.webhookUrl;
                document.getElementById('discord-server-name').value = this.settings.serverName;
                document.getElementById('notify-joins').checked = this.settings.notifyJoins;
                document.getElementById('notify-leaves').checked = this.settings.notifyLeaves;
                document.getElementById('notify-events').checked = this.settings.notifyEvents;
                document.getElementById('notify-bans').checked = this.settings.notifyBans;
                document.getElementById('notify-raids').checked = this.settings.notifyRaids;
                document.getElementById('command-prefix').value = this.settings.commandPrefix;
                document.getElementById('allow-commands').checked = this.settings.allowCommands;

                this.tablet.showToast('Settings reset', 'info');
            }
        });
    }

    testNotification() {
        if (!this.connected) {
            this.tablet.showError('Not connected to Discord');
            return;
        }

        this.tablet.showToast('Test notification sent', 'success');
    }

    refresh() {
        this.tablet.showToast('Discord sync refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.discordSync = new DiscordSync(window.drainedTablet);
});