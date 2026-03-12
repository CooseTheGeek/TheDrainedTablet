// server-commands.js – DRAINED TABLET ULTIMATE v7.0.0
// Wrapper for all native Rust Console RCON commands.
// Provides a clean interface for executing commands with validation.

class ServerCommands {
    constructor() {
        this.tablet = window.drainedTablet;
        this.access = window.accessControl;
    }

    // Generic command execution with optional permission check
    async execute(command, requiredRole = 'user') {
        if (!this.access.hasRole(requiredRole)) {
            throw new Error(`Permission denied: ${requiredRole} role required`);
        }
        return await ConnectionManager.executeCommand(command);
    }

    // ==================== PLAYER MANAGEMENT ====================
    async kick(player, reason = '') {
        return this.execute(`kick "${player}" ${reason ? `"${reason}"` : ''}`, 'master');
    }

    async ban(player, reason = '') {
        return this.execute(`ban "${player}" ${reason ? `"${reason}"` : ''}`, 'master');
    }

    async banId(steamId, name, reason = '') {
        return this.execute(`banid ${steamId} "${name}" ${reason ? `"${reason}"` : ''}`, 'owner');
    }

    async unban(playerOrId) {
        return this.execute(`unban "${playerOrId}"`, 'master');
    }

    async mute(player, minutes = 30) {
        return this.execute(`mute "${player}" ${minutes}`, 'master');
    }

    async unmute(player) {
        return this.execute(`unmute "${player}"`, 'master');
    }

    async muteVoice(player) {
        return this.execute(`mutevoice "${player}"`, 'master');
    }

    async unmuteVoice(player) {
        return this.execute(`unmutevoice "${player}"`, 'master');
    }

    async freeze(player) {
        return this.execute(`freeze "${player}"`, 'master');
    }

    async unfreeze(player) {
        return this.execute(`unfreeze "${player}"`, 'master');
    }

    async kill(player) {
        return this.execute(`kill "${player}"`, 'master');
    }

    async warn(player, reason) {
        return this.execute(`warn "${player}" "${reason}"`, 'master');
    }

    async notes(player) {
        return this.execute(`notes "${player}"`, 'master');
    }

    async addNote(player, note) {
        return this.execute(`addnote "${player}" "${note}"`, 'master');
    }

    // ==================== TELEPORTATION ====================
    async teleport(player) {
        return this.execute(`teleport "${player}"`, 'master');
    }

    async teleport2me(player) {
        return this.execute(`teleport2me "${player}"`, 'master');
    }

    async teleportPos(x, y, z) {
        return this.execute(`teleportpos ${x} ${y} ${z}`, 'master');
    }

    async teleportToPlayer(source, target) {
        return this.execute(`teleport.toplayer "${source}" "${target}"`, 'master');
    }

    async teleport2marker() {
        return this.execute(`teleport2marker`, 'master');
    }

    async teleport2grid(grid) {
        return this.execute(`teleport2grid ${grid}`, 'master');
    }

    async teleport2death() {
        return this.execute(`teleport2death`, 'master');
    }

    async teleport2mission() {
        return this.execute(`teleport2mission`, 'master');
    }

    async teleport2owneditem(player, item) {
        return this.execute(`teleport2owneditem "${player}" ${item}`, 'master');
    }

    async teleportany(entity) {
        return this.execute(`teleportany ${entity}`, 'master');
    }

    async teleportlos() {
        return this.execute(`teleportlos`, 'master');
    }

    async teleportteam2me() {
        return this.execute(`teleportteam2me`, 'master');
    }

    async teleporteveryone2me() {
        return this.execute(`teleporteveryone2me`, 'owner');
    }

    async teleportnonsleepers2me() {
        return this.execute(`teleportnonsleepers2me`, 'owner');
    }

    async home() {
        return this.execute(`home`, 'user');
    }

    // ==================== ITEMS & ENTITIES ====================
    async give(item, amount = 1) {
        return this.execute(`give "${item}" ${amount}`, 'master');
    }

    async giveTo(player, item, amount = 1) {
        return this.execute(`giveto "${player}" "${item}" ${amount}`, 'master');
    }

    async giveAll(item, amount = 1) {
        return this.execute(`inv.giveall "${item}" ${amount}`, 'owner');
    }

    async spawn(entity, x, y, z) {
        return this.execute(`spawn "${entity}" ${x} ${y} ${z}`, 'master');
    }

    async takeItem(player, slotType, slot, amount = 1) {
        return this.execute(`inventory.takeplayer "${player}" ${slotType} ${slot} ${amount}`, 'master');
    }

    async clearInventory(player) {
        return this.execute(`inventory.clearplayer "${player}"`, 'master');
    }

    // ==================== VEHICLES ====================
    async spawnHotAirBalloon(x, y, z) {
        return this.spawn('hotairballoon', x, y+1, z+6);
    }

