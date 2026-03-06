// SECURITY SYSTEM - DRAINED TABLET ULTIMATE v7.0.0
// Copyright 2026 Casey Steward (CooseTheGeek)

class SecuritySystem {
    constructor() {
        this.tablet = window.drainedTablet;
        this.currentCode = '';
        this.attempts = 3;
        this.locked = false;
        this.lockTime = null;
        
        this.init();
    }

    init() {
        this.setupNumpad();
        this.setupButtons();
        this.loadCodeDisplay();
    }

    setupNumpad() {
        document.querySelectorAll('.numpad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.locked) {
                    this.tablet.showError('Door is locked. Try again later.');
                    return;
                }
                
                const num = e.target.innerText;
                
                if (num === 'C') {
                    this.clearCode();
                } else if (num === 'E') {
                    this.submitCode();
                } else {
                    this.addDigit(num);
                }
            });
        });
    }

    setupButtons() {
        document.getElementById('unlock-btn')?.addEventListener('click', () => this.submitCode());
        document.getElementById('clear-btn')?.addEventListener('click', () => this.clearCode());
        document.getElementById('forgot-btn')?.addEventListener('click', () => this.forgotCode());
    }

    loadCodeDisplay() {
        this.updateDisplay();
    }

    addDigit(digit) {
        if (this.currentCode.length < 4) {
            this.currentCode += digit;
            this.updateDisplay();
        }
    }

    clearCode() {
        this.currentCode = '';
        this.updateDisplay();
    }

    updateDisplay() {
        const dots = document.querySelectorAll('.dot');
        for (let i = 0; i < dots.length; i++) {
            if (i < this.currentCode.length) {
                dots[i].classList.add('filled');
            } else {
                dots[i].classList.remove('filled');
            }
        }
    }

    async submitCode() {
        if (this.currentCode.length !== 4) {
            this.tablet.showError('Enter 4-digit code');
            return;
        }

        const success = await this.tablet.unlockDoor(this.currentCode);
        
        if (success) {
            this.attempts = 3;
            this.clearCode();
            document.getElementById('attempts').innerText = '3 attempts remaining';
        } else {
            this.attempts--;
            document.getElementById('attempts').innerText = `${this.attempts} attempts remaining`;
            this.clearCode();
            
            if (this.attempts <= 0) {
                this.lockDoor();
            }
        }
    }

    lockDoor() {
        this.locked = true;
        this.lockTime = Date.now();
        
        const doorContent = document.querySelector('.door-container');
        doorContent.innerHTML = `
            <div class="door-header">
                <h1>🔒 LOCKED 🔒</h1>
                <p>Too many failed attempts</p>
            </div>
            <div class="lock-message">
                <p>Locked for 15 minutes</p>
                <p>Contact master: CooseTheGeek</p>
                <button class="door-btn" onclick="location.reload()">RELOAD</button>
            </div>
        `;
        
        this.tablet.logAccess('SYSTEM', 'LOCKED');
        
        // Auto-unlock after 15 minutes
        setTimeout(() => {
            this.locked = false;
            this.attempts = 3;
            location.reload();
        }, 15 * 60 * 1000);
    }

    forgotCode() {
        this.tablet.showConfirm('Contact master CooseTheGeek for code reset?', (confirmed) => {
            if (confirmed) {
                this.tablet.showToast('Master has been notified', 'info');
                this.tablet.logAccess('SYSTEM', 'FORGOT_CODE');
            }
        });
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.securitySystem = new SecuritySystem();
});