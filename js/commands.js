// commands.js – DRAINED TABLET ULTIMATE v7.0.0
// Searchable command list with categories and execute buttons.

class Commands {
    constructor() {
        this.access = window.accessControl;
        this.cmd = window.serverCommands;
        this.commands = this.loadCommands();
        this.filtered = this.commands;
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.favorites = this.loadFavorites();
        this.history = this.loadHistory();
        this.init();
    }

    loadCommands() {
        // This should be populated with all available commands.
        // For now, we'll use a subset. You can expand this.
        return [
            // Attack
            { category: 'attack', name: 'attackentity.npc_aimconescale', desc: 'Scale AI aim cone', syntax: 'attackentity.npc_aimconescale [value]' },
            { category: 'attack', name: 'attackentity.npc_attackcooldownscale', desc: 'Scale AI attack cooldown', syntax: 'attackentity.npc_attackcooldownscale [value]' },
            { category: 'attack', name: 'attackentity.npc_attacklengthscale', desc: 'Scale AI attack length', syntax: 'attackentity.npc_attacklengthscale [value]' },
            { category: 'attack', name: 'attackentity.npc_attackspacingscale', desc: 'Scale AI attack spacing', syntax: 'attackentity.npc_attackspacingscale [value]' },
            { category: 'attack', name: 'attackentity.npc_damagescale', desc: 'Scale AI damage', syntax: 'attackentity.npc_damagescale [value]' },
            { category: 'attack', name: 'attackentity.print_al_stats', desc: 'Print AI stats', syntax: 'attackentity.print_al_stats' },
            { category: 'attack', name: 'attackentity.set_easy_ai', desc: 'Set AI to easy', syntax: 'attackentity.set_easy_ai' },
            { category: 'attack', name: 'attackentity.set_normal_ai', desc: 'Set AI to normal', syntax: 'attackentity.set_normal_ai' },

            // Base
            { category: 'base', name: 'basefishingrod.showui', desc: 'Show fishing UI', syntax: 'basefishingrod.showui' },
            { category: 'base', name: 'basemission.missionsenabled', desc: 'Enable missions', syntax: 'basemission.missionsenabled [true/false]' },
            { category: 'base', name: 'basemission.missionsfailondisconnect', desc: 'Fail missions on disconnect', syntax: 'basemission.missionsfailondisconnect [true/false]' },
            { category: 'base', name: 'baseprojectile.fullstartingmagazine', desc: 'Start with full magazine', syntax: 'baseprojectile.fullstartingmagazine [true/false]' },
            { category: 'base', name: 'baseridableanimal.decayminutes', desc: 'Horse decay time', syntax: 'baseridableanimal.decayminutes [minutes]' },
            { category: 'base', name: 'baseridableanimal.dungtimescale', desc: 'Dung production rate', syntax: 'baseridableanimal.dungtimescale [scale]' },

            // Banitem commands
            { category: 'admin', name: 'banitem', desc: 'Ban an item', syntax: 'banitem "shortname" all' },
            { category: 'admin', name: 'unbanitem', desc: 'Unban an item', syntax: 'unbanitem "shortname"' },
            { category: 'admin', name: 'banitem NoCrafting', desc: 'Disable crafting', syntax: 'banitem "shortname" NoCrafting' },
            { category: 'admin', name: 'banitem TechTreeBypass', desc: 'Bypass tech tree', syntax: 'banitem "shortname" TechTreeBypass' },
            { category: 'admin', name: 'banitem TechTreeBlockpath', desc: 'Block tech tree path', syntax: 'banitem "shortname" TechTreeBlockpath' },
            { category: 'admin', name: 'banitem NoTechTree', desc: 'Remove from tech tree', syntax: 'banitem "shortname" NoTechTree' },
            { category: 'admin', name: 'banitem ResearchTableBlocked', desc: 'Block research table', syntax: 'banitem "shortname" ResearchTableBlocked' },
            { category: 'admin', name: 'banitem NoResearch', desc: 'Disable research', syntax: 'banitem "shortname" NoResearch' },
            { category: 'admin', name: 'banitem NoItemSpawn', desc: 'Prevent item spawn', syntax: 'banitem "shortname" NoItemSpawn' },
            { category: 'admin', name: 'banitem NoBlueprintSpawn', desc: 'Prevent blueprint spawn', syntax: 'banitem "shortname" NoBlueprintSpawn' },
            { category: 'admin', name: 'banitem NoSpawn', desc: 'Prevent both', syntax: 'banitem "shortname" NoSpawn' },

            // Spawn commands
            { category: 'spawn', name: 'spawn vendingmachine.deployed', desc: 'Spawn vending machine', syntax: 'spawn vendingmachine.deployed x y z' },
            { category: 'spawn', name: 'spawn recycler', desc: 'Spawn recycler', syntax: 'spawn recycler x y z' },
            { category: 'spawn', name: 'spawn keycard_blue', desc: 'Spawn blue keycard', syntax: 'spawn keycard_blue_pickup x y z' },
            { category: 'spawn', name: 'spawn keycard_green', desc: 'Spawn green keycard', syntax: 'spawn keycard_green_pickup x y z' },
            { category: 'spawn', name: 'spawn keycard_red', desc: 'Spawn red keycard', syntax: 'spawn keycard_red_pickup x y z' },
            { category: 'spawn', name: 'spawn crate_ammunition', desc: 'Spawn ammo crate', syntax: 'spawn crate_ammunition x y z' },
            { category: 'spawn', name: 'spawn crate_medical', desc: 'Spawn medical crate', syntax: 'spawn crate_medical x y z' },
            { category: 'spawn', name: 'spawn heli_crate', desc: 'Spawn heli crate', syntax: 'spawn heli_crate x y z' },
            { category: 'spawn', name: 'spawn bradley_crate', desc: 'Spawn Bradley crate', syntax: 'spawn bradley_crate x y z' },
            { category: 'spawn', name: 'spawn codelock', desc: 'Spawn locked crate', syntax: 'spawn codelock x y z' },
            { category: 'spawn', name: 'spawn crate_elite', desc: 'Spawn elite crate', syntax: 'spawn crate_elite x y z' },
            { category: 'spawn', name: 'spawn supply_drop', desc: 'Spawn supply drop', syntax: 'spawn supply_drop x y z' },
            { category: 'spawn', name: 'spawn crate_normal', desc: 'Spawn military crate', syntax: 'spawn crate_normal x y z' },
            { category: 'spawn', name: 'spawn crate_normal_2', desc: 'Spawn regular crate', syntax: 'spawn crate_normal_2 x y z' },
            { category: 'spawn', name: 'spawn crate_tools', desc: 'Spawn tool box', syntax: 'spawn crate_tools x y z' },
            { category: 'spawn', name: 'spawn woodbox_deployed', desc: 'Spawn wooden box', syntax: 'spawn woodbox_deployed x y z' },
            { category: 'spawn', name: 'spawn loot_barrel_1', desc: 'Spawn blue barrel', syntax: 'spawn loot_barrel_1 x y z' },
            { category: 'spawn', name: 'spawn loot_barrel_2', desc: 'Spawn white barrel', syntax: 'spawn loot_barrel_2 x y z' },
            { category: 'spawn', name: 'spawn metal-ore', desc: 'Spawn metal node', syntax: 'spawn metal-ore x y z' },
            { category: 'spawn', name: 'spawn stone-ore', desc: 'Spawn stone node', syntax: 'spawn stone-ore x y z' },
            { category: 'spawn', name: 'spawn sulfur-ore', desc: 'Spawn sulfur node', syntax: 'spawn sulfur-ore x y z' },
            { category: 'spawn', name: 'spawn scraptransportheli', desc: 'Spawn scrap heli', syntax: 'spawn scraptransportheli x y z' },
            { category: 'spawn', name: 'spawn minicopter', desc: 'Spawn minicopter', syntax: 'spawn minicopter x y z' },
            { category: 'spawn', name: 'spawn attackhelicopter', desc: 'Spawn attack heli', syntax: 'spawn attackhelicopter x y z' },
            { category: 'spawn', name: 'spawn pedalbike', desc: 'Spawn bicycle', syntax: 'spawn pedalbike x y z' },
            { category: 'spawn', name: 'spawn pedaltrike', desc: 'Spawn tricycle', syntax: 'spawn pedaltrike x y z' },
            { category: 'spawn', name: 'spawn motorbike', desc: 'Spawn motorbike', syntax: 'spawn motorbike x y z' },
            { category: 'spawn', name: 'spawn motorbike_sidecar', desc: 'Spawn motorbike w/ sidecar', syntax: 'spawn motorbike_sidecar x y z' },
            { category: 'spawn', name: 'spawn 2module_car', desc: 'Spawn 2-module car', syntax: 'spawn 2module_car x y z' },
            { category: 'spawn', name: 'spawn 3module_car', desc: 'Spawn 3-module car', syntax: 'spawn 3module_car x y z' },
            { category: 'spawn', name: 'spawn 4module_car', desc: 'Spawn 4-module car', syntax: 'spawn 4module_car x y z' },
            { category: 'spawn', name: 'entity.spawnitem', desc: 'Spawn dropped item', syntax: 'entity.spawnitem "shortname" x y z' },

            // Modifier commands
            { category: 'modifiers', name: 'modifiers.listallmodifiers', desc: 'List all modifiers', syntax: 'modifiers.listallmodifiers' },
            { category: 'modifiers', name: 'modifiers.listmodifiers', desc: 'List modifiers for item', syntax: 'modifiers.listmodifiers "shortname"' },
            { category: 'modifiers', name: 'modifiers.clearmodifiers all', desc: 'Clear all modifiers', syntax: 'modifiers.clearmodifiers all' },
            { category: 'modifiers', name: 'modifiers.clearmodifier', desc: 'Clear a modifier', syntax: 'modifiers.clearmodifier "shortname" [modifier]' },
            { category: 'modifiers', name: 'modifiers.setmodifier collection', desc: 'Set collection scale', syntax: 'modifiers.setmodifier "shortname" collection [scale]' },
            { category: 'modifiers', name: 'modifiers.setmodifier gather', desc: 'Set gather scale', syntax: 'modifiers.setmodifier "shortname" gather [scale]' },
            { category: 'modifiers', name: 'modifiers.setmodifier tool', desc: 'Set tool scale', syntax: 'modifiers.setmodifier "shortname" tool [scale]' },
            { category: 'modifiers', name: 'modifiers.setmodifier loot', desc: 'Set loot scale', syntax: 'modifiers.setmodifier "shortname" loot [scale]' },
            { category: 'modifiers', name: 'modifiers.setmodifier cookspeed', desc: 'Set cook speed', syntax: 'modifiers.setmodifier "shortname" cookspeed [scale]' },
            { category: 'modifiers', name: 'modifiers.setmodifier cookamount', desc: 'Set cook amount', syntax: 'modifiers.setmodifier "shortname" cookamount [scale]' },
            { category: 'modifiers', name: 'modifiers.setmodifier workbenchlevel', desc: 'Set workbench level', syntax: 'modifiers.setmodifier "ItemName" workbenchlevel [value]' },
            { category: 'modifiers', name: 'modifiers.setmodifier crafttime', desc: 'Set craft time', syntax: 'modifiers.setmodifier "ItemName" crafttime [seconds]' },
            { category: 'modifiers', name: 'craft.furnaceusagemultiplier', desc: 'Furnace fuel usage', syntax: 'craft.furnaceusagemultiplier [scale]' },
            { category: 'modifiers', name: 'craft.furnaceoutputmultiplier', desc: 'Furnace output', syntax: 'craft.furnaceoutputmultiplier [scale]' },
            { category: 'modifiers', name: 'craft.itemcookspeedmultiplier', desc: 'Cook speed', syntax: 'craft.itemcookspeedmultiplier [scale]' },
            { category: 'modifiers', name: 'modifiers.charcoalratescale', desc: 'Charcoal rate', syntax: 'modifiers.charcoalratescale [scale]' },
            { category: 'modifiers', name: 'modifiers.quarryprocessratescale', desc: 'Quarry speed', syntax: 'modifiers.quarryprocessratescale [scale]' },
            { category: 'modifiers', name: 'modifiers.crudeoiloutputscale', desc: 'Crude oil output', syntax: 'modifiers.crudeoiloutputscale [scale]' },
            { category: 'modifiers', name: 'modifiers.lowgradeoutputscale', desc: 'Low grade output', syntax: 'modifiers.lowgradeoutputscale [scale]' },

            // Kit commands
            { category: 'kits', name: 'kit list', desc: 'List kits', syntax: 'kit list' },
            { category: 'kits', name: 'kit add', desc: 'Add item to kit', syntax: 'kit add "kitname" "shortname" amount condition container' },
            { category: 'kits', name: 'kit remove', desc: 'Remove item from kit', syntax: 'kit remove "kitname" id' },
            { category: 'kits', name: 'kit info', desc: 'Kit info', syntax: 'kit info "kitname"' },
            { category: 'kits', name: 'kit edit changename', desc: 'Rename kit', syntax: 'kit edit "kitname" changename "newname"' },
            { category: 'kits', name: 'kit delete', desc: 'Delete kit', syntax: 'kit delete "kitname"' },
            { category: 'kits', name: 'kit edit addgroup', desc: 'Add group', syntax: 'kit edit "kitname" addgroup "group"' },
            { category: 'kits', name: 'kit givetogroup', desc: 'Give to group', syntax: 'kit givetogroup "kitname" "group"' },
            { category: 'kits', name: 'kit givetoplayer', desc: 'Give to player', syntax: 'kit givetoplayer "kitname" "playerid"' },
            { category: 'kits', name: 'kit giveall', desc: 'Give to all', syntax: 'kit giveall "kitname"' },
            { category: 'kits', name: 'kit edit removegroup', desc: 'Remove group', syntax: 'kit edit "kitname" removegroup "group"' },

            // Player commands
            { category: 'player', name: 'vipid', desc: 'Grant VIP', syntax: 'vipid "playerid"' },
            { category: 'player', name: 'removevip', desc: 'Remove VIP', syntax: 'removevip "playerid"' },
            { category: 'player', name: 'moderatorid', desc: 'Grant moderator', syntax: 'moderatorid "playerid"' },
            { category: 'player', name: 'removemoderator', desc: 'Remove moderator', syntax: 'removemoderator "playerid"' },
            { category: 'player', name: 'adminid', desc: 'Grant admin', syntax: 'adminid "playerid"' },
            { category: 'player', name: 'removeadmin', desc: 'Remove admin', syntax: 'removeadmin "playerid"' },
            { category: 'player', name: 'getauthlevel', desc: 'Get auth level', syntax: 'getauthlevel "playerid"' },
            { category: 'player', name: 'getauthlevels', desc: 'List auth levels', syntax: 'getauthlevels' },
            { category: 'player', name: 'banid', desc: 'Ban player', syntax: 'banid "playerid" ["reason"] [seconds]' },
            { category: 'player', name: 'banlist', desc: 'List bans', syntax: 'banlist' },
            { category: 'player', name: 'unban', desc: 'Unban', syntax: 'unban "playerid"' },
            { category: 'player', name: 'kickall', desc: 'Kick all', syntax: 'kickall' },
            { category: 'player', name: 'killallplayer', desc: 'Kill all', syntax: 'killallplayer' },
            { category: 'player', name: 'teleport', desc: 'Teleport player', syntax: 'teleport "playerid" x y z' },
            { category: 'player', name: 'teaminfo', desc: 'Team info', syntax: 'teaminfo "#"' },
            { category: 'player', name: 'sleep', desc: 'Sleep player', syntax: 'sleep "playerid"' },
            { category: 'player', name: 'relationshipmanager.findplayerteam', desc: 'Find player team', syntax: 'relationshipmanager.findplayerteam "playerid"' },
            { category: 'player', name: 'relationshipmanager.sleeptoggleother', desc: 'Toggle sleep', syntax: 'relationshipmanager.sleeptoggleother "playerid"' },
            { category: 'player', name: 'teleport2me', desc: 'Teleport to you', syntax: 'teleport2me "playerid"' },
            { category: 'player', name: 'teleportgrid', desc: 'Teleport grid', syntax: 'teleportgrid position spacing rotation maxperrow' },
            { category: 'player', name: 'teleportpos', desc: 'Teleport to pos', syntax: 'teleportpos x y z "playerid" placeonground' },

            // Events
            { category: 'events', name: 'cargoshipdynamic.cargoship_speed_scale', desc: 'Cargo speed', syntax: 'cargoshipdynamic.cargoship_speed_scale [value]' },
            { category: 'events', name: 'cargoships.egress_duration_minutes', desc: 'Egress duration', syntax: 'cargoships.egress_duration_minutes [minutes]' },
            { category: 'events', name: 'cargoships.event_duration_minutes', desc: 'Event duration', syntax: 'cargoships.event_duration_minutes [minutes]' },
            { category: 'events', name: 'cargoships.event_enabled', desc: 'Enable cargo', syntax: 'cargoships.event_enabled 0/1' },
            { category: 'events', name: 'cargoships.loot_round_spacing_minutes', desc: 'Loot round spacing', syntax: 'cargoships.loot_round_spacing_minutes [minutes]' },
            { category: 'events', name: 'cargoships.loot_rounds', desc: 'Loot rounds', syntax: 'cargoships.loot_rounds [number]' },
            { category: 'events', name: 'cargoships.scientist_onboard_check', desc: 'Scientists on cargo', syntax: 'cargoships.scientist_onboard_check 0/1' },
            { category: 'events', name: 'cargoships.startegressing', desc: 'Force egress', syntax: 'cargoships.startegressing' },
            { category: 'events', name: 'events.triggerevent', desc: 'Trigger event', syntax: 'events.triggerevent "event"' },
            { category: 'events', name: 'events.stopevent', desc: 'Stop event', syntax: 'events.stopevent "event"' },
            { category: 'events', name: 'bradley.enabled', desc: 'Enable Bradley', syntax: 'bradley.enabled 0/1' },
            { category: 'events', name: 'bradley.quickrespawn', desc: 'Quick respawn', syntax: 'bradley.quickrespawn 0/1' },
            { category: 'events', name: 'bradley.respawndelayminutes', desc: 'Respawn delay', syntax: 'bradley.respawndelayminutes [minutes]' },
            { category: 'events', name: 'bradley.respawndelayvariance', desc: 'Respawn variance', syntax: 'bradley.respawndelayvariance [value]' },
            { category: 'events', name: 'heli.bulletaccuracy', desc: 'Heli accuracy', syntax: 'heli.bulletaccuracy [value]' },
            { category: 'events', name: 'heli.bulletdamagescale', desc: 'Heli damage', syntax: 'heli.bulletdamagescale [value]' },
            { category: 'events', name: 'dropcrate.heli_setdropzone', desc: 'Set Chinook drop', syntax: 'dropcrate.heli_setdropzone "monument id"' },
            { category: 'events', name: 'events.remainingtime', desc: 'Remaining time', syntax: 'events.remainingtime ["event"]' },
            { category: 'events', name: 'events.cooldowntimemultiplier', desc: 'Cooldown multiplier', syntax: 'events.cooldowntimemultiplier "event" [multiplier]' },
            { category: 'events', name: 'events.cooldowntime', desc: 'Cooldown time', syntax: 'events.cooldowntime ["event"]' },
            { category: 'events', name: 'activeevent', desc: 'Disable event', syntax: 'activeevent "event" false' },
            { category: 'events', name: 'events.activeevent', desc: 'List active events', syntax: 'events.activeevent' },
            { category: 'events', name: 'events.start_special', desc: 'Start special', syntax: 'events.start_special "event"' },
            { category: 'events', name: 'events.pause_special', desc: 'Pause special', syntax: 'events.pause_special 1/0' },
            { category: 'events', name: 'events.stop_special', desc: 'Stop special', syntax: 'events.stop_special "event"' },
            { category: 'events', name: 'events.list_special', desc: 'List special', syntax: 'events.list_special' },
            { category: 'events', name: 'halloween.scarecrow_body_dmg_modifier', desc: 'Scarecrow damage', syntax: 'halloween.scarecrow_body_dmg_modifier [value]' },
            { category: 'events', name: 'halloween.scarecrows_throw_beancans', desc: 'Scarecrows throw', syntax: 'halloween.scarecrows_throw_beancans 0/1' },
            { category: 'events', name: 'xmas.giftsperplayer', desc: 'Gifts per player', syntax: 'xmas.giftsperplayer [number]' },

            // Global
            { category: 'global', name: 'dayview', desc: 'Eternal daylight', syntax: 'dayview 0/1' },
            { category: 'global', name: 'say', desc: 'Send chat message', syntax: 'say "message"' },
            { category: 'global', name: 'ent info', desc: 'Entity info', syntax: 'ent info' },
            { category: 'global', name: 'ent who', desc: 'Entity owner', syntax: 'ent who' },
            { category: 'global', name: 'ent kill', desc: 'Destroy entity', syntax: 'ent kill' },
            { category: 'global', name: 'ent unlock', desc: 'Unlock lock', syntax: 'ent unlock' },
            { category: 'global', name: 'ent lock', desc: 'Lock lock', syntax: 'ent lock' },
            { category: 'global', name: 'baseprojectile.fullstartingmagazine', desc: 'Full magazine', syntax: 'baseprojectile.fullstartingmagazine 0/1' },
            { category: 'global', name: 'baseprojectile.infiniteammo', desc: 'Infinite ammo', syntax: 'baseprojectile.infiniteammo 0/1' },
            { category: 'global', name: 'craft.adddefaultblueprint', desc: 'Add default BP', syntax: 'craft.adddefaultblueprint "shortname"' },
            { category: 'global', name: 'craft.removedefaultblueprint', desc: 'Remove default BP', syntax: 'craft.removedefaultblueprint "shortname"' },
            { category: 'global', name: 'craft.listdefaultblueprint', desc: 'List default BPs', syntax: 'craft.listdefaultblueprint' },
            { category: 'global', name: 'ai.killanimals', desc: 'Kill all animals', syntax: 'ai.killanimals' },
            { category: 'global', name: 'ai.killscientists', desc: 'Kill all scientists', syntax: 'ai.killscientists' },
            { category: 'global', name: 'construct.demolishhammer', desc: 'Demolish hammer', syntax: 'construct.demolishhammer 0/1' },
            { category: 'global', name: 'construct.freeconstruction', desc: 'Free building', syntax: 'construct.freeconstruction 0/1' },
            { category: 'global', name: 'construct.freeupgrading', desc: 'Free upgrading', syntax: 'construct.freeupgrading 0/1' },
            { category: 'global', name: 'servermgr.numsleepingplayers', desc: 'Sleeping players', syntax: 'servermgr.numsleepingplayers' },
            { category: 'global', name: 'env.progresstime', desc: 'Stop time', syntax: 'env.progresstime 0/1' },
            { category: 'global', name: 'env.time', desc: 'Set time', syntax: 'env.time [hour]' },
            { category: 'global', name: 'craft.itemcookspeedmultiplier', desc: 'Cook speed', syntax: 'craft.itemcookspeedmultiplier [scale]' },
            { category: 'global', name: 'craft.basecraftspeed', desc: 'Base craft speed', syntax: 'craft.basecraftspeed [value]' },
            { category: 'global', name: 'Spawn.fill_groups', desc: 'Reset loot', syntax: 'Spawn.fill_groups' },
            { category: 'global', name: 'junkpile.getjunkpilecounts', desc: 'Junkpile counts', syntax: 'junkpile.getjunkpilecounts' },
            { category: 'global', name: 'ui.showbasestatsui', desc: 'Show base stats', syntax: 'ui.showbasestatsui' },
            { category: 'global', name: 'ai.npc_junkpilespawn_chance', desc: 'Scientist chance', syntax: 'ai.npc_junkpilespawn_chance [value]' },
            { category: 'global', name: 'ai.npc_max_junkpile_count', desc: 'Max scientists', syntax: 'ai.npc_max_junkpile_count [value]' },
            { category: 'global', name: 'attackentity.npc_aimconescale', desc: 'AI aim cone', syntax: 'attackentity.npc_aimconescale [value]' },
            { category: 'global', name: 'attackentity.npc_attackcooldownscale', desc: 'AI cooldown', syntax: 'attackentity.npc_attackcooldownscale [value]' },
            { category: 'global', name: 'attackentity.npc_attacklengthscale', desc: 'AI attack length', syntax: 'attackentity.npc_attacklengthscale [value]' },
            { category: 'global', name: 'attackentity.npc_attackspacingscale', desc: 'AI attack spacing', syntax: 'attackentity.npc_attackspacingscale [value]' },
            { category: 'global', name: 'attackentity.npc_damagescale', desc: 'AI damage', syntax: 'attackentity.npc_damagescale [value]' },
            { category: 'global', name: 'attackentity.set_easy_ai', desc: 'Easy AI', syntax: 'attackentity.set_easy_ai' },
            { category: 'global', name: 'attackentity.set_normal_ai', desc: 'Normal AI', syntax: 'attackentity.set_normal_ai' },
            { category: 'global', name: 'gamemodesoftcore.reclaim_fraction_belt', desc: 'Belt reclaim', syntax: 'gamemodesoftcore.reclaim_fraction_belt [fraction]' },
            { category: 'global', name: 'gamemodesoftcore.reclaim_fraction_main', desc: 'Main reclaim', syntax: 'gamemodesoftcore.reclaim_fraction_main [fraction]' },
            { category: 'global', name: 'gamemodesoftcore.reclaim_fraction_wear', desc: 'Wear reclaim', syntax: 'gamemodesoftcore.reclaim_fraction_wear [fraction]' },
            { category: 'global', name: 'reclaimmanager.reclaim_expire_minutes', desc: 'Reclaim expiry', syntax: 'reclaimmanager.reclaim_expire_minutes [minutes]' },
            { category: 'global', name: 'env.nightlight_distance', desc: 'Nightlight distance', syntax: 'env.nightlight_distance [value]' },
            { category: 'global', name: 'env.nightlight_brightness', desc: 'Nightlight brightness', syntax: 'env.nightlight_brightness [value]' },

            // Inventory
            { category: 'inventory', name: 'inventory.adddefaultitem', desc: 'Add default item', syntax: 'inventory.adddefaultitem "shortname"' },
            { category: 'inventory', name: 'inventory.cleardefaultitem', desc: 'Clear default items', syntax: 'inventory.cleardefaultitem' },
            { category: 'inventory', name: 'inventory.removedefaultitem', desc: 'Remove default item', syntax: 'inventory.removedefaultitem "shortname"' },
            { category: 'inventory', name: 'inventory.give', desc: 'Give item to self', syntax: 'inventory.give "shortname" [quantity]' },
            { category: 'inventory', name: 'inventory.giveall', desc: 'Give to all', syntax: 'inventory.giveall "shortname" [quantity]' },
            { category: 'inventory', name: 'inventory.givedrop', desc: 'Drop item', syntax: 'inventory.givedrop "shortname"' },
            { category: 'inventory', name: 'inventory.giveto', desc: 'Give to player', syntax: 'inventory.giveto "playerid" "shortname"' },
            { category: 'inventory', name: 'inventory.resetbp', desc: 'Reset blueprints', syntax: 'inventory.resetbp' },
            { category: 'inventory', name: 'inventory.unlockall', desc: 'Unlock all BPs', syntax: 'inventory.unlockall' },
            { category: 'inventory', name: 'inventory.removedroppeditems', desc: 'Remove dropped items', syntax: 'inventory.removedroppeditems "shortname"' },

            // Zones
            { category: 'zones', name: 'createcustomzone', desc: 'Create custom zone', syntax: 'createcustomzone name (x,y,z) rotation shape size pvp npc radiation pvb build' },
            { category: 'zones', name: 'editcustomzone enabled', desc: 'Toggle zone', syntax: 'editcustomzone "name" enabled 0/1' },
            { category: 'zones', name: 'editcustomzone position', desc: 'Set position', syntax: 'editcustomzone "name" position (x,y,z)' },
            { category: 'zones', name: 'editcustomzone rotation', desc: 'Set rotation', syntax: 'editcustomzone "name" rotation [value]' },
            { category: 'zones', name: 'editcustomzone type', desc: 'Set shape', syntax: 'editcustomzone "name" type box/sphere' },
            { category: 'zones', name: 'editcustomzone size', desc: 'Set size', syntax: 'editcustomzone "name" size (x,y,z) / [radius]' },
            { category: 'zones', name: 'editcustomzone allowpvpdamage', desc: 'Toggle PvP', syntax: 'editcustomzone "name" allowpvpdamage 0/1' },
            { category: 'zones', name: 'editcustomzone allownpcdamage', desc: 'Toggle NPC', syntax: 'editcustomzone "name" allownpcdamage 0/1' },
            { category: 'zones', name: 'editcustomzone radiationdamage', desc: 'Set radiation', syntax: 'editcustomzone "name" radiationdamage [value]' },
            { category: 'zones', name: 'editcustomzone allowbuildingdamage', desc: 'Toggle building damage', syntax: 'editcustomzone "name" allowbuildingdamage 0/1' },
            { category: 'zones', name: 'editcustomzone allowbuilding', desc: 'Toggle building', syntax: 'editcustomzone "name" allowbuilding 0/1' },
            { category: 'zones', name: 'editcustomzone showarea', desc: 'Toggle visibility', syntax: 'editcustomzone "name" showarea 0/1' },
            { category: 'zones', name: 'editcustomzone color', desc: 'Set color', syntax: 'editcustomzone "name" color (R,G,B)' },
            { category: 'zones', name: 'editcustomzone showchatmessage', desc: 'Toggle chat', syntax: 'editcustomzone "name" showchatmessage 0/1' },
            { category: 'zones', name: 'editcustomzone entermessage', desc: 'Set enter msg', syntax: 'editcustomzone "name" entermessage "text"' },
            { category: 'zones', name: 'editcustomzone leavemessage', desc: 'Set leave msg', syntax: 'editcustomzone "name" leavemessage "text"' },
            { category: 'zones', name: 'listcustomzones', desc: 'List zones', syntax: 'listcustomzones' },
            { category: 'zones', name: 'customzoneinfo', desc: 'Zone info', syntax: 'customzoneinfo "name"' },
            { category: 'zones', name: 'deletecustomzone', desc: 'Delete zone', syntax: 'deletecustomzone "name"' },

            // Scheduler
            { category: 'scheduler', name: 'CreateAction', desc: 'Create scheduled action', syntax: 'CreateAction ConVarSchedulerAction start end repeat count command params' },
            { category: 'scheduler', name: 'listactions', desc: 'List actions', syntax: 'listactions' },
            { category: 'scheduler', name: 'removeaction', desc: 'Remove action', syntax: 'removeaction [id]' }
        ];
    }

