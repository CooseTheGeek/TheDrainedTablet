// PLAYER PROFILING - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class PlayerProfiling {
    constructor(tablet) {
        this.tablet = tablet;
        this.profiles = this.loadProfiles();
        this.riskFactors = {
            killRate: 0.3,
            headshotRate: 0.25,
            reportCount: 0.2,
            playtimePattern: 0.15,
            movementPattern: 0.1
        };
        this.init();
    }

    loadProfiles() {
        const saved = localStorage.getItem('drained_player_profiles');
        return saved ? JSON.parse(saved) : {};
    }

    saveProfiles() {
        localStorage.setItem('drained_player_profiles', JSON.stringify(this.profiles));
    }

    init() {
        this.createProfilingHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'profiling') {
                this.refresh();
            }
        });
    }

    createProfilingHTML() {
        const profilingTab = document.getElementById('tab-profiling');
        if (!profilingTab) return;

        profilingTab.innerHTML = `
            <div class="profiling-container">
                <div class="profiling-header">
                    <h2>🎯 PLAYER PROFILING</h2>
                    <div class="profiling-search">
                        <input type="text" id="profile-search" placeholder="Search player...">
                        <button id="analyze-player" class="profiling-btn">ANALYZE</button>
                    </div>
                </div>

                <div class="profiling-grid">
                    <div class="profile-card" id="profile-display">
                        <div class="profile-header">
                            <h3 id="profile-name">Select a player</h3>
                            <div class="risk-badge" id="risk-badge">-</div>
                        </div>
                        
                        <div class="risk-meter">
                            <div class="risk-fill" id="risk-fill" style="width: 0%"></div>
                        </div>
                        
                        <div class="profile-stats">
                            <div class="stat-row">
                                <span>Playtime:</span>
                                <span id="stat-playtime">-</span>
                            </div>
                            <div class="stat-row">
                                <span>Kills:</span>
                                <span id="stat-kills">-</span>
                            </div>
                            <div class="stat-row">
                                <span>Deaths:</span>
                                <span id="stat-deaths">-</span>
                            </div>
                            <div class="stat-row">
                                <span>K/D Ratio:</span>
                                <span id="stat-kd">-</span>
                            </div>
                            <div class="stat-row">
                                <span>Headshot %:</span>
                                <span id="stat-headshot">-</span>
                            </div>
                            <div class="stat-row">
                                <span>Reports:</span>
                                <span id="stat-reports">-</span>
                            </div>
                        </div>

                        <div class="risk-factors" id="risk-factors"></div>

                        <div class="profile-actions">
                            <button id="flag-player" class="profiling-btn warning">🚩 FLAG</button>
                            <button id="investigate-player" class="profiling-btn">🔍 INVESTIGATE</button>
                            <button id="ban-player" class="profiling-btn danger">🔨 BAN</button>
                            <button id="export-profile" class="profiling-btn">📤 EXPORT</button>
                        </div>
                    </div>

                    <div class="high-risk-list">
                        <h3>⚠️ HIGH RISK PLAYERS</h3>
                        <div id="high-risk-players"></div>
                    </div>

                    <div class="reports-list">
                        <h3>📋 RECENT REPORTS</h3>
                        <div id="recent-reports"></div>
                    </div>

                    <div class="profiling-settings">
                        <h3>⚙️ RISK FACTORS</h3>
                        <div class="setting-item">
                            <label>Kill Rate Weight: <span id="kill-weight-val">${this.riskFactors.killRate * 100}</span>%</label>
                            <input type="range" id="kill-weight" min="0" max="50" step="5" value="${this.riskFactors.killRate * 100}">
                        </div>
                        <div class="setting-item">
                            <label>Headshot Weight: <span id="headshot-weight-val">${this.riskFactors.headshotRate * 100}</span>%</label>
                            <input type="range" id="headshot-weight" min="0" max="50" step="5" value="${this.riskFactors.headshotRate * 100}">
                        </div>
                        <div class="setting-item">
                            <label>Report Weight: <span id="report-weight-val">${this.riskFactors.reportCount * 100}</span>%</label>
                            <input type="range" id="report-weight" min="0" max="50" step="5" value="${this.riskFactors.reportCount * 100}">
                        </div>
                        <button id="save-weights" class="profiling-btn">SAVE WEIGHTS</button>
                    </div>
                </div>
            </div>
        `;

        this.renderHighRisk();
        this.renderReports();
        this.setupRangeListeners();
    }

    setupEventListeners() {
        document.getElementById('analyze-player')?.addEventListener('click', () => this.analyzePlayer());
        document.getElementById('profile-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.analyzePlayer();
        });

        document.getElementById('flag-player')?.addEventListener('click', () => this.flagPlayer());
        document.getElementById('investigate-player')?.addEventListener('click', () => this.investigatePlayer());
        document.getElementById('ban-player')?.addEventListener('click', () => this.banPlayer());
        document.getElementById('export-profile')?.addEventListener('click', () => this.exportProfile());
        document.getElementById('save-weights')?.addEventListener('click', () => this.saveWeights());

        const ranges = [
            { id: 'kill-weight', val: 'kill-weight-val' },
            { id: 'headshot-weight', val: 'headshot-weight-val' },
            { id: 'report-weight', val: 'report-weight-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    setupRangeListeners() {
        const ranges = [
            { id: 'kill-weight', val: 'kill-weight-val' },
            { id: 'headshot-weight', val: 'headshot-weight-val' },
            { id: 'report-weight', val: 'report-weight-val' }
        ];

        ranges.forEach(item => {
            document.getElementById(item.id)?.addEventListener('input', (e) => {
                document.getElementById(item.val).innerText = e.target.value;
            });
        });
    }

    analyzePlayer() {
        const playerName = document.getElementById('profile-search').value.trim();
        if (!playerName) {
            this.tablet.showError('Enter player name');
            return;
        }

        // Mock player data
        const playerData = {
            name: playerName,
            playtime: 342,
            kills: 127,
            deaths: 43,
            kd: (127 / 43).toFixed(2),
            headshot: 68,
            reports: 12,
            killRate: 22.5,
            playtimePattern: 'night',
            movementScore: 0.7
        };

        this.displayProfile(playerData);
    }

    displayProfile(player) {
        document.getElementById('profile-name').innerText = player.name;
        document.getElementById('stat-playtime').innerText = player.playtime + 'h';
        document.getElementById('stat-kills').innerText = player.kills;
        document.getElementById('stat-deaths').innerText = player.deaths;
        document.getElementById('stat-kd').innerText = player.kd;
        document.getElementById('stat-headshot').innerText = player.headshot + '%';
        document.getElementById('stat-reports').innerText = player.reports;

        // Calculate risk score
        const riskScore = this.calculateRiskScore(player);
        document.getElementById('risk-fill').style.width = riskScore + '%';
        
        const badge = document.getElementById('risk-badge');
        if (riskScore > 75) {
            badge.innerText = 'CRITICAL';
            badge.className = 'risk-badge critical';
        } else if (riskScore > 50) {
            badge.innerText = 'HIGH';
            badge.className = 'risk-badge high';
        } else if (riskScore > 25) {
            badge.innerText = 'MEDIUM';
            badge.className = 'risk-badge medium';
        } else {
            badge.innerText = 'LOW';
            badge.className = 'risk-badge low';
        }

        // Show risk factors
        const factors = document.getElementById('risk-factors');
        factors.innerHTML = `
            <div class="factor-item">
                <span>Kill Rate (${player.killRate}/hr):</span>
                <span class="factor-${player.killRate > 15 ? 'high' : 'normal'}">${player.killRate > 15 ? '⚠️ HIGH' : '✓ NORMAL'}</span>
            </div>
            <div class="factor-item">
                <span>Headshot % (${player.headshot}%):</span>
                <span class="factor-${player.headshot > 50 ? 'high' : 'normal'}">${player.headshot > 50 ? '⚠️ HIGH' : '✓ NORMAL'}</span>
            </div>
            <div class="factor-item">
                <span>Reports (${player.reports}):</span>
                <span class="factor-${player.reports > 5 ? 'high' : 'normal'}">${player.reports > 5 ? '⚠️ HIGH' : '✓ NORMAL'}</span>
            </div>
            <div class="factor-item">
                <span>Playtime Pattern:</span>
                <span class="factor-${player.playtimePattern === 'night' ? 'warning' : 'normal'}">${player.playtimePattern === 'night' ? '🌙 NIGHT OWL' : '✓ NORMAL'}</span>
            </div>
        `;
    }

    calculateRiskScore(player) {
        const killScore = (player.killRate / 30) * 100 * this.riskFactors.killRate;
        const headshotScore = (player.headshot / 70) * 100 * this.riskFactors.headshotRate;
        const reportScore = (player.reports / 20) * 100 * this.riskFactors.reportCount;
        const patternScore = (player.playtimePattern === 'night' ? 80 : 20) * this.riskFactors.playtimePattern;
        const movementScore = player.movementScore * 100 * this.riskFactors.movementPattern;

        return Math.min(100, Math.round(
            killScore + headshotScore + reportScore + patternScore + movementScore
        ));
    }

    renderHighRisk() {
        const list = document.getElementById('high-risk-players');
        list.innerHTML = `
            <div class="risk-player">
                <span>RustGod</span>
                <span class="risk-score high">76</span>
            </div>
            <div class="risk-player">
                <span>PvPKing</span>
                <span class="risk-score high">68</span>
            </div>
            <div class="risk-player">
                <span>HeadshotHero</span>
                <span class="risk-score medium">59</span>
            </div>
            <div class="risk-player">
                <span>SilentAimer</span>
                <span class="risk-score medium">51</span>
            </div>
        `;
    }

    renderReports() {
        const list = document.getElementById('recent-reports');
        list.innerHTML = `
            <div class="report-item">
                <span>RustGod</span>
                <span>Reported by 3 players</span>
                <span class="report-time">5m ago</span>
            </div>
            <div class="report-item">
                <span>PvPKing</span>
                <span>Suspicious aim</span>
                <span class="report-time">12m ago</span>
            </div>
            <div class="report-item">
                <span>BuilderBob</span>
                <span>Griefing</span>
                <span class="report-time">23m ago</span>
            </div>
        `;
    }

    flagPlayer() {
        const player = document.getElementById('profile-name').innerText;
        if (player !== 'Select a player') {
            this.tablet.showToast(`Flagged ${player} for review`, 'warning');
        }
    }

    investigatePlayer() {
        const player = document.getElementById('profile-name').innerText;
        if (player !== 'Select a player') {
            this.tablet.showToast(`Investigating ${player}...`, 'info');
        }
    }

    banPlayer() {
        const player = document.getElementById('profile-name').innerText;
        if (player !== 'Select a player') {
            this.tablet.showConfirm(`Ban ${player}?`, (confirmed) => {
                if (confirmed) {
                    this.tablet.showToast(`${player} banned`, 'error');
                }
            });
        }
    }

    exportProfile() {
        const player = document.getElementById('profile-name').innerText;
        if (player !== 'Select a player') {
            this.tablet.showToast(`Profile exported`, 'success');
        }
    }

    saveWeights() {
        this.riskFactors = {
            killRate: parseInt(document.getElementById('kill-weight').value) / 100,
            headshotRate: parseInt(document.getElementById('headshot-weight').value) / 100,
            reportCount: parseInt(document.getElementById('report-weight').value) / 100,
            playtimePattern: 0.15,
            movementPattern: 0.1
        };
        this.tablet.showToast('Risk weights saved', 'success');
    }

    refresh() {
        this.tablet.showToast('Player profiling refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.playerProfiling = new PlayerProfiling(window.drainedTablet);
});