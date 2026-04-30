// command-queue.js – DRAINED TABLET ULTIMATE v7.0.0
// Manages a queue of RCON commands to prevent flooding and ensure sequential execution.
// Supports priorities, retries, and timeouts.

class CommandQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.maxConcurrent = 1;
        this.retryLimit = 3;
        this.retryDelay = 1000;
        this.timeout = 10000;
        this.stats = {
            total: 0,
            succeeded: 0,
            failed: 0,
            retried: 0
        };
        this.listeners = [];
    }

    add(command, options = {}) {
        const id = this.generateId();
        const item = {
            id,
            command,
            priority: options.priority || 0,
            retries: options.retries || 0,
            maxRetries: options.maxRetries || this.retryLimit,
            timeout: options.timeout || this.timeout,
            resolve: null,
            reject: null,
            promise: null,
            added: Date.now()
        };
        item.promise = new Promise((res, rej) => {
            item.resolve = res;
            item.reject = rej;
        });
        this.queue.push(item);
        this.sortQueue();
        this.stats.total++;
        this.notify();
        this.processNext();
        return item.promise;
    }

    generateId() {
        return 'cmd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    sortQueue() {
        this.queue.sort((a, b) => b.priority - a.priority);
    }

    async processNext() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;
        const item = this.queue.shift();
        try {
            const result = await this.executeWithTimeout(item);
            item.resolve(result);
            this.stats.succeeded++;
            this.notify();
        } catch (err) {
            if (item.retries < item.maxRetries) {
                item.retries++;
                this.stats.retried++;
                this.queue.unshift(item);
                this.notify();
                setTimeout(() => this.processNext(), this.retryDelay);
                this.processing = false;
                return;
            } else {
                item.reject(err);
                this.stats.failed++;
                this.notify();
            }
        }
        this.processing = false;
        this.processNext();
    }

    executeWithTimeout(item) {
        return Promise.race([
            this.executeCommand(item.command),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Command timeout')), item.timeout)
            )
        ]);
    }

    async executeCommand(command) {
        return await ConnectionManager.executeCommand(command);
    }

    clear() {
        this.queue.forEach(item => item.reject(new Error('Queue cleared')));
        this.queue = [];
        this.processing = false;
        this.notify();
    }

    length() {
        return this.queue.length;
    }

    getStats() {
        return { ...this.stats, pending: this.queue.length };
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        this.listeners.forEach(fn => fn(this.getStats()));
    }
}

window.commandQueue = new CommandQueue();

window.debugQueue = () => console.log(window.commandQueue.getStats());