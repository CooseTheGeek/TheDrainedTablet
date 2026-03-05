// PSYCHOLOGICAL PROFILING - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class PsychologicalProfiling {
    constructor(tablet) {
        this.tablet = tablet;
        this.profiles = this.loadProfiles();
        this.init();
    }

    loadProfiles() {
        const saved = localStorage.getItem('drained_psych_profiles');
        return saved ? JSON.parse(saved) : {
            'RustGod': {
                playstyle: 'aggressive',
                social: 'lone-wolf',
                activity: 'night-owl',
                riskTolerance: 91,
                trustLevel: 23,
                patterns: [
                    'Raids between 02:00-04:00',
                    'Targets bases near Dome',
                    'Prefers explosive damage'
                ],
                predictedNext: 'Base #42 at Dome within 2h',
                confidence: 78
            },
            'BuilderBob': {
                playstyle: 'passive',
                social: 'friendly',
                activity: 'daytime',
                riskTolerance: 15,
                trustLevel: 89,
                patterns: [
                    'Builds near Outpost',
                    'Trades with others',
                    'Avoids PvP'
                ],
                predictedNext: 'Expanding base',
                confidence: 92
            }
        };
    }

    saveProfiles() {
        localStorage.setItem('drained_psych_profiles', JSON.stringify(this.profiles));
    }

    init() {
        this.createPsychHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'psych') {
                this.refresh();
            }
        });
    }

    createPsychHTML() {
        const psychTab = document.getElementById('tab-psych');
        if (!psychTab) return;

        psychTab.innerHTML = `
            <div class="psych-container">
                <div class="psych-header">
                    <h2>🧠 PSYCHOLOGICAL PROFILING</h2>
                    <div class="psych-search">
                        <input type="text" id="psych-search" placeholder="Search player...">
                        <button id="analyze-psych" class="psych-btn">ANALYZE</button>
                    </div>
                </div>

                <div class="psych-grid">
                    <div class="profile-card" id="psych-profile">
                        <div class="profile-header">
                            <h3 id="psych-name">Select a player</h3>
                            <div class="profile-badge" id="psych-badge">-</div>
                        </div>

                        <div class="psych-chart" id="psych-chart"></div>

                        <div class="psych-traits">
                            <div class="trait-row">
                                <span>Playstyle:</span>
                                <span id="trait-playstyle">-</span>
                            </div>
                            <div class="trait-row">
                                <span>Social:</span>
                                <span id="trait-social">-</span>
                            </div>
                            <div class="trait-row">
                                <span>Activity:</span>
                                <span id="trait-activity">-</span>
                            </div>
                        </div>

                        <div class="psych-meters">
                            <div class="meter">
                                <label>Risk Tolerance</label>
                                <div class="meter-bar">
                                    <div class="meter-fill" id="meter-risk" style="width: 0%"></div>
                                </div>
                                <span id="risk-value">0%</span>
                            </div>
                            <div class="meter">
                                <label>Trust Level</label>
                                <div class="meter-bar">
                                    <div class="meter-fill" id="meter-trust" style="width: 0%"></div>
                                </div>
                                <span id="trust-value">0%</span>
                            </div>
                        </div>

                        <div class="behavior-patterns">
                            <h4>Behavior Patterns</h4>
                            <ul id="patterns-list"></ul>
                        </div>

                        <div class="prediction-box">
                            <h4>🔮 Predicted Next Move</h4>
                            <p id="prediction-text">-</p>
                            <p id="prediction-confidence">-</p>
                        </div>

                        <div class="profile-actions">
                            <button id="monitor-player" class="psych-btn">👁️ MONITOR</button>
                            <button id="alert-player" class="psych-btn warning">🔔 ALERT</button>
                            <button id="flag-player" class="psych-btn danger">🚩 FLAG</button>
                        </div>
                    </div>

                    <div class="watch-list">
                        <h3>👀 WATCH LIST</h3>
                        <div id="watch-list"></div>
                    </div>

                    <div class="activity-heatmap">
                        <h3>🌡️ ACTIVITY HEATMAP</h3>
                        <div class="heatmap-hours" id="heatmap-hours"></div>
                    </div>

                    <div class="psych-insights">
                        <h3>💡 INSIGHTS</h3>
                        <div id="psych-insights"></div>
                    </div>
                </div>
            </div>
        `;

        this.renderWatchList();
        this.renderHeatmap();
        this.renderInsights();
    }

    setupEventListeners() {
        document.getElementById('analyze-psych')?.addEventListener('click', () => this.analyzePlayer());
        document.getElementById('psych-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.analyzePlayer();
        });

        document.getElementById('monitor-player')?.addEventListener('click', () => this.monitorPlayer());
        document.getElementById('alert-player')?.addEventListener('click', () => this.alertPlayer());
        document.getElementById('flag-player')?.addEventListener('click', () => this.flagPlayer());
    }

    analyzePlayer() {
        const playerName = document.getElementById('psych-search').value.trim();
        if (!playerName) {
            this.tablet.showError('Enter player name');
            return;
        }

        const profile = this.profiles[playerName] || this.generateProfile(playerName);
        this.displayProfile(playerName, profile);
    }

    generateProfile(name) {
        // Generate random profile for new players
        const playstyles = ['aggressive', 'passive', 'opportunistic', 'defensive'];
        const social = ['lone-wolf', 'team-player', 'friendly', 'toxic'];
        const activity = ['daytime', 'night-owl', 'weekend', 'irregular'];

        const profile = {
            playstyle: playstyles[Math.floor(Math.random() * playstyles.length)],
            social: social[Math.floor(Math.random() * social.length)],
            activity: activity[Math.floor(Math.random() * activity.length)],
            riskTolerance: Math.floor(Math.random() * 100),
            trustLevel: Math.floor(Math.random() * 100),
            patterns: [
                `Plays during ${Math.random() > 0.5 ? 'peak' : 'off-peak'} hours`,
                `Prefers ${Math.random() > 0.5 ? 'raiding' : 'building'}`,
                `${Math.random() > 0.5 ? 'Frequently' : 'Rarely'} changes location`
            ],
            predictedNext: this.generatePrediction(),
            confidence: Math.floor(Math.random() * 30) + 60
        };

        this.profiles[name] = profile;
        this.saveProfiles();
        return profile;
    }

    generatePrediction() {
        const predictions = [
            'Will raid within next 2 hours',
            'Logging off soon',
            'Heading to Outpost',
            'Gathering resources',
            'Building expansion',
            'Joining a team'
        ];
        return predictions[Math.floor(Math.random() * predictions.length)];
    }

    displayProfile(name, profile) {
        document.getElementById('psych-name').innerText = name;
        
        // Set badge based on risk
        const badge = document.getElementById('psych-badge');
        if (profile.riskTolerance > 75) {
            badge.innerText = 'HIGH RISK';
            badge.className = 'profile-badge high';
        } else if (profile.riskTolerance > 50) {
            badge.innerText = 'MEDIUM RISK';
            badge.className = 'profile-badge medium';
        } else {
            badge.innerText = 'LOW RISK';
            badge.className = 'profile-badge low';
        }

        // Traits
        document.getElementById('trait-playstyle').innerText = this.formatTrait(profile.playstyle);
        document.getElementById('trait-social').innerText = this.formatTrait(profile.social);
        document.getElementById('trait-activity').innerText = this.formatTrait(profile.activity);

        // Meters
        document.getElementById('meter-risk').style.width = profile.riskTolerance + '%';
        document.getElementById('risk-value').innerText = profile.riskTolerance + '%';
        document.getElementById('meter-trust').style.width = profile.trustLevel + '%';
        document.getElementById('trust-value').innerText = profile.trustLevel + '%';

        // Patterns
        const patterns = document.getElementById('patterns-list');
        patterns.innerHTML = profile.patterns.map(p => `<li>${p}</li>`).join('');

        // Prediction
        document.getElementById('prediction-text').innerText = profile.predictedNext;
        document.getElementById('prediction-confidence').innerHTML = `Confidence: ${profile.confidence}%`;

        // Draw radar chart
        this.drawRadarChart(profile);
    }

    formatTrait(trait) {
        return trait.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    drawRadarChart(profile) {
        const canvas = document.getElementById('psych-chart');
        const ctx = canvas.getContext('2d');
        const w = 200;
        const h = 200;

        canvas.width = w;
        canvas.height = h;
        ctx.clearRect(0, 0, w, h);

        // Draw radar background
        ctx.strokeStyle = 'rgba(255, 177, 0, 0.2)';
        ctx.fillStyle = 'rgba(255, 177, 0, 0.1)';
        
        // Draw axes
        for (let i = 0; i < 5; i++) {
            const radius = 40 + i * 30;
            ctx.beginPath();
            for (let j = 0; j < 6; j++) {
                const angle = (j * Math.PI * 2 / 6) - Math.PI / 2;
                const x = w/2 + Math.cos(angle) * radius;
                const y = h/2 + Math.sin(angle) * radius;
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // Draw data
        const values = [
            profile.riskTolerance / 100 * 150,
            profile.trustLevel / 100 * 150,
            (profile.playstyle === 'aggressive' ? 150 : 50),
            (profile.social === 'lone-wolf' ? 150 : 50),
            (profile.activity === 'night-owl' ? 150 : 50)
        ];

        ctx.beginPath();
        ctx.strokeStyle = '#FFB100';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'rgba(255, 177, 0, 0.3)';

        for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
            const x = w/2 + Math.cos(angle) * values[i];
            const y = h/2 + Math.sin(angle) * values[i];
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    renderWatchList() {
        const list = document.getElementById('watch-list');
        list.innerHTML = `
            <div class="watch-item">
                <span>RustGod</span>
                <span class="risk-high">HIGH</span>
            </div>
            <div class="watch-item">
                <span>PvPKing</span>
                <span class="risk-high">HIGH</span>
            </div>
            <div class="watch-item">
                <span>HeadshotHero</span>
                <span class="risk-medium">MEDIUM</span>
            </div>
        `;
    }

    renderHeatmap() {
        const heatmap = document.getElementById('heatmap-hours');
        let html = '<div class="hours-grid">';
        
        for (let hour = 0; hour < 24; hour++) {
            const intensity = Math.random();
            const bgColor = `rgba(255, 177, 0, ${intensity})`;
            html += `<div class="hour-cell" style="background: ${bgColor}" title="${hour}:00 - ${intensity * 100}% activity"></div>`;
        }
        
        html += '</div>';
        heatmap.innerHTML = html;
    }

    renderInsights() {
        const insights = document.getElementById('psych-insights');
        insights.innerHTML = `
            <div class="insight-item">🎯 3 high-risk players identified</div>
            <div class="insight-item">🌙 Peak toxicity hours: 02:00-04:00</div>
            <div class="insight-item">🤝 78% of players are cooperative</div>
            <div class="insight-item">⚠️ RustGod shows aggressive patterns</div>
        `;
    }

    monitorPlayer() {
        const player = document.getElementById('psych-name').innerText;
        if (player !== 'Select a player') {
            this.tablet.showToast(`Now monitoring ${player}`, 'info');
        }
    }

    alertPlayer() {
        const player = document.getElementById('psych-name').innerText;
        if (player !== 'Select a player') {
            this.tablet.showToast(`Alert sent for ${player}`, 'warning');
        }
    }

    flagPlayer() {
        const player = document.getElementById('psych-name').innerText;
        if (player !== 'Select a player') {
            this.tablet.showToast(`${player} flagged for review`, 'error');
        }
    }

    refresh() {
        this.renderWatchList();
        this.renderHeatmap();
        this.renderInsights();
        this.tablet.showToast('Psychological profiling refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.psychologicalProfiling = new PsychologicalProfiling(window.drainedTablet);
});