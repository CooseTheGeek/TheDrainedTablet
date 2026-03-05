// AUTO-MODERATION SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class AutoMod {
    constructor(tablet) {
        this.tablet = tablet;
        this.rules = this.loadRules();
        this.violations = new Map();
        this.active = true;
        this.init();
    }

    loadRules() {
        const saved = localStorage.getItem('drained_automod_rules');
        return saved ? JSON.parse(saved) : {
            chatFilter: true,
            spamProtection: true,
            killLimit: 20,
            headshotLimit: 60,
            pingLimit: 250,
            vpnDetection: true,
            autoWarn: true,
            autoKick: true,
            autoBan: true,
            bannedPhrases: ['nigger', 'faggot', 'kys', 'ddos', 'hack', 'cheat', 'aimbot', 'wallhack', 'esp']
        };
    }

    saveRules() {
        localStorage.setItem('drained_automod_rules', JSON.stringify(this.rules));
    }

    init() {
        this.createAutoModHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'autoMod') {
                this.refresh();
            }
        });
    }

    createAutoModHTML() {
        const autoModTab = document.getElementById('tab-autoMod');
        if (!autoModTab) return;

        autoModTab.innerHTML = `
            <div class="automod-container">
                <div class="automod-header">
                    <h2>🛡️ AUTO-MODERATION</h2>
                    <div class="status-toggle">
                        <label class="switch">
                            <input type="checkbox" id="automod-toggle" ${this.active ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                        <span>System: <span id="automod-status">${this.active ? 'ACTIVE' : 'DISABLED'}</span></span>
                    </div>
                </div>

                <div class="automod-grid">
                    <div class="automod-section">
                        <h3>📝 CHAT FILTER</h3>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="chat-filter" ${this.rules.chatFilter ? 'checked' : ''}>
                                Enable Chat Filter
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label>Banned Phrases:</label>
                            <div class="phrase-list" id="phrase-list"></div>
                            <div class="add-phrase">
                                <input type="text" id="new-phrase" placeholder="Add banned phrase">
                                <button id="add-phrase" class="small-btn">➕ ADD</button>
                            </div>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="spam-protection" ${this.rules.spamProtection ? 'checked' : ''}>
                                Spam Protection
                            </label>
                        </div>
                    </div>

                    <div class="automod-section">
                        <h3>🎯 PLAYER BEHAVIOR</h3>
                        
                        <div class="setting-item">
                            <label>Kills/Hour Limit: <span id="kill-limit-val">${this.rules.killLimit}</span></label>
                            <input type="range" id="kill-limit" min="5" max="50" value="${this.rules.killLimit}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Headshot % Limit: <span id="headshot-limit-val">${this.rules.headshotLimit}</span>%</label>
                            <input type="range" id="headshot-limit" min="20" max="90" value="${this.rules.headshotLimit}">
                        </div>
                        
                        <div class="setting-item">
                            <label>Ping Limit: <span id="ping-limit-val">${this.rules.pingLimit}</span>ms</label>
                            <input type="range" id="ping-limit" min="100" max="500" step="10" value="${this.rules.pingLimit}">
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="vpn-detection" ${this.rules.vpnDetection ? 'checked' : ''}>
                                VPN/Proxy Detection
                            </label>
                        </div>
                    </div>

                    <div class="automod-section">
                        <h3>⚡ ACTIONS</h3>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="auto-warn" ${this.rules.autoWarn ? 'checked' : ''}>
                                Auto-Warn on First Offense
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="auto-kick" ${this.rules.autoKick ? 'checked' : ''}>
                                Auto-Kick on Second Offense
                            </label>
                        </div>
                        
                        <div class="checkbox-item">
                            <label>
                                <input type="checkbox" id="auto-ban" ${this.rules.autoBan ? 'checked' : ''}>
                                Auto-Ban on Third Offense
                            </label>
                        </div>
                    </div>

                    <div class="automod-section">
                        <h3>📊 RECENT VIOLATIONS</h3>
                        <div id="violations-list" class="violations-list">
                            <div class="violation-item">
                                <span>[15:32] RustGod - High kill rate (35/hr)</span>
                                <span class="violation-action">Warned</span>
                            </div>
                            <div class="violation-item">
                                <span>[15:28] PvPKing - Toxic language</span>
                                <span class="violation-action">Muted 30m</span>
                            </div>
                            <div class="violation-item">
                                <span>[15:22] HackerJoe - VPN detected</span>
                                <span class="violation-action">Kicked</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="automod-actions">
                    <button id="save-automod" class="automod-btn primary">💾 SAVE RULES</button>
                    <button id="reset-automod" class="automod-btn">🔄 RESET</button>
                    <button id="clear-violations" class="automod-btn warning">🗑️ CLEAR VIOLATIONS</button>
                </div>
            </div>
        `;

        this.renderPhrases();
        this.setupRangeListeners();
    }

    setupEventListeners() {
        document.getElementById('automod-toggle')?.addEventListener('change', (e) => {
            this.active = e.target.checked;
            document.getElementById('automod-status').innerText = this.active ? 'ACTIVE' : 'DISABLED';
        });

        document.getElementById('add-phrase')?.addEventListener('click', () => this.addPhrase());
        document.getElementById('save-automod')?.addEventListener('click', () => this.saveRules());
        document.getElementById('reset-automod')?.addEventListener('click', () => this.resetRules());
        document.getElementById('clear-violations')?.addEventListener('click', () => this.clearViolations());

        const ranges = [
            { id: 'kill-limit', val: 'kill-limit-val' },
            { id: 'headshot-limit', val: 'headshot-limit-val' },
            { id: 'ping-limit', val: 'ping-limit-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-phrase')) {
                const phrase = e.target.dataset.phrase;
                this.removePhrase(phrase);
            }
        });
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'kill-limit', val: 'kill-limit-val' },
            { id: 'headshot-limit', val: 'headshot-limit-val' },
            { id: 'ping-limit', val: 'ping-limit-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    renderPhrases() {
        const list = document.getElementById('phrase-list');
        let html = '';
        this.rules.bannedPhrases.forEach(phrase => {
            html += `
                <div class="phrase-item">
                    <span>${phrase}</span>
                    <button class="small-btn remove-phrase" data-phrase="${phrase}">✕</button>
                </div>
            `;
        });
        list.innerHTML = html;
    }

    addPhrase() {
        const input = document.getElementById('new-phrase');
        const phrase = input.value.trim().toLowerCase();
        
        if (phrase && !this.rules.bannedPhrases.includes(phrase)) {
            this.rules.bannedPhrases.push(phrase);
            this.renderPhrases();
            input.value = '';
            this.tablet.showToast(`Added phrase: ${phrase}`, 'success');
        }
    }

    removePhrase(phrase) {
        this.rules.bannedPhrases = this.rules.bannedPhrases.filter(p => p !== phrase);
        this.renderPhrases();
        this.tablet.showToast(`Removed phrase: ${phrase}`, 'info');
    }

    saveRules() {
        this.rules = {
            chatFilter: document.getElementById('chat-filter').checked,
            spamProtection: document.getElementById('spam-protection').checked,
            killLimit: parseInt(document.getElementById('kill-limit').value),
            headshotLimit: parseInt(document.getElementById('headshot-limit').value),
            pingLimit: parseInt(document.getElementById('ping-limit').value),
            vpnDetection: document.getElementById('vpn-detection').checked,
            autoWarn: document.getElementById('auto-warn').checked,
            autoKick: document.getElementById('auto-kick').checked,
            autoBan: document.getElementById('auto-ban').checked,
            bannedPhrases: this.rules.bannedPhrases
        };

        this.saveRules();
        this.tablet.showToast('Auto-mod rules saved', 'success');
    }

    resetRules() {
        this.tablet.showConfirm('Reset auto-mod rules to default?', (confirmed) => {
            if (confirmed) {
                this.rules = {
                    chatFilter: true,
                    spamProtection: true,
                    killLimit: 20,
                    headshotLimit: 60,
                    pingLimit: 250,
                    vpnDetection: true,
                    autoWarn: true,
                    autoKick: true,
                    autoBan: true,
                    bannedPhrases: ['nigger', 'faggot', 'kys', 'ddos', 'hack', 'cheat', 'aimbot', 'wallhack', 'esp']
                };

                // Update UI
                document.getElementById('chat-filter').checked = this.rules.chatFilter;
                document.getElementById('spam-protection').checked = this.rules.spamProtection;
                document.getElementById('kill-limit').value = this.rules.killLimit;
                document.getElementById('kill-limit-val').innerText = this.rules.killLimit;
                document.getElementById('headshot-limit').value = this.rules.headshotLimit;
                document.getElementById('headshot-limit-val').innerText = this.rules.headshotLimit;
                document.getElementById('ping-limit').value = this.rules.pingLimit;
                document.getElementById('ping-limit-val').innerText = this.rules.pingLimit;
                document.getElementById('vpn-detection').checked = this.rules.vpnDetection;
                document.getElementById('auto-warn').checked = this.rules.autoWarn;
                document.getElementById('auto-kick').checked = this.rules.autoKick;
                document.getElementById('auto-ban').checked = this.rules.autoBan;

                this.renderPhrases();
                this.tablet.showToast('Rules reset', 'info');
            }
        });
    }

    clearViolations() {
        this.violations.clear();
        document.getElementById('violations-list').innerHTML = '<div class="no-violations">No violations recorded</div>';
        this.tablet.showToast('Violations cleared', 'info');
    }

    refresh() {
        this.tablet.showToast('Auto-mod refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.autoMod = new AutoMod(window.drainedTablet);
});