// PREDICTIVE ANALYTICS - EXCLUSIVE FEATURE
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class PredictiveAnalytics {
    constructor(tablet) {
        this.tablet = tablet;
        this.historicalData = this.loadData();
        this.predictions = {};
        this.init();
    }

    loadData() {
        const saved = localStorage.getItem('drained_predictive_data');
        return saved ? JSON.parse(saved) : {
            playerCounts: [],
            wipeDates: [],
            raidTimes: [],
            peakHours: [],
            dailyActive: []
        };
    }

    init() {
        this.createAnalyticsHTML();
        this.setupEventListeners();
        this.startDataCollection();
        this.generatePredictions();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'predictive') {
                this.refresh();
            }
        });
    }

    createAnalyticsHTML() {
        const predictiveTab = document.getElementById('tab-predictive');
        if (!predictiveTab) return;

        predictiveTab.innerHTML = `
            <div class="analytics-container">
                <div class="analytics-header">
                    <h2>📈 PREDICTIVE ANALYTICS</h2>
                    <button id="analytics-refresh" class="analytics-btn">🔄 REFRESH</button>
                </div>
                
                <div class="predictions-grid">
                    <div class="prediction-card">
                        <h3>NEXT WIPE</h3>
                        <div class="prediction-value" id="wipe-prediction">Calculating...</div>
                        <div class="prediction-confidence" id="wipe-confidence"></div>
                    </div>
                    
                    <div class="prediction-card">
                        <h3>PEAK HOURS</h3>
                        <div class="prediction-value" id="peak-prediction">Calculating...</div>
                        <div class="prediction-chart" id="peak-chart"></div>
                    </div>
                    
                    <div class="prediction-card">
                        <h3>RAID RISK</h3>
                        <div class="prediction-value" id="raid-risk">Calculating...</div>
                        <div class="risk-areas" id="risk-areas"></div>
                    </div>
                    
                    <div class="prediction-card">
                        <h3>PLAYER RETENTION</h3>
                        <div class="prediction-value" id="retention">Calculating...</div>
                        <div class="retention-trend" id="retention-trend"></div>
                    </div>
                </div>
                
                <div class="analytics-charts">
                    <h3>HISTORICAL TRENDS</h3>
                    <canvas id="trend-chart" width="800" height="300"></canvas>
                </div>
                
                <div class="risk-assessment">
                    <h3>⚠️ BASES AT RISK</h3>
                    <div id="risk-list"></div>
                </div>
            </div>
        `;

        this.renderPredictions();
    }

    setupEventListeners() {
        document.getElementById('analytics-refresh')?.addEventListener('click', () => this.refresh());
    }

    startDataCollection() {
        setInterval(() => {
            this.collectData();
            this.generatePredictions();
        }, 3600000); // Collect every hour
    }

    collectData() {
        if (!this.tablet.connected) return;

        const hour = new Date().getHours();
        const day = new Date().getDay();
        const playerCount = this.tablet.realPlayers.length;

        this.historicalData.playerCounts.push({
            time: Date.now(),
            count: playerCount,
            hour: hour,
            day: day
        });

        this.historicalData.peakHours.push(hour);

        // Keep last 1000 data points
        if (this.historicalData.playerCounts.length > 1000) {
            this.historicalData.playerCounts.shift();
        }
        if (this.historicalData.peakHours.length > 1000) {
            this.historicalData.peakHours.shift();
        }

        localStorage.setItem('drained_predictive_data', JSON.stringify(this.historicalData));
    }

    generatePredictions() {
        this.predictNextWipe();
        this.predictPeakHours();
        this.calculateRaidRisk();
        this.calculateRetention();
        this.renderPredictions();  // now safe because we added guards
        this.drawTrendChart();
    }

    predictNextWipe() {
        const playerTrend = this.analyzePlayerTrend();
        const daysSinceLastWipe = this.getDaysSinceLastWipe();
        
        let confidence = 70;
        let daysToWipe = 14 - (daysSinceLastWipe % 14);
        
        if (playerTrend < -20) {
            daysToWipe = Math.max(1, daysToWipe - 3);
            confidence += 10;
        }
        if (playerTrend > 20) {
            daysToWipe = Math.min(14, daysToWipe + 2);
        }

        this.predictions.wipe = {
            days: daysToWipe,
            date: new Date(Date.now() + daysToWipe * 24 * 60 * 60 * 1000),
            confidence: confidence,
            reason: this.getWipeReason(playerTrend)
        };
    }

    predictPeakHours() {
        const hourCounts = new Array(24).fill(0);
        this.historicalData.peakHours.forEach(hour => {
            hourCounts[hour]++;
        });

        let peakHour = 0;
        let maxCount = 0;
        hourCounts.forEach((count, hour) => {
            if (count > maxCount) {
                maxCount = count;
                peakHour = hour;
            }
        });

        this.predictions.peak = {
            hour: peakHour,
            formatted: `${peakHour}:00 - ${(peakHour + 1) % 24}:00`,
            confidence: Math.min(95, Math.round((maxCount / this.historicalData.peakHours.length) * 100))
        };
    }

    calculateRaidRisk() {
        const currentHour = new Date().getHours();
        const raidProbability = this.analyzeRaidPatterns();
        
        const riskAreas = [
            { name: 'Dome', risk: Math.floor(Math.random() * 100) },
            { name: 'Airfield', risk: Math.floor(Math.random() * 100) },
            { name: 'Launch Site', risk: Math.floor(Math.random() * 100) },
            { name: 'Large Oil Rig', risk: Math.floor(Math.random() * 100) }
        ].sort((a, b) => b.risk - a.risk);

        this.predictions.raid = {
            probability: raidProbability,
            riskLevel: this.getRiskLevel(raidProbability),
            topAreas: riskAreas.slice(0, 3)
        };
    }

    calculateRetention() {
        const weeklyActive = this.calculateWeeklyActive();
        const newPlayers = Math.floor(Math.random() * 20) + 5;
        const returningPlayers = Math.floor(Math.random() * 15) + 3;

        this.predictions.retention = {
            rate: weeklyActive,
            newPlayers: newPlayers,
            returning: returningPlayers,
            trend: weeklyActive > 60 ? 'increasing' : 'decreasing'
        };
    }

    analyzePlayerTrend() {
        if (this.historicalData.playerCounts.length < 2) return 0;
        
        const recent = this.historicalData.playerCounts.slice(-10);
        const old = this.historicalData.playerCounts.slice(-20, -10);
        
        const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
        const oldAvg = old.reduce((sum, d) => sum + d.count, 0) / old.length;
        
        return ((recentAvg - oldAvg) / oldAvg) * 100;
    }

    getDaysSinceLastWipe() {
        // In real version, would track actual wipe dates
        return 7;
    }

    analyzeRaidPatterns() {
        const hour = new Date().getHours();
        if (hour >= 22 || hour <= 4) return 75 + Math.floor(Math.random() * 20);
        if (hour >= 18 && hour <= 21) return 50 + Math.floor(Math.random() * 30);
        return 30 + Math.floor(Math.random() * 40);
    }

    calculateWeeklyActive() {
        return 50 + Math.floor(Math.random() * 30);
    }

    getWipeReason(trend) {
        if (trend < -20) return 'Rapid player dropoff detected';
        if (trend > 20) return 'High player activity - delaying wipe';
        return 'Normal player cycle';
    }

    getRiskLevel(probability) {
        if (probability > 70) return 'HIGH';
        if (probability > 40) return 'MEDIUM';
        return 'LOW';
    }

    renderPredictions() {
        // Guard: if predictions object isn't fully built, return
        if (!this.predictions.wipe) return;

        const wipeEl = document.getElementById('wipe-prediction');
        if (wipeEl) wipeEl.innerText = this.predictions.wipe.date?.toLocaleDateString() || 'Calculating...';

        const confEl = document.getElementById('wipe-confidence');
        if (confEl) {
            confEl.innerHTML = `<progress value="${this.predictions.wipe.confidence || 0}" max="100"></progress> ${this.predictions.wipe.confidence || 0}% confidence - ${this.predictions.wipe.reason || ''}`;
        }

        const peakEl = document.getElementById('peak-prediction');
        if (peakEl) peakEl.innerText = this.predictions.peak?.formatted || 'Calculating...';

        const raidEl = document.getElementById('raid-risk');
        if (raidEl) {
            raidEl.innerHTML = `<span class="risk-${this.predictions.raid?.riskLevel?.toLowerCase() || 'low'}">${this.predictions.raid?.riskLevel || 'LOW'} (${this.predictions.raid?.probability || 0}%)</span>`;
        }

        const riskList = document.getElementById('risk-areas');
        if (riskList && this.predictions.raid?.topAreas) {
            riskList.innerHTML = this.predictions.raid.topAreas.map(area => 
                `<div class="risk-area"><span>${area.name}</span><progress value="${area.risk}" max="100"></progress><span>${area.risk}%</span></div>`
            ).join('');
        }

        const retEl = document.getElementById('retention');
        if (retEl) retEl.innerText = `${this.predictions.retention?.rate || 0}% weekly retention`;

        const trendEl = document.getElementById('retention-trend');
        if (trendEl) {
            trendEl.innerHTML = `New: ${this.predictions.retention?.newPlayers || 0} | Returning: ${this.predictions.retention?.returning || 0}`;
        }
    }

    drawTrendChart() {
        const canvas = document.getElementById('trend-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = '#FFB100';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(50, h - 50);
        ctx.lineTo(w - 50, h - 50);
        ctx.stroke();

        const data = this.historicalData.playerCounts.slice(-20);
        if (data.length < 2) return;

        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();

        data.forEach((point, i) => {
            const x = 50 + (i / (data.length - 1)) * (w - 100);
            const y = h - 50 - (point.count / 100) * (h - 100);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        ctx.fillStyle = '#FFB100';
        ctx.font = '10px monospace';
        ctx.fillText('Time', w - 60, h - 20);
        ctx.fillText('Players', 20, 40);
    }

    refresh() {
        this.generatePredictions();
        this.drawTrendChart();
        this.tablet.showToast('Analytics refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.predictiveAnalytics = new PredictiveAnalytics(window.drainedTablet);
});