    async spawnMinicopter(x, y, z) {
        return this.spawn('minicopter.entity', x, y+1, z+4);
    }

    async spawnScrapHeli(x, y, z) {
        return this.spawn('scraptransporthelicopter', x, y+1, z+6);
    }

    async spawnAttackHeli(x, y, z) {
        return this.spawn('attackhelicopter.entity', x, y+1, z+8);
    }

    async spawn2ModuleCar(x, y, z) {
        return this.spawn('2module_car_spawned.entity', x, y+1, z+3);
    }

    async spawn3ModuleCar(x, y, z) {
        return this.spawn('3module_car_spawned.entity', x, y+1, z+4);
    }

    async spawn4ModuleCar(x, y, z) {
        return this.spawn('4module_car_spawned.entity', x, y+1, z+5);
    }

    async spawnPedalBike(x, y, z) {
        return this.spawn('pedalbike', x, y+1, z+2);
    }

    async spawnPedalTrike(x, y, z) {
        return this.spawn('pedaltrike', x, y+1, z+2);
    }

    async spawnMotorbike(x, y, z) {
        return this.spawn('motorbike', x, y+1, z+2);
    }

    async spawnMotorbikeSidecar(x, y, z) {
        return this.spawn('motorbike_sidecar', x, y+1, z+2);
    }

    async spawnRowboat(x, y, z) {
        return this.spawn('rowboat', x, y+2, z+4);
    }

    async spawnRHIB(x, y, z) {
        return this.spawn('rhib', x, y+2, z+6);
    }

    async spawnHorse(x, y, z) {
        return this.spawn('testridablehorse', x, y, z+2);
    }

    // ==================== SERVER CONFIG ====================
    async setHostname(name) {
        return this.execute(`server.hostname "${name}"`, 'owner');
    }

    async setDescription(desc) {
        return this.execute(`server.description "${desc}"`, 'owner');
    }

    async setMaxPlayers(count) {
        return this.execute(`server.maxplayers ${count}`, 'owner');
    }

    async setWorldSize(size) {
        return this.execute(`server.worldsize ${size}`, 'owner');
    }

    async setSeed(seed) {
        return this.execute(`server.seed ${seed}`, 'owner');
    }

    async setPvE(enabled) {
        return this.execute(`server.pve ${enabled}`, 'owner');
    }

    async setStability(enabled) {
        return this.execute(`server.stability ${enabled}`, 'owner');
    }

    async setCrafting(enabled) {
        return this.execute(`server.crafting ${enabled}`, 'owner');
    }

    async setRadiation(enabled) {
        return this.execute(`server.radiation ${enabled}`, 'owner');
    }

    async setTickrate(rate) {
        return this.execute(`server.tickrate ${rate}`, 'owner');
    }

    async setFPS(limit) {
        return this.execute(`server.fps ${limit}`, 'owner');
    }

    async save() {
        return this.execute(`server.save`, 'owner');
    }

    async restart() {
        return this.execute(`global.restart`, 'owner');
    }

    // ==================== ENVIRONMENT ====================
    async setTime(hour) {
        return this.execute(`env.time ${hour}`, 'owner');
    }

    async setDayLength(minutes) {
        return this.execute(`env.daylength ${minutes}`, 'owner');
    }

    async setNightLength(minutes) {
        return this.execute(`env.nightlength ${minutes}`, 'owner');
    }

    async setWeather(clouds, rain, wind, fog) {
        await this.execute(`weather.clouds ${clouds}`, 'owner');
        await this.execute(`weather.rain ${rain}`, 'owner');
        await this.execute(`weather.wind ${wind}`, 'owner');
        await this.execute(`env.fog ${fog}`, 'owner');
    }

    // ==================== ZONES ====================
    async createZone(name, x, y, z, radius, shape = 'sphere', flags = {}) {
        // This would be a multi‑command process; simplified.
        return this.execute(`zones.createcustomzone "${name}" (${x},${y},${z}) 360 ${shape} ${radius} 0 0 0 0 1`, 'owner');
    }

    async deleteZone(name) {
        return this.execute(`zones.deletecustomzone "${name}"`, 'owner');
    }

    async editZone(name, setting, value) {
        return this.execute(`zones.editcustomzone "${name}" "${setting}" "${value}"`, 'owner');
    }

    async listZones() {
        return this.execute(`zones.listcustomzones`, 'owner');
    }

    // ==================== EVENTS ====================
    async triggerAirdrop() {
        return this.execute(`airdrop.drop`, 'master');
    }

    async triggerHeli() {
        return this.execute(`heli.call`, 'master');
    }

    async triggerCargo() {
        return this.execute(`cargo.call`, 'master');
    }

    async triggerBradley() {
        return this.execute(`bradley.call`, 'master');
    }

    async setEventCooldown(event, multiplier) {
        return this.execute(`events.cooldowntimemultiplier ${event} ${multiplier}`, 'owner');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.serverCommands = new ServerCommands();
});