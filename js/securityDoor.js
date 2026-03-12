// securityDoor.js – DRAINED TABLET ULTIMATE v7.0.0
// Legacy security door – now delegates to Security class.
// This file ensures backward compatibility with older code expecting a SecurityDoor class.

class SecurityDoor {
    constructor() {
        this.delegate = window.security;
        this.tablet = window.drainedTablet;
        if (!this.delegate) {
            console.warn('Security not found – door may not function correctly.');
        }
    }

    // Delegate methods
    submitCode(code) {
        if (this.delegate) {
            this.delegate.currentCode = code;
            this.delegate.submitCode();
        }
    }

    clearCode() {
        if (this.delegate) this.delegate.clearCode();
    }

    addDigit(digit) {
        if (this.delegate) this.delegate.addDigit(digit);
    }

    lockDoor() {
        if (this.delegate) this.delegate.lockDoor();
    }

    forgotCode() {
        if (this.delegate) this.delegate.forgotCode();
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.securityDoor = new SecurityDoor();
});