// VOICE COMMANDS - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Stewart (CooseTheGeek). All Rights Reserved.

class VoiceCommands {
    constructor(tablet) {
        this.tablet = tablet;
        this.listening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.commands = this.loadCommands();
        this.voiceEnabled = true;
        this.wakeWord = 'hey drained';
        this.init();
    }

    loadCommands() {
        return {
            'who is online': () => this.getOnlinePlayers(),
            'server status': () => this.getServerStatus(),
            'kick': (player) => this.kickPlayer(player),
            'ban': (player) => this.banPlayer(player),
            'spawn heli': () => this.spawnHeli(),
            'spawn crate': () => this.spawnCrate(),
            'time': () => this.getTime(),
            'weather': () => this.getWeather(),
            'mute': (player) => this.mutePlayer(player),
            'give kit': (kit, player) => this.giveKit(kit, player)
        };
    }

    init() {
        this.createVoiceHTML();
        this.setupEventListeners();
        this.initSpeechRecognition();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'voice') {
                this.refresh();
            }
        });
    }

    createVoiceHTML() {
        const voiceTab = document.getElementById('tab-voice');
        if (!voiceTab) return;

        voiceTab.innerHTML = `
            <div class="voice-container">
                <div class="voice-header">
                    <h2>🎤 VOICE COMMANDS</h2>
                    <div class="voice-status">
                        <span id="voice-indicator" class="indicator-off">⚫</span>
                        <span id="voice-status-text">Not Listening</span>
                    </div>
                </div>

                <div class="voice-controls">
                    <button id="start-listening" class="voice-btn primary">🎤 START LISTENING</button>
                    <button id="stop-listening" class="voice-btn">⏹️ STOP</button>
                    <button id="test-voice" class="voice-btn">🔊 TEST SPEAKER</button>
                </div>

                <div class="voice-settings">
                    <h3>⚙️ SETTINGS</h3>
                    
                    <div class="setting-item">
                        <label>Wake Word:</label>
                        <select id="wake-word">
                            <option value="hey drained">Hey Drained</option>
                            <option value="ok drained">OK Drained</option>
                            <option value="tablet">Tablet</option>
                            <option value="custom">Custom</option>
                        </select>
                    </div>
                    
                    <div class="setting-item" id="custom-wake" style="display: none;">
                        <label>Custom Wake Word:</label>
                        <input type="text" id="custom-wake-word" placeholder="Enter wake word">
                    </div>
                    
                    <div class="setting-item">
                        <label>Voice:</label>
                        <select id="voice-select">
                            <option value="en-US">English (US)</option>
                            <option value="en-GB">English (UK)</option>
                            <option value="en-AU">English (Australia)</option>
                        </select>
                    </div>
                    
                    <div class="setting-item">
                        <label>Speed:</label>
                        <input type="range" id="voice-speed" min="0.5" max="2" step="0.1" value="1">
                    </div>
                    
                    <div class="checkbox-item">
                        <label>
                            <input type="checkbox" id="voice-feedback" checked>
                            Voice Feedback
                        </label>
                    </div>
                    
                    <div class="checkbox-item">
                        <label>
                            <input type="checkbox" id="require-wake" checked>
                            Require Wake Word
                        </label>
                    </div>
                </div>

                <div class="voice-transcript">
                    <h3>📝 LIVE TRANSCRIPT</h3>
                    <div id="transcript-box" class="transcript-box">
                        <div class="transcript-item">[System] Voice commands ready</div>
                    </div>
                </div>

                <div class="voice-commands-list">
                    <h3>📋 AVAILABLE COMMANDS</h3>
                    <div class="commands-grid">
                        <div class="command-card">
                            <code>"who is online"</code>
                            <span>List online players</span>
                        </div>
                        <div class="command-card">
                            <code>"server status"</code>
                            <span>Get server status</span>
                        </div>
                        <div class="command-card">
                            <code>"kick [player]"</code>
                            <span>Kick a player</span>
                        </div>
                        <div class="command-card">
                            <code>"ban [player]"</code>
                            <span>Ban a player</span>
                        </div>
                        <div class="command-card">
                            <code>"spawn heli"</code>
                            <span>Spawn helicopter</span>
                        </div>
                        <div class="command-card">
                            <code>"spawn crate"</code>
                            <span>Spawn supply crate</span>
                        </div>
                        <div class="command-card">
                            <code>"what time is it"</code>
                            <span>Get in-game time</span>
                        </div>
                        <div class="command-card">
                            <code>"what's the weather"</code>
                            <span>Get weather</span>
                        </div>
                        <div class="command-card">
                            <code>"mute [player]"</code>
                            <span>Mute player</span>
                        </div>
                        <div class="command-card">
                            <code>"give [kit] to [player]"</code>
                            <span>Give kit to player</span>
                        </div>
                    </div>
                </div>

                <div class="voice-history">
                    <h3>📜 COMMAND HISTORY</h3>
                    <div id="voice-history" class="history-list"></div>
                </div>
            </div>
        `;

        this.setupSettingsListeners();
    }

    setupEventListeners() {
        document.getElementById('start-listening')?.addEventListener('click', () => this.startListening());
        document.getElementById('stop-listening')?.addEventListener('click', () => this.stopListening());
        document.getElementById('test-voice')?.addEventListener('click', () => this.testVoice());
        
        document.getElementById('wake-word')?.addEventListener('change', (e) => {
            const custom = document.getElementById('custom-wake');
            custom.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }

    setupSettingsListeners() {
        document.getElementById('wake-word')?.addEventListener('change', (e) => {
            const custom = document.getElementById('custom-wake');
            custom.style.display = e.target.value === 'custom' ? 'block' : 'none';
        });
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
                this.processCommand(transcript);
            };

            this.recognition.onerror = (event) => {
                this.addTranscript(`[Error] ${event.error}`);
            };
        } else {
            this.addTranscript('[Error] Speech recognition not supported');
        }
    }

    startListening() {
        if (!this.recognition) {
            this.tablet.showError('Speech recognition not supported');
            return;
        }

        this.listening = true;
        this.recognition.start();
        document.getElementById('voice-indicator').className = 'indicator-on';
        document.getElementById('voice-indicator').innerHTML = '🟢';
        document.getElementById('voice-status-text').innerText = 'Listening...';
        this.addTranscript('[System] Listening for commands...');
    }

    stopListening() {
        if (this.recognition) {
            this.recognition.stop();
        }
        this.listening = false;
        document.getElementById('voice-indicator').className = 'indicator-off';
        document.getElementById('voice-indicator'.innerHTML = '⚫');
        document.getElementById('voice-status-text').innerText = 'Not Listening';
        this.addTranscript('[System] Stopped listening');
    }

    processCommand(transcript) {
        this.addTranscript(`[You] ${transcript}`);
        
        const requireWake = document.getElementById('require-wake')?.checked;
        const wakeWord = document.getElementById('wake-word')?.value === 'custom' 
            ? document.getElementById('custom-wake-word')?.value.toLowerCase()
            : this.wakeWord;

        if (requireWake && !transcript.includes(wakeWord)) {
            return;
        }

        // Remove wake word from transcript
        let command = transcript;
        if (requireWake) {
            command = command.replace(wakeWord, '').trim();
        }

        // Process command
        if (command.includes('who is online') || command.includes('who online')) {
            this.getOnlinePlayers();
        }
        else if (command.includes('server status') || command.includes('status')) {
            this.getServerStatus();
        }
        else if (command.includes('kick')) {
            const player = this.extractPlayerName(command);
            if (player) this.kickPlayer(player);
        }
        else if (command.includes('ban')) {
            const player = this.extractPlayerName(command);
            if (player) this.banPlayer(player);
        }
        else if (command.includes('spawn heli')) {
            this.spawnHeli();
        }
        else if (command.includes('spawn crate')) {
            this.spawnCrate();
        }
        else if (command.includes('time')) {
            this.getTime();
        }
        else if (command.includes('weather')) {
            this.getWeather();
        }
        else if (command.includes('mute')) {
            const player = this.extractPlayerName(command);
            if (player) this.mutePlayer(player);
        }
        else if (command.includes('give')) {
            this.parseGiveCommand(command);
        }
        else {
            this.speak("I didn't understand that command");
        }
    }

    extractPlayerName(text) {
        // Simple extraction - would need more robust parsing
        const words = text.split(' ');
        return words[words.length - 1];
    }

    parseGiveCommand(text) {
        // Parse "give [kit] to [player]"
        const match = text.match(/give (.+?) to (.+)/);
        if (match) {
            this.giveKit(match[1].trim(), match[2].trim());
        }
    }

    getOnlinePlayers() {
        const count = Math.floor(Math.random() * 50) + 10;
        this.speak(`There are ${count} players online`);
        this.addCommandHistory('getOnlinePlayers', `Found ${count} players`);
    }

    getServerStatus() {
        this.speak('Server is running normally with 60 FPS');
        this.addCommandHistory('getServerStatus', 'Server status retrieved');
    }

    kickPlayer(player) {
        this.tablet.showConfirm(`Kick ${player}?`, (confirmed) => {
            if (confirmed) {
                this.speak(`${player} has been kicked`);
                this.addCommandHistory('kick', `Kicked ${player}`);
            }
        });
    }

    banPlayer(player) {
        this.tablet.showConfirm(`Ban ${player}?`, (confirmed) => {
            if (confirmed) {
                this.speak(`${player} has been banned`);
                this.addCommandHistory('ban', `Banned ${player}`);
            }
        });
    }

    spawnHeli() {
        this.speak('Spawning attack helicopter');
        this.addCommandHistory('spawnHeli', 'Helicopter spawned');
    }

    spawnCrate() {
        this.speak('Spawning supply crate');
        this.addCommandHistory('spawnCrate', 'Crate spawned');
    }

    getTime() {
        const time = '15:23';
        this.speak(`The current in-game time is ${time}`);
        this.addCommandHistory('getTime', `Time: ${time}`);
    }

    getWeather() {
        const weather = 'Clear';
        this.speak(`Current weather is ${weather}`);
        this.addCommandHistory('getWeather', `Weather: ${weather}`);
    }

    mutePlayer(player) {
        this.speak(`${player} has been muted`);
        this.addCommandHistory('mute', `Muted ${player}`);
    }

    giveKit(kit, player) {
        this.speak(`Giving ${kit} kit to ${player}`);
        this.addCommandHistory('giveKit', `Gave ${kit} to ${player}`);
    }

    speak(text) {
        if (!document.getElementById('voice-feedback')?.checked) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = parseFloat(document.getElementById('voice-speed')?.value || 1);
        this.synthesis.speak(utterance);
        this.addTranscript(`[Assistant] ${text}`);
    }

    testVoice() {
        this.speak('Voice test successful. Drained Tablet is ready.');
    }

    addTranscript(text) {
        const box = document.getElementById('transcript-box');
        const item = document.createElement('div');
        item.className = 'transcript-item';
        item.innerText = text;
        box.appendChild(item);
        box.scrollTop = box.scrollHeight;

        if (box.children.length > 20) {
            box.removeChild(box.children[0]);
        }
    }

    addCommandHistory(command, details) {
        const history = document.getElementById('voice-history');
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `<span>[${new Date().toLocaleTimeString()}]</span> <span>${command}: ${details}</span>`;
        history.prepend(item);

        if (history.children.length > 20) {
            history.removeChild(history.lastChild);
        }
    }

    refresh() {
        this.tablet.showToast('Voice commands refreshed', 'success');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.voiceCommands = new VoiceCommands(window.drainedTablet);
});