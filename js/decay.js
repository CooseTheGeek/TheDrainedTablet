// DECAY SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek). All Rights Reserved.

class DecaySystem {
    constructor(tablet) {
        this.tablet = tablet;
        this.presets = {
            vanilla: {
                upkeep: true,
                scale: 1.0,
                tick: 600,
                bracket0: 15,
                bracket0cost: 0.1,
                bracket1: 50,
                bracket1cost: 0.15,
                bracket2: 125,
                bracket2cost: 0.2,
                bracket3: 200,
                bracket3cost: 0.333,
                delayTwig: 0,
                delayWood: 0,
                delayStone: 0,
                delayMetal: 0,
                delayToptier: 0,
                durationTwig: 1,
                durationWood: 3,
                durationStone: 5,
                durationMetal: 8,
                durationToptier: 12
            },
            doubled: {
                upkeep: true,
                scale: 2.0,
                tick: 300,
                bracket0: 20,
                bracket0cost: 0.2,
                bracket1: 75,
                bracket1cost: 0.25,
                bracket2: 150,
                bracket2cost: 0.3,
                bracket3: 250,
                bracket3cost: 0.4,
                delayTwig: 1,
                delayWood: 2,
                delayStone: 4,
                delayMetal: 6,
                delayToptier: 8,
                durationTwig: 2,
                durationWood: 4,
                durationStone: 6,
                durationMetal: 10,
                durationToptier: 14
            },
            softcore: {
                upkeep: true,
                scale: 0.5,
                tick: 1200,
                bracket0: 10,
                bracket0cost: 0.05,
                bracket1: 30,
                bracket1cost: 0.08,
                bracket2: 80,
                bracket2cost: 0.1,
                bracket3: 150,
                bracket3cost: 0.15,
                delayTwig: 2,
                delayWood: 4,
                delayStone: 8,
                delayMetal: 12,
                delayToptier: 24,
                durationTwig: 4,
                durationWood: 8,
                durationStone: 12,
                durationMetal: 18,
                durationToptier: 24
            }
        };
        this.settings = this.loadSettings();
        this.init();
    }

    loadSettings() {
        const saved = localStorage.getItem('drained_decay_settings');
        
        // Create a local fallback object in case this.presets is not ready
        const fallback = {
            vanilla: {
                upkeep: true,
                scale: 1.0,
                tick: 600,
                bracket0: 15,
                bracket0cost: 0.1,
                bracket1: 50,
                bracket1cost: 0.15,
                bracket2: 125,
                bracket2cost: 0.2,
                bracket3: 200,
                bracket3cost: 0.333,
                delayTwig: 0,
                delayWood: 0,
                delayStone: 0,
                delayMetal: 0,
                delayToptier: 0,
                durationTwig: 1,
                durationWood: 3,
                durationStone: 5,
                durationMetal: 8,
                durationToptier: 12
            }
        };
        
        // If presets exists, use it; otherwise use the fallback
        const presets = this.presets || fallback;
        
        return saved ? JSON.parse(saved) : presets.vanilla;
    }

    saveSettings() {
        localStorage.setItem('drained_decay_settings', JSON.stringify(this.settings));
    }

    init() {
        this.createDecayHTML();
        this.setupEventListeners();
        
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'settings') {
                // When settings tab opens, we could refresh, but decay is within settings
                // For now, we'll just rely on its own refresh if needed
            }
        });
    }

    createDecayHTML() {
        const settingsTab = document.getElementById('tab-settings');
        if (!settingsTab) return;

        // We'll create a subsection for decay within the settings page
        // For now, we'll assume the settings page has a container for decay
        // In a full implementation, we'd generate a card for decay
        // This is a placeholder – actual HTML will be generated when settings tab is built
        // For now, we'll just ensure the methods exist.
    }

    setupEventListeners() {
        // Event listeners for decay controls will be set when the HTML is generated
    }

    loadPreset(presetName) {
        this.settings = this.presets[presetName];
        this.applySettings();
        this.tablet.showToast(`Loaded ${presetName} decay preset`, 'success');
    }

    applySettings() {
        // Send RCON commands to apply settings
        if (!this.tablet.connected) {
            this.tablet.showError('Not connected to server');
            return;
        }

        this.tablet.sendCommand(`decay.scale ${this.settings.scale}`).then(() => {
            this.tablet.sendCommand(`decay.tick ${this.settings.tick}`).then(() => {
                // Additional commands for brackets, delays, durations
                this.tablet.sendCommand(`decay.bracket_0_blockcount ${this.settings.bracket0}`);
                this.tablet.sendCommand(`decay.bracket_0_costfraction ${this.settings.bracket0cost}`);
                this.tablet.sendCommand(`decay.bracket_1_blockcount ${this.settings.bracket1}`);
                this.tablet.sendCommand(`decay.bracket_1_costfraction ${this.settings.bracket1cost}`);
                this.tablet.sendCommand(`decay.bracket_2_blockcount ${this.settings.bracket2}`);
                this.tablet.sendCommand(`decay.bracket_2_costfraction ${this.settings.bracket2cost}`);
                this.tablet.sendCommand(`decay.bracket_3_blockcount ${this.settings.bracket3}`);
                this.tablet.sendCommand(`decay.bracket_3_costfraction ${this.settings.bracket3cost}`);
                this.tablet.sendCommand(`decay.delay_twig ${this.settings.delayTwig}`);
                this.tablet.sendCommand(`decay.delay_wood ${this.settings.delayWood}`);
                this.tablet.sendCommand(`decay.delay_stone ${this.settings.delayStone}`);
                this.tablet.sendCommand(`decay.delay_metal ${this.settings.delayMetal}`);
                this.tablet.sendCommand(`decay.delay_toptier ${this.settings.delayToptier}`);
                this.tablet.sendCommand(`decay.duration_twig ${this.settings.durationTwig}`);
                this.tablet.sendCommand(`decay.duration_wood ${this.settings.durationWood}`);
                this.tablet.sendCommand(`decay.duration_stone ${this.settings.durationStone}`);
                this.tablet.sendCommand(`decay.duration_metal ${this.settings.durationMetal}`);
                this.tablet.sendCommand(`decay.duration_toptier ${this.settings.durationToptier}`);
                this.tablet.showToast('Decay settings applied', 'success');
            }).catch(() => {
                this.tablet.showError('Failed to apply decay settings');
            });
        }).catch(() => {
            this.tablet.showError('Failed to apply decay settings');
        });
    }

    resetToVanilla() {
        this.settings = this.presets.vanilla;
        this.applySettings();
    }

    testSettings() {
        // Simulate decay calculation for a test base
        const testBase = {
            blocks: 100,
            grade: 'stone',
            protected: true
        };
        const decayAmount = testBase.blocks * this.settings.scale * 0.01;
        this.tablet.showToast(`Test decay: ${decayAmount.toFixed(2)} damage per tick`, 'info');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.decaySystem = new DecaySystem(window.drainedTablet);
});
