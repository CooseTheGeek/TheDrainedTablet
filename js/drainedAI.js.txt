// DRAINED AI - SELF-LEARNING ASSISTANT
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class DrainedAI {
    constructor(tablet) {
        this.tablet = tablet;
        this.learning = true;
        this.suggestions = [];
        this.learnedPatterns = this.loadPatterns();
        this.init();
    }

    loadPatterns() {
        const saved = localStorage.getItem('drained_ai_patterns');
        return saved ? JSON.parse(saved) : {
            playerCounts: [],
            raidTimes: [],
            popularCommands: [],
            peakHours: []
        };
    }

    init() {
        this.createAIHTML();
        this.setupEventListeners();
        this.startLearning();
    }

    createAIHTML() {
        const aiTab = document.getElementById('tab-drainedAI');
        if (!aiTab) return;

        aiTab.innerHTML = `
            <div class="ai-container">
                <div class="ai-header">
                    <h2>🤖 DRAINED AI</h2>
                    <p>Self-learning server assistant</p>
                </div>
                
                <div class="ai-status">
                    <span class="status-indicator">🟢</span>
                    <span>AI Active - Learning Mode: ${this.learning ? 'ON' : 'OFF'}</span>
                    <button id="ai-toggle-learn" class="ai-btn">${this.learning ? 'PAUSE' : 'RESUME'} LEARNING</button>
                </div>
                
                <div class="ai-suggestions" id="ai-suggestions">
                    <h3>SUGGESTIONS</h3>
                    <div id="suggestions-list"></div>
                </div>
                
                <div class="ai-insights">
                    <h3>SERVER INSIGHTS</h3>
                    <div class="insights-grid">
                        <div class="insight-card">
                            <div class="insight-value">${this.learnedPatterns.peakHours[0] || '--:--'}</div>
                            <div class="insight-label">Peak Hour</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-value">${this.learnedPatterns.playerCounts[this.learnedPatterns.playerCounts.length-1] || '0'}</div>
                            <div class="insight-label">Avg Players</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-value">${this.learnedPatterns.raidTimes.length || '0'}</div>
                            <div class="insight-label">Raids Detected</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-value">${Math.floor(Math.random() * 90 + 10)}%</div>
                            <div class="insight-label">Accuracy</div>
                        </div>
                    </div>
                </div>
                
                <div class="ai-chat">
                    <h3>ASK AI</h3>
                    <div class="ai-chat-container">
                        <div id="ai-chat-messages" class="ai-chat-messages"></div>
                        <div class="ai-chat-input">
                            <input type="text" id="ai-question" placeholder="Ask AI something...">
                            <button id="ai-ask" class="ai-btn">ASK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.generateSuggestions();
    }

    setupEventListeners() {
        document.getElementById('ai-toggle-learn')?.addEventListener('click', () => this.toggleLearning());
        document.getElementById('ai-ask')?.addEventListener('click', () => this.askQuestion());
        document.getElementById('ai-question')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.askQuestion();
        });
    }

    toggleLearning() {
        this.learning = !this.learning;
        const btn = document.getElementById('ai-toggle-learn');
        btn.innerText = this.learning ? 'PAUSE LEARNING' : 'RESUME LEARNING';
        this.tablet.showToast(`AI Learning ${this.learning ? 'resumed' : 'paused'}`, 'info');
    }

    startLearning() {
        setInterval(() => {
            if (this.learning && this.tablet.connected) {
                this.learn();
            }
        }, 60000); // Learn every minute

        setInterval(() => {
            if (this.learning) {
                this.generateSuggestions();
            }
        }, 300000); // Generate suggestions every 5 minutes
    }

    learn() {
        // Simulate learning from server data
        const hour = new Date().getHours();
        this.learnedPatterns.peakHours.push(hour);
        this.learnedPatterns.playerCounts.push(Math.floor(Math.random() * 50) + 10);
        
        // Keep only last 100 data points
        if (this.learnedPatterns.peakHours.length > 100) {
            this.learnedPatterns.peakHours.shift();
        }
        if (this.learnedPatterns.playerCounts.length > 100) {
            this.learnedPatterns.playerCounts.shift();
        }
        
        localStorage.setItem('drained_ai_patterns', JSON.stringify(this.learnedPatterns));
    }

    generateSuggestions() {
        const suggestions = [
            {
                type: 'event',
                message: 'Low player count detected. Consider triggering an event to attract players.',
                command: 'events.triggerevent event_cargoheli',
                confidence: 87
            },
            {
                type: 'performance',
                message: 'Server FPS is stable. No action needed.',
                confidence: 95
            },
            {
                type: 'raid',
                message: '3 players near Dome with explosives - potential raid incoming',
                confidence: 72
            },
            {
                type: 'ban',
                message: 'Player "RustGod" has unusual kill ratio - investigate',
                confidence: 64
            }
        ];

        this.suggestions = suggestions;
        this.renderSuggestions();
    }

    renderSuggestions() {
        const list = document.getElementById('suggestions-list');
        if (!list) return;

        let html = '';
        this.suggestions.forEach(suggestion => {
            html += `
                <div class="suggestion-item">
                    <div class="suggestion-header">
                        <span class="suggestion-type">${this.getSuggestionIcon(suggestion.type)}</span>
                        <span class="suggestion-confidence">${suggestion.confidence}% confidence</span>
                    </div>
                    <div class="suggestion-message">${suggestion.message}</div>
                    ${suggestion.command ? `<button class="suggestion-execute" onclick="drainedAI.executeSuggestion('${suggestion.command}')">EXECUTE</button>` : ''}
                </div>
            `;
        });

        list.innerHTML = html;
    }

    getSuggestionIcon(type) {
        const icons = {
            event: '🎉',
            performance: '📊',
            raid: '⚡',
            ban: '🔨',
            default: '💡'
        };
        return icons[type] || icons.default;
    }

    executeSuggestion(command) {
        this.tablet.showToast(`Executing: ${command}`, 'info');
        // In real version, this would send RCON command
        setTimeout(() => {
            this.tablet.showToast('Command executed', 'success');
        }, 1000);
    }

    askQuestion() {
        const question = document.getElementById('ai-question').value.trim();
        if (!question) return;

        this.addChatMessage('You', question, 'user');
        document.getElementById('ai-question').value = '';

        // Simulate AI thinking
        setTimeout(() => {
            const answer = this.generateAnswer(question);
            this.addChatMessage('AI', answer, 'ai');
        }, 1000);
    }

    generateAnswer(question) {
        const q = question.toLowerCase();
        
        if (q.includes('player') || q.includes('online')) {
            return `Currently ${Math.floor(Math.random() * 50) + 10} players online. Peak today was 45 at 20:00.`;
        }
        if (q.includes('raid') || q.includes('raid')) {
            return 'Based on patterns, there is a 72% chance of a raid in the next 2 hours. Watch Dome and Airfield.';
        }
        if (q.includes('performance') || q.includes('fps')) {
            return 'Server performance is stable at 60 FPS with 42% CPU usage. All systems nominal.';
        }
        if (q.includes('ban') || q.includes('cheater')) {
            return 'No cheaters detected in the last 24 hours. Player "RustGod" flagged for review.';
        }
        if (q.includes('event')) {
            return 'Consider running a cargo ship event - player count is optimal for it right now.';
        }
        
        return 'I need more data to answer that question accurately. Continue using the dashboard and I will learn.';
    }

    addChatMessage(sender, text, type) {
        const container = document.getElementById('ai-chat-messages');
        if (!container) return;

        const msg = document.createElement('div');
        msg.className = `ai-chat-message ${type}`;
        msg.innerHTML = `
            <span class="ai-chat-sender">${sender}:</span>
            <span class="ai-chat-text">${text}</span>
        `;

        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.drainedAI = new DrainedAI(window.drainedTablet);
});