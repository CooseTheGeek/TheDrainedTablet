// access-control.js – DRAINED TABLET ULTIMATE v7.0.0 (with temporary master override)

class AccessControl {
    constructor() {
        this.tablet = window.drainedTablet;
        this.auth = window.authSystem;
        this.roleHierarchy = {
            user: 1,
            owner: 2,
            master: 3
        };
        this.init();
    }

    init() {
        console.log('AccessControl initialized');
    }

    // Temporary override for CooseTheGeek
    isMasterUser() {
        return AppState.user && AppState.user.username === 'CooseTheGeek';
    }

    // Check if current user has at least the required role
    hasRole(requiredRole) {
        // Override: if user is CooseTheGeek, always return true for any role
        if (this.isMasterUser()) {
            return true;
        }
        const currentRole = AppState.user.role || 'user';
        return this.roleHierarchy[currentRole] >= this.roleHierarchy[requiredRole];
    }

    // Check if current user is specifically a master
    isMaster() {
        if (this.isMasterUser()) {
            return true;
        }
        return AppState.user.role === 'master';
    }

    isOwner() {
        if (this.isMasterUser()) {
            return true;
        }
        return AppState.user.role === 'owner';
    }

    // Guard function: throw error if insufficient role
    guard(requiredRole) {
        if (!this.hasRole(requiredRole)) {
            throw new Error(`Access denied: ${requiredRole} role required`);
        }
    }

    // Decorate a function with role check
    protect(fn, requiredRole) {
        return (...args) => {
            if (!this.hasRole(requiredRole)) {
                console.warn(`Access denied to function ${fn.name || 'anonymous'}`);
                return null;
            }
            return fn(...args);
        };
    }

    // Hide/show UI elements based on role
    applyUIPermissions() {
        // This can be called after login to hide elements the user shouldn't see.
        if (!this.hasRole('master')) {
            document.querySelectorAll('.master-only').forEach(el => el.style.display = 'none');
        }
        if (!this.hasRole('owner')) {
            document.querySelectorAll('.owner-only').forEach(el => el.style.display = 'none');
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.accessControl = new AccessControl();
});