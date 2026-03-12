// icons.js – DRAINED TABLET ULTIMATE v7.0.0
// Complete SVG icons for PlayStation, Xbox, and role indicators (axe / lil unk).
// Provides easy insertion via functions.

const Icons = {
    // PlayStation 5 icon
    ps5: `<svg class="platform-icon ps5" viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </svg>`,

    // PlayStation 4 icon (similar but smaller circle or different)
    ps4: `<svg class="platform-icon ps4" viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <rect x="9" y="9" width="6" height="6" fill="currentColor"/>
    </svg>`,

    // Xbox Series X|S icon
    xbox: `<svg class="platform-icon xbox" viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path d="M7 9l5 3 5-3-5-3-5 3zm5 4l-5-3v5l5 3 5-3v-5l-5 3z" fill="currentColor"/>
    </svg>`,

    // Xbox One icon (slightly different)
    xboxone: `<svg class="platform-icon xboxone" viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <rect x="7" y="7" width="10" height="10" fill="currentColor"/>
    </svg>`,

    // Axe (Master/Owner role indicator)
    axe: `<svg class="role-icon axe" viewBox="0 0 24 24" width="24" height="24">
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm0 2.8L18 8v8l-6 3.2L6 16V8l6-3.2zM8 9v6l4 2 4-2V9l-4-2-4 2z" fill="currentColor"/>
    </svg>`,

    // Lil Unk (User role indicator) – simplified red figure
    lilUnk: `<svg class="role-icon lilunk" viewBox="0 0 24 24" width="24" height="24">
        <circle cx="12" cy="8" r="4" fill="currentColor"/>
        <path d="M5 22h14v-2c0-4-3-8-7-8s-7 4-7 8v2z" fill="currentColor"/>
    </svg>`,

    // Helper function to get icon by platform string
    getPlatformIcon(platform) {
        return this[platform] || this.xbox; // fallback
    },

    // Helper to get role icon (returns axe for master/owner, lilUnk for user)
    getRoleIcon(role) {
        return (role === 'master' || role === 'owner') ? this.axe : this.lilUnk;
    }
};

// Expose globally
window.Icons = Icons;