    loadFavorites() {
        const saved = localStorage.getItem('tdl_command_favorites');
        return saved ? JSON.parse(saved) : [];
    }

    saveFavorites() {
        localStorage.setItem('tdl_command_favorites', JSON.stringify(this.favorites));
    }

    loadHistory() {
        const saved = localStorage.getItem('tdl_command_history');
        return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
        localStorage.setItem('tdl_command_history', JSON.stringify(this.history.slice(0, 50)));
    }

    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'commands') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-commands');
        if (!tab) {
            // If there's no tab-commands, we need to create one in index.html
            // For now, we'll assume it exists. You may need to add it.
            console.warn('tab-commands not found');
            return;
        }

        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="commands-container" style="padding: 1rem;">
                <div class="commands-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h2 style="color: var(--accent-primary);">⚡ Command List</h2>
                    <div>
                        <button id="commands-refresh" class="commands-btn" style="background: var(--bg-tertiary); padding: 0.5rem 1rem; border-radius: 8px;">🔄 REFRESH</button>
                    </div>
                </div>

                <!-- Search and Tabs -->
                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <input type="text" id="commands-search" placeholder="SEARCH" style="flex: 2; min-width: 200px; padding: 0.8rem 1rem; background: var(--bg-tertiary); border: 1px solid var(--glass-border); border-radius: 30px;">
                    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="commands-tab-btn active" data-tab="all">All</button>
                        <button class="commands-tab-btn" data-tab="favorites">⭐ Favorites</button>
                        <button class="commands-tab-btn" data-tab="history">📋 History</button>
                    </div>
                </div>

                <!-- Category filter (second row) -->
                <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <button class="commands-cat-btn active" data-cat="all">All</button>
                    <button class="commands-cat-btn" data-cat="attack">Attack</button>
                    <button class="commands-cat-btn" data-cat="base">Base</button>
                    <button class="commands-cat-btn" data-cat="admin">Admin</button>
                    <button class="commands-cat-btn" data-cat="spawn">Spawn</button>
                    <button class="commands-cat-btn" data-cat="modifiers">Modifiers</button>
                    <button class="commands-cat-btn" data-cat="kits">Kits</button>
                    <button class="commands-cat-btn" data-cat="player">Player</button>
                    <button class="commands-cat-btn" data-cat="events">Events</button>
                    <button class="commands-cat-btn" data-cat="global">Global</button>
                    <button class="commands-cat-btn" data-cat="inventory">Inventory</button>
                    <button class="commands-cat-btn" data-cat="zones">Zones</button>
                    <button class="commands-cat-btn" data-cat="scheduler">Scheduler</button>
                </div>

                <!-- Command List -->
                <div id="commands-list" class="commands-list" style="background: var(--glass-bg); backdrop-filter: blur(10px); border: 1px solid var(--glass-border); border-radius: 16px; padding: 1rem; max-height: 600px; overflow-y: auto;">
                    <!-- Will be populated by JS -->
                </div>
            </div>
        `;

        // Add styles for buttons
        const style = document.createElement('style');
        style.textContent = `
            .commands-tab-btn, .commands-cat-btn {
                padding: 0.5rem 1.2rem;
                background: var(--bg-tertiary);
                border: 1px solid var(--glass-border);
                border-radius: 30px;
                color: var(--text-secondary);
                cursor: pointer;
                transition: all 0.2s;
                font-size: 0.9rem;
            }
            .commands-tab-btn.active, .commands-cat-btn.active {
                background: var(--accent-primary);
                color: #000;
                border-color: var(--accent-primary);
            }
            .commands-tab-btn:hover, .commands-cat-btn:hover {
                background: var(--accent-primary);
                color: #000;
            }
            .command-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.8rem;
                border-bottom: 1px solid var(--glass-border);
                transition: background 0.2s;
            }
            .command-item:hover {
                background: var(--bg-secondary);
            }
            .command-info {
                flex: 1;
            }
            .command-name {
                font-weight: 500;
                color: var(--accent-primary);
            }
            .command-desc {
                font-size: 0.85rem;
                color: var(--text-secondary);
            }
            .command-syntax {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.8rem;
                color: var(--text-secondary);
                background: var(--bg-tertiary);
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                margin-top: 0.2rem;
            }
            .command-actions {
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }
            .fav-btn {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: var(--text-secondary);
                transition: color 0.2s;
            }
            .fav-btn.active {
                color: #FFD700;
            }
            .fav-btn:hover {
                color: var(--accent-primary);
            }
        `;
        document.head.appendChild(style);

        this.renderCommands();
    }

    attachEvents() {
        document.getElementById('commands-refresh')?.addEventListener('click', () => this.refresh());
        document.getElementById('commands-search')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterCommands();
        });

        document.querySelectorAll('.commands-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.commands-tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTab = e.target.dataset.tab;
                this.filterCommands();
            });
        });

        document.querySelectorAll('.commands-cat-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.commands-cat-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentCategory = e.target.dataset.cat;
                this.filterCommands();
            });
        });

        // Delegate for favorite toggles and execute buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('fav-btn')) {
                const name = e.target.dataset.name;
                this.toggleFavorite(name);
                e.target.classList.toggle('active');
            }
            if (e.target.classList.contains('execute-cmd')) {
                const syntax = e.target.dataset.syntax;
                this.executeCommand(syntax);
            }
        });
    }

    filterCommands() {
        let filtered = this.commands;

        // Filter by category
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(cmd => cmd.category === this.currentCategory);
        }

        // Filter by search
        if (this.searchQuery) {
            filtered = filtered.filter(cmd => 
                cmd.name.toLowerCase().includes(this.searchQuery) ||
                cmd.desc.toLowerCase().includes(this.searchQuery) ||
                cmd.syntax.toLowerCase().includes(this.searchQuery)
            );
        }

        // Handle special tabs
        if (this.currentTab === 'favorites') {
            filtered = filtered.filter(cmd => this.favorites.includes(cmd.name));
        } else if (this.currentTab === 'history') {
            // Show history as separate list? We'll just show history items.
            // For simplicity, we'll show a message.
            this.renderHistory();
            return;
        }

        this.filtered = filtered;
        this.renderCommands();
    }

    renderCommands() {
        const container = document.getElementById('commands-list');
        if (!container) return;

        if (this.filtered.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No commands found</div>';
            return;
        }

        let html = '';
        this.filtered.slice(0, 200).forEach(cmd => {
            const isFavorite = this.favorites.includes(cmd.name);
            html += `
                <div class="command-item">
                    <div class="command-info">
                        <div class="command-name">${cmd.name}</div>
                        <div class="command-desc">${cmd.desc}</div>
                        <div class="command-syntax">${cmd.syntax}</div>
                    </div>
                    <div class="command-actions">
                        <button class="fav-btn ${isFavorite ? 'active' : ''}" data-name="${cmd.name}" title="Favorite">⭐</button>
                        <button class="small-btn execute-cmd" data-syntax="${cmd.syntax.replace(/"/g, '&quot;')}">Execute</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    renderHistory() {
        const container = document.getElementById('commands-list');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-secondary);">No command history</div>';
            return;
        }

        let html = '';
        this.history.slice(0, 50).forEach(cmd => {
            html += `
                <div class="command-item">
                    <div class="command-info">
                        <div class="command-syntax">${cmd}</div>
                    </div>
                    <div class="command-actions">
                        <button class="small-btn execute-cmd" data-syntax="${cmd.replace(/"/g, '&quot;')}">Re-run</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    toggleFavorite(name) {
        const index = this.favorites.indexOf(name);
        if (index === -1) {
            this.favorites.push(name);
            toast.success('Added to favorites');
        } else {
            this.favorites.splice(index, 1);
            toast.info('Removed from favorites');
        }
        this.saveFavorites();
        // If currently on favorites tab, re-filter
        if (this.currentTab === 'favorites') {
            this.filterCommands();
        }
    }

    async executeCommand(syntax) {
        // Prompt for parameters if needed
        const paramMatch = syntax.match(/\[([^\]]+)\]/g);
        let fullCommand = syntax;
        if (paramMatch) {
            // For simplicity, we'll just prompt for each parameter
            for (let param of paramMatch) {
                const placeholder = param.slice(1, -1);
                const value = prompt(`Enter value for ${placeholder}:`);
                if (value === null) return; // cancelled
                fullCommand = fullCommand.replace(param, value);
            }
        }
        try {
            const result = await ConnectionManager.executeCommand(fullCommand);
            this.history.unshift(fullCommand);
            this.saveHistory();
            toast.success('Command executed');
            if (result) toast.info(`Result: ${result.substring(0, 200)}`);
        } catch (err) {
            toast.error(`Failed: ${err.message}`);
        }
    }

    refresh() {
        this.filterCommands();
        toast.success('Commands refreshed');
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.commands = new Commands();
});