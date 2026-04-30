// animations.js – DRAINED TABLET ULTIMATE v7.0.0
// Smooth animations and micro‑interactions for the dashboard.
// Provides fade, slide, pulse, and loading effects.

class Animations {
    constructor() {
        this.enabled = true;
        this.reducedMotion = false;
        this.init();
    }

    init() {
        const settings = JSON.parse(localStorage.getItem('tdl_dashboard_settings') || '{}');
        this.enabled = settings.animations !== false;
        this.reducedMotion = settings.reducedMotion === true;

        if (this.reducedMotion) {
            document.body.classList.add('reduced-motion');
        }

        this.observeElements();
    }

    observeElements() {
        if (!this.enabled) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
    }

    pageTransition(oldTab, newTab) {
        if (!this.enabled) {
            newTab.classList.add('active');
            return;
        }
        oldTab.style.opacity = '0';
        setTimeout(() => {
            oldTab.classList.remove('active');
            newTab.classList.add('active');
            newTab.style.opacity = '0';
            setTimeout(() => {
                newTab.style.opacity = '1';
            }, 20);
        }, 150);
    }

    showToast(element) {
        if (!this.enabled) {
            element.classList.add('show');
            return;
        }
        element.classList.add('toast-slide-in');
        setTimeout(() => element.classList.remove('toast-slide-in'), 300);
    }

    pulseButton(button) {
        if (!this.enabled) return;
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 300);
    }

    showSpinner(container) {
        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        container.appendChild(spinner);
    }

    hideSpinner(container) {
        const spinner = container.querySelector('.spinner');
        if (spinner) spinner.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.animations = new Animations();
});