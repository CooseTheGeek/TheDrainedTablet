// resources.js – DRAINED TABLET ULTIMATE v7.0.0
// Comprehensive knowledge base: build costs, raid costs, monument info, item database, command executor, and more.
// All data provided by CooseTheGeek, integrated into a sleek, interactive UI.

class Resources {
    constructor() {
        this.access = window.accessControl;
        this.db = window.database; // for future use
        this.currentCommandCategory = 'banitem';
        this.commandSearchTerm = '';
        this.itemSearchTerm = '';
        this.init();
    }

    // ---------- Embedded Data ----------
    buildCosts = {
        wood: {
            "Square foundation": 50,
            "Wall": 50,
            "Half wall": 50,
            "L shaped stairs": 50,
            "U shaped stairs": 50,
            "Spiral stairs": 50,
            "Triangle spiral stairs": 50,
            "Roof": 50,
            "Doorway": 35,
            "Window": 35,
            "Triangle Foundation": 25,
            "Steps": 25,
            "Ramp": 25,
            "Floor": 25,
            "Floor frame": 25,
            "Wall frame": 25,
            "Low wall": 25,
            "Roof triangle": 25,
            "Floor triangle": 13,
            "Floor triangle frame": 13
        },
        stone: {
            "Square foundation": 300,
            "Wall": 300,
            "Half wall": 300,
            "L shaped stairs": 300,
            "U shaped stairs": 300,
            "Spiral stairs": 300,
            "Triangle spiral stairs": 300,
            "Roof": 300,
            "Doorway": 210,
            "Window": 210,
            "Triangle Foundation": 150,
            "Steps": 150,
            "Ramp": 150,
            "Floor": 150,
            "Floor frame": 150,
            "Wall frame": 150,
            "Low wall": 150,
            "Roof triangle": 150,
            "Floor triangle": 75,
            "Floor triangle frame": 75
        },
        metal: {
            "Square foundation": 200,
            "Wall": 200,
            "Half wall": 200,
            "L shaped stairs": 200,
            "U shaped stairs": 200,
            "Spiral stairs": 200,
            "Triangle spiral stairs": 200,
            "Roof": 200,
            "Doorway": 140,
            "Window": 140,
            "Triangle Foundation": 100,
            "Steps": 100,
            "Ramp": 100,
            "Floor": 100,
            "Floor frame": 100,
            "Wall frame": 100,
            "Low wall": 100,
            "Roof triangle": 100,
            "Floor triangle": 50,
            "Floor triangle frame": 50
        },
        hqm: {
            "Square foundation": 25,
            "Wall": 25,
            "Half wall": 25,
            "L shaped stairs": 25,
            "U shaped stairs": 25,
            "Spiral stairs": 25,
            "Triangle spiral stairs": 25,
            "Roof": 25,
            "Doorway": 18,
            "Window": 18,
            "Triangle Foundation": 13,
            "Steps": 13,
            "Ramp": 13,
            "Floor": 13,
            "Floor frame": 13,
            "Wall frame": 13,
            "Low wall": 13,
            "Roof triangle": 13,
            "Floor triangle": 7,
            "Floor triangle frame": 7
        }
    };

    raidCosts = {
        timed: {
            "Wood wall": 1,
            "Stone wall": 2,
            "Metal wall": 4,
            "HQM wall": 8,
            "Wood door": 1,
            "Metal door": 1,
            "Garage door": 2,
            "HQM door": 3,
            "Metal shop front": 3,
            "Ladder hatches": 1,
            "Strengthened glass window": 2,
            "Reinforced window bars": 2
        },
        rocket: {
            "Wood wall": 2,
            "Stone wall": 4,
            "Metal wall": 8,
            "HQM wall": 15,
            "Wood door": 1,
            "Metal door": 2,
            "Garage door": 3,
            "HQM door": 5,
            "Metal shop front": 6,
            "Ladder hatches": 2,
            "Strengthened glass window": 3,
            "Reinforced window bars": 4
        },
        explo: {
            "Wood wall": 49,
            "Stone wall": 185,
            "Metal wall": 400,
            "HQM wall": 799,
            "Wood door": 19,
            "Metal door": 63,
            "Garage door": 150,
            "HQM door": 250,
            "Metal shop front": 300,
            "Ladder hatches": 63,
            "Strengthened glass window": 175,
            "Reinforced window bars": 200
        },
        satchel: {
            "Wood wall": 3,
            "Stone wall": 10,
            "Metal wall": 23,
            "HQM wall": 46,
            "Wood door": 2,
            "Metal door": 4,
            "Garage door": 9,
            "HQM door": 15,
            "Metal shop front": 18,
            "Ladder hatches": 4,
            "Strengthened glass window": 9,
            "Reinforced window bars": 12
        },
        hegrenade: {
            "Wood wall": 8,
            "Stone wall": 29,
            "Metal wall": 57,
            "HQM wall": 114,
            "Wood door": 3,
            "Metal door": 9,
            "Garage door": 22,
            "HQM door": 36,
            "Metal shop front": 43,
            "Ladder hatches": 9,
            "Strengthened glass window": 20,
            "Reinforced window bars": 29
        }
    };

    monuments = [
        { name: "Dome", rad: 10, card: "none", puzzle: false, safe: false },
        { name: "Lighthouse", rad: 0, card: "green", puzzle: true, safe: false },
        { name: "Mining Outpost", rad: 0, card: "none", puzzle: false, safe: false },
        { name: "Abandoned Supermarket", rad: 0, card: "green", puzzle: true, safe: false },
        { name: "Oxum's Gas Station", rad: 0, card: "green", puzzle: true, safe: false },
        { name: "Bandit Camp", rad: 0, card: "none", puzzle: false, safe: true },
        { name: "Outpost", rad: 0, card: "none", puzzle: false, safe: true },
        { name: "Large Barn", rad: 0, card: "none", puzzle: false, safe: true },
        { name: "The Ranch", rad: 0, card: "none", puzzle: false, safe: true },
        { name: "Fishing Village", rad: 0, card: "none", puzzle: false, safe: true },
        { name: "Large Fishing Village", rad: 0, card: "none", puzzle: false, safe: true },
        { name: "Large Oil Rig", rad: 0, card: "red", puzzle: true, safe: false },
        { name: "Small Oil Rig", rad: 0, card: "red", puzzle: true, safe: false },
        { name: "Underwater Labs", rad: 0, card: "green", puzzle: true, safe: false },
        { name: "Satellite Dish", rad: 10, card: "green", puzzle: true, safe: false },
        { name: "Sewer Branch", rad: 10, card: "green", puzzle: true, safe: false },
        { name: "Airfield", rad: 10, card: "blue", puzzle: true, safe: false },
        { name: "Power Plant", rad: 25, card: "blue", puzzle: true, safe: false },
        { name: "Water Treatment", rad: 25, card: "blue", puzzle: true, safe: false },
        { name: "Train Yard", rad: 25, card: "blue", puzzle: true, safe: false },
        { name: "Launch Site", rad: 50, card: "red", puzzle: true, safe: false },
        { name: "Military Tunnels", rad: 25, card: "red", puzzle: true, safe: false }
    ];

    cameraIds = {
        "Airfield": ["AIRFIELDGARAGE", "AIRFIELDHELIPAD"],
        "Bandit Camp": ["TOWNWEAPONS", "CASINO"],
        "Large Oil Rig": ["OILRIG2L3A", "OILRIG2L3B", "OILRIG2L4", "OILRIG2L5", "OILRIG2L6A", "OILRIG2L6B", "OILRIG2L6C", "OILRIG2L6D", "OILRIG2DOCK", "OILRIG2HELI", "OILRIG2L1", "OILRIG2EXHAUST", "OILRIG2L2"],
        "Outpost": ["COMPOUNDCRUDE", "COMPOUNDCHILL", "COMPOUNDSTREET", "COMPOUNDMUSIC"],
        "Dome": ["DOMETOP", "DOME1"],
        "Small Oil Rig": ["OILRIG1L1", "OILRIG1L2", "OILRIG1L3", "OILRIG1L4", "OILRIG1DOCK", "OILRIG1HELI"]
    };

    frequencyCodes = {
        "Oil Rig": 4765,
        "Large Oil Rig": 4768
    };

    electricalConsumption = {
        "fluid switch and pump": 0,
        "powered water purifier": 5,
        "water pump": 5,
        "electric heater": 3,
        "ceiling light": 2,
        "AND switch": 0,
        "audio alarm": 1,
        "blocker": 0,
        "button": 0,
        "cctv camera": 5,
        "counter": 0,
        "door controller": 1,
        "electric furnace": 3,
        "electrical branch": 0,
        "flasher light": 1,
        "HBHF sensor": 1,
        "igniter": 2,
        "industrial conveyor": 1,
        "industrial crafter": 1,
        "laser detector": 1,
        "memory cell": 0,
        "OR switch": 1,
        "pressure pad": 0,
        "RAND switch": 0,
        "reactive target": 1,
        "RF broadcaster": 1,
        "RF receiver": 1,
        "root combined": 0,
        "seismic sensor": 1,
        "siren light": 1,
        "splitter": 0,
        "storage monitor": 1,
        "switch": 0,
        "timer": 0,
        "XOR switch": 0,
        "auto turret": 10,
        "elevator": 5,
        "sam site": 25,
        "search light": 10,
        "tesla coil": 35,
        "modular car lift": 5
    };

    powerSupply = {
        "Large solar panel": "0‑20",
        "Small generator": "40",
        "Wind turbine": "0‑140"
    };

    batteryStorage = {
        "Small rechargeable battery": "400/15",
        "Medium rechargeable battery": "9,000/50",
        "Large rechargeable battery": "24,000/100"
    };

    // Command categories with syntax and description
    commandCategories = {
        banitem: {
            name: "Item Banning",
            commands: [
                { syntax: 'banitem "itemshortname" all', desc: "Completely remove an item from the server." },
                { syntax: 'unbanitem "itemshortname"', desc: "Completely unban an item." },
                { syntax: 'banitem "itemshortname" NoCrafting', desc: "Ban an item from being crafted." },
                { syntax: 'banitem "itemshortname" TechTreeBypass', desc: "Remove item from tech tree, allow below." },
                { syntax: 'banitem "itemshortname" TechTreeBlockpath', desc: "Remove item and block below." },
                { syntax: 'banitem "itemshortname" NoTechTree', desc: "Remove item and all below from tech tree." },
                { syntax: 'banitem "itemshortname" ResearchTableBlocked', desc: "Remove ability to research at table." },
                { syntax: 'banitem "itemshortname" NoResearch', desc: "Remove ability to research anywhere." },
                { syntax: 'banitem "itemshortname" NoItemSpawn', desc: "Stop item from spawning." },
                { syntax: 'banitem "itemshortname" NoBlueprintSpawn', desc: "Stop blueprint from spawning." },
                { syntax: 'banitem "itemshortname" NoSpawn', desc: "Stop both item and blueprint from spawning." }
            ]
        },
        spawn: {
            name: "Spawning",
            commands: [
                { syntax: 'spawn vendingmachine.deployed (x,y,z)', desc: "Spawn vending machine." },
                { syntax: 'spawn recycler (x,y,z)', desc: "Spawn recycler." },
                { syntax: 'spawn toilet_b (x,y,z)', desc: "Spawn toilet." },
                { syntax: 'spawn sam_static (x,y,z)', desc: "Spawn SAM Site." },
                { syntax: 'spawn keycard_blue_pickup (x,y,z)', desc: "Spawn blue keycard." },
                { syntax: 'spawn keycard_green_pickup (x,y,z)', desc: "Spawn green keycard." },
                { syntax: 'spawn keycard_red_pickup (x,y,z)', desc: "Spawn red keycard." },
                { syntax: 'spawn crate_ammunition (x,y,z)', desc: "Spawn ammo crate." },
                { syntax: 'spawn crate_medical (x,y,z)', desc: "Spawn med crate." },
                { syntax: 'spawn heli_crate (x,y,z)', desc: "Spawn heli crate." },
                { syntax: 'spawn bradley_crate (x,y,z)', desc: "Spawn Bradley crate." },
                { syntax: 'spawn codelock (x,y,z)', desc: "Spawn locked crate." },
                { syntax: 'spawn crate_elite (x,y,z)', desc: "Spawn elite crate." },
                { syntax: 'spawn supply_drop (x,y,z,)', desc: "Spawn supply drop." },
                { syntax: 'spawn crate_normal (x,y,z)', desc: "Spawn military crate." },
                { syntax: 'spawn crate_normal_2 (x,y,z)', desc: "Spawn regular crate." },
                { syntax: 'spawn crate_tools (x,y,z)', desc: "Spawn tool box." },
                { syntax: 'spawn woodbox_deployed (x,y,z)', desc: "Spawn small wooden box." },
                { syntax: 'spawn crate_normal_2_food (x,y,z)', desc: "Spawn food crate." },
                { syntax: 'spawn foodbox (x,y,z)', desc: "Spawn rations box." },
                { syntax: 'spawn crate_normal_2_medical (x,y,z)', desc: "Spawn medical crate." },
                { syntax: 'spawn loot_barrel_1 (x,y,z)', desc: "Spawn blue barrel." },
                { syntax: 'spawn loot_barrel_2 (x,y,z)', desc: "Spawn white barrel." },
                { syntax: 'spawn crate_underwater_advanced (x,y,z)', desc: "Spawn large underwater crate." },
                { syntax: 'spawn crate_underwater_basic (x,y,z)', desc: "Spawn small underwater crate." },
                { syntax: 'spawn metal-ore (x,y,z)', desc: "Spawn metal node." },
                { syntax: 'spawn stone-ore (x,y,z)', desc: "Spawn stone node." },
                { syntax: 'spawn sulfur-ore (x,y,z)', desc: "Spawn sulfur node." },
                { syntax: 'spawn scraptransportheli (x,y,z)', desc: "Spawn scrap transport heli." },
                { syntax: 'spawn minicopter (x,y,z)', desc: "Spawn minicopter." },
                { syntax: 'spawn attackhelicopter (x,y,z)', desc: "Spawn attack helicopter." },
                { syntax: 'spawn pedalbike (x,y,z)', desc: "Spawn bicycle." },
                { syntax: 'spawn pedaltrike (x,y,z)', desc: "Spawn tricycle." },
                { syntax: 'spawn motorbike (x,y,z)', desc: "Spawn motorbike." },
                { syntax: 'spawn motorbike_sidecar (x,y,z)', desc: "Spawn motorbike with sidecar." },
                { syntax: 'spawn 2module_car (x,y,z)', desc: "Spawn 2 module car." },
                { syntax: 'spawn 3module_car (x,y,z)', desc: "Spawn 3 module car." },
                { syntax: 'spawn 4module_car (x,y,z)', desc: "Spawn 4 module car." },
                { syntax: 'spawn shreddable_pickuptruck (x,y,z)', desc: "Spawn shreddable pickup truck." },
                { syntax: 'spawn cargoshipdynamic1 (x,y,z)', desc: "Spawn cargo ship (military transport)." },
                { syntax: 'spawn cargoshipdynamic2 (x,y,z)', desc: "Spawn cargo ship (containers)." },
                { syntax: 'entity.spawnitem "shortname" (x,y,z)', desc: "Spawn a dropped item." }
            ]
        },
        modifiers: {
            name: "Modifiers",
            commands: [
                { syntax: 'modifiers.listallmodifiers', desc: "List all modifiers." },
                { syntax: 'modifiers.listmodifiers "itemshortname"', desc: "List modifiers for an item." },
                { syntax: 'modifiers.clearmodifiers all', desc: "Remove all modifiers from all items." },
                { syntax: 'modifiers.clearmodifier "itemshortname" [modifier]', desc: "Remove a modifier from an item." },
                { syntax: 'modifiers.setmodifier "itemshortname" collection scale', desc: "Scale collection of specific items." },
                { syntax: 'modifiers.setmodifier "itemshortname" gather scale', desc: "Scale gather rate." },
                { syntax: 'modifiers.setmodifier "itemshortname" tool scale', desc: "Scale tool gather rate." },
                { syntax: 'modifiers.setmodifier "itemshortname" loot scale', desc: "Scale loot amount." },
                { syntax: 'modifiers.setmodifier "itemshortname" cookspeed scale', desc: "Set cook speed." },
                { syntax: 'modifiers.setmodifier "itemshortname" cookamount scale', desc: "Scale smelting output." },
                { syntax: 'modifiers.setmodifier "ItemName" workbenchlevel "value"', desc: "Set workbench level." },
                { syntax: 'modifiers.setmodifier "ItemName" crafttime "value"', desc: "Override crafting time." },
                { syntax: 'craft.furnaceusagemultiplier scale', desc: "Scale furnace fuel usage." },
                { syntax: 'craft.furnaceoutputmultiplier scale', desc: "Scale furnace output." },
                { syntax: 'craft.itemcookspeedmultiplier scale', desc: "Scale cook speed." },
                { syntax: 'modifiers.charcoalratescale scale', desc: "Scale charcoal production." },
                { syntax: 'modifiers.quarryprocessratescale scale', desc: "Scale quarry speed." },
                { syntax: 'modifiers.crudeoiloutputscale scale', desc: "Scale crude oil output." },
                { syntax: 'modifiers.lowgradeoutputscale scale', desc: "Scale low grade fuel output." }
            ]
        },
        kits: {
            name: "Kits",
            commands: [
                { syntax: 'kit list', desc: "List all kits." },
                { syntax: 'kit add "kitname" "itemshortname" "amount" "[condition]" "[container]"', desc: "Add item to kit or create kit." },
                { syntax: 'kit remove "kitname" "id"', desc: "Remove item from kit." },
                { syntax: 'kit info "kitname"', desc: "Show kit info." },
                { syntax: 'kit edit "kitname" changename "NewName"', desc: "Rename kit." },
                { syntax: 'kit delete "kitname"', desc: "Delete kit." },
                { syntax: 'kit edit "kitname" addgroup "[group]"', desc: "Add kit to group spawn." },
                { syntax: 'kit givetogroup "kitname" "[group]"', desc: "Give kit to group once." },
                { syntax: 'kit givetoplayer "kitname" "id"', desc: "Give kit to player once." },
                { syntax: 'kit giveall "kitname"', desc: "Give kit to all players once." },
                { syntax: 'kit edit "kitname" removegroup "[group]"', desc: "Remove kit from group spawn." }
            ]
        },
        decay: {
            name: "Decay",
            commands: [
                { syntax: 'decay.upkeep true/false', desc: "Enable/disable upkeep." },
                { syntax: 'decay.scale [value]', desc: "Set decay scale." },
                { syntax: 'decay.tick [seconds]', desc: "Set decay tick interval." },
                { syntax: 'decay.bracket_0_blockcount [value]', desc: "Set bracket 0 block count." },
                { syntax: 'decay.bracket_0_costfraction [value]', desc: "Set bracket 0 cost fraction." },
                { syntax: 'decay.bracket_1_blockcount [value]', desc: "Set bracket 1 block count." },
                { syntax: 'decay.bracket_1_costfraction [value]', desc: "Set bracket 1 cost fraction." },
                { syntax: 'decay.bracket_2_blockcount [value]', desc: "Set bracket 2 block count." },
                { syntax: 'decay.bracket_2_costfraction [value]', desc: "Set bracket 2 cost fraction." },
                { syntax: 'decay.bracket_3_blockcount [value]', desc: "Set bracket 3 block count." },
                { syntax: 'decay.bracket_3_costfraction [value]', desc: "Set bracket 3 cost fraction." },
                { syntax: 'decay.delay_twig [hours]', desc: "Set twig decay delay." },
                { syntax: 'decay.delay_wood [hours]', desc: "Set wood decay delay." },
                { syntax: 'decay.delay_stone [hours]', desc: "Set stone decay delay." },
                { syntax: 'decay.delay_metal [hours]', desc: "Set metal decay delay." },
                { syntax: 'decay.delay_toptier [hours]', desc: "Set HQM decay delay." },
                { syntax: 'decay.delay_override [hours]', desc: "Override all delays." },
                { syntax: 'decay.duration_twig [hours]', desc: "Set twig decay duration." },
                { syntax: 'decay.duration_wood [hours]', desc: "Set wood decay duration." },
                { syntax: 'decay.duration_stone [hours]', desc: "Set stone decay duration." },
                { syntax: 'decay.duration_metal [hours]', desc: "Set metal decay duration." },
                { syntax: 'decay.duration_toptier [hours]', desc: "Set HQM decay duration." },
                { syntax: 'decay.duration_override [hours]', desc: "Override all durations." },
                { syntax: 'decay.upkeep_grief_protection [minutes]', desc: "Set grief protection time." },
                { syntax: 'decay.upkeep_heal_scale [value]', desc: "Set upkeep heal scale." },
                { syntax: 'decay.upkeep_period_minutes [minutes]', desc: "Set upkeep period." },
                { syntax: 'decay.upgrade_hqm_enabled true/false', desc: "Allow HQM upgrades." },
                { syntax: 'decay.upgrade_metal_enabled true/false', desc: "Allow metal upgrades." },
                { syntax: 'decay.upgrade_stone_enabled true/false', desc: "Allow stone upgrades." },
                { syntax: 'decay.upgrade_wood_enabled true/false', desc: "Allow wood upgrades." }
            ]
        },
        player: {
            name: "Player",
            commands: [
                { syntax: 'vipid "player ID"', desc: "Grant VIP." },
                { syntax: 'removevip "player ID"', desc: "Remove VIP." },
                { syntax: 'moderatorid "player ID"', desc: "Grant moderator." },
                { syntax: 'removemoderator "player ID"', desc: "Remove moderator." },
                { syntax: 'adminid "player ID"', desc: "Grant admin." },
                { syntax: 'removeadmin "player ID"', desc: "Remove admin." },
                { syntax: 'getauthlevel "Player ID"', desc: "Get auth level." },
                { syntax: 'getauthlevels', desc: "List auth levels." },
                { syntax: 'banid "Player ID"', desc: "Ban player." },
                { syntax: 'banid "Player ID" "reason" "seconds"', desc: "Ban with reason and duration." },
                { syntax: 'banlist', desc: "List bans." },
                { syntax: 'unban "player ID"', desc: "Unban player." },
                { syntax: 'kickall', desc: "Kick all players." },
                { syntax: 'killallplayer', desc: "Kill all players." },
                { syntax: 'teleport "player ID" (x,y,z)', desc: "Teleport player to coordinates." },
                { syntax: 'teaminfo "#"', desc: "Show team info." },
                { syntax: 'sleep "player ID"', desc: "Put player to sleep." },
                { syntax: 'relationshipmanager.findplayerteam "player ID"', desc: "Find player's team." },
                { syntax: 'relationshipmanager.sleeptoggleother "player ID"', desc: "Toggle sleep." },
                { syntax: 'teleport "player ID"', desc: "Teleport to player." },
                { syntax: 'teleport2me "player ID" (x,y,z)', desc: "Teleport player to you." },
                { syntax: 'teleportgrid "position" "spacing" "rotation" "MaxPerRow"', desc: "Teleport all in grid." },
                { syntax: 'teleportpos "position" "player ID" "PlaceOnGround"', desc: "Teleport to position." }
            ]
        },
        events: {
            name: "Events",
            commands: [
                { syntax: 'cargoshipdynamic.cargoship_speed_scale "int"', desc: "Set cargo ship speed." },
                { syntax: 'cargoships.egress_duration_minutes "int"', desc: "Set egress duration." },
                { syntax: 'cargoships.event_duration_minutes "int"', desc: "Set event duration." },
                { syntax: 'cargoships.event_enabled "0/1"', desc: "Enable/disable cargo ship." },
                { syntax: 'cargoships.loot_round_spacing_minutes "int"', desc: "Set loot round spacing." },
                { syntax: 'cargoships.loot_rounds "int"', desc: "Set number of loot rounds." },
                { syntax: 'cargoships.scientist_onboard_check "0/1"', desc: "Toggle scientists on cargo." },
                { syntax: 'cargoships.startegressing', desc: "Force cargo to leave." },
                { syntax: 'events.triggerevent "event"', desc: "Trigger an event." },
                { syntax: 'events.stopevent "event"', desc: "Stop an event." },
                { syntax: 'bradley.enabled "0/1"', desc: "Enable/disable Bradley." },
                { syntax: 'bradley.quickrespawn "0/1"', desc: "Toggle quick respawn." },
                { syntax: 'bradley.respawndelayminutes "int"', desc: "Set respawn delay." },
                { syntax: 'bradley.respawndelayvariance "int"', desc: "Set respawn variance." },
                { syntax: 'heli.bulletaccuracy [value]', desc: "Set heli bullet accuracy." },
                { syntax: 'heli.bulletdamagescale [value]', desc: "Set heli bullet damage scale." },
                { syntax: 'dropcrate.heli_setdropzone "monument ID"', desc: "Set Chinook drop zone." },
                { syntax: 'events.remainingtime "event"', desc: "Show remaining time." },
                { syntax: 'events.cooldowntimemultiplier "event" "multiplier"', desc: "Set cooldown multiplier." },
                { syntax: 'events.cooldowntime "event"', desc: "Show cooldown." },
                { syntax: 'activeevent "event" false', desc: "Disable an event." },
                { syntax: 'events.activeevent', desc: "List active events." },
                { syntax: 'events.start_special "event"', desc: "Start a special event." },
                { syntax: 'events.pause_special 1/0', desc: "Pause/unpause special event." },
                { syntax: 'events.stop_special "event"', desc: "Stop special event." },
                { syntax: 'events.list_special', desc: "List special events." },
                { syntax: 'halloween.scarecrow_body_dmg_modifier "int"', desc: "Set scarecrow body damage." },
                { syntax: 'halloween.scarecrows_throw_beancans 0/1', desc: "Toggle beancan throwing." },
                { syntax: 'xmas.giftsperplayer "int"', desc: "Set gifts per player." }
            ]
        },
        entities: {
            name: "Entities",
            commands: [
                { syntax: 'entity.deleteby "player ID"', desc: "Destroy all buildings by player." },
                { syntax: 'ent destroybuilding', desc: "Destroy building you're looking at." },
                { syntax: 'entity.deleteentity "string" "0/1"', desc: "Delete entity with owner check." },
                { syntax: 'vehicle.boat_corpse_seconds "int"', desc: "Set boat corpse lifetime." },
                { syntax: 'baseridableanimal.decayminutes "int"', desc: "Set horse decay time." },
                { syntax: 'baseridableanimal.dungtimescale "int"', desc: "Set dung production rate." },
                { syntax: 'server.planttickscale "int"', desc: "Set plant growth tick scale." },
                { syntax: 'npcvendingmachine.dynamicpricingenabled "0/1"', desc: "Enable dynamic pricing." },
                { syntax: 'npcvendingmachine.maximumpricemultiplier "int"', desc: "Set max price multiplier." },
                { syntax: 'npcvendingmachine.minimumpricemultiplier "int"', desc: "Set min price multiplier." },
                { syntax: 'npcvendingmachine.pricedecreaseamount "int"', desc: "Set price decrease amount." },
                { syntax: 'npcvendingmachine.priceincreaseamount "int"', desc: "Set price increase amount." },
                { syntax: 'npcvendingmachine.priceupdatefrequencydefault "int"', desc: "Set price update frequency." },
                { syntax: 'npcvendingmachine.resetdynamicpricing "int"', desc: "Reset dynamic pricing." },
                { syntax: 'npcvendingmachine.startingpricemultiplier "int"', desc: "Set starting price multiplier." },
                { syntax: 'npcvendingmachine.addhours "int"', desc: "Simulate hours passing." },
                { syntax: 'CanUseRecycler "0/1"', desc: "Enable/disable recycler use." },
                { syntax: 'RecyclerNextRecycleTime "int"', desc: "Set recycle time." },
                { syntax: 'RecyclerStartTime "int"', desc: "Set recycler warm-up time." },
                { syntax: 'Entity.deleteentity "shortname" 0', desc: "Delete all of a specified entity." },
                { syntax: 'bagreuseseconds "int"', desc: "Set bag respawn timer." },
                { syntax: 'bedreuseseconds "int"', desc: "Set bed respawn timer." },
                { syntax: 'minicopter.population "int"', desc: "Set minicopter population." },
                { syntax: 'scraptransporthelicopter.population "int"', desc: "Set scrap heli population." },
                { syntax: 'bike.motorbikemonumentpopulation "int"', desc: "Set monument motorbike population." },
                { syntax: 'bike.pedalroadsidepopulation "int"', desc: "Set roadside pedal bike population." },
                { syntax: 'bike.pedalmonumentpopulation "int"', desc: "Set monument pedal bike population." },
                { syntax: 'mlrs.brokendownminutes "int"', desc: "Set MLRS cooldown." }
            ]
        },
        global: {
            name: "Global",
            commands: [
                { syntax: 'dayview "0/1"', desc: "Toggle eternal daylight for player." },
                { syntax: 'say "message"', desc: "Send message to chat." },
                { syntax: 'ent info', desc: "Print building info of looked-at structure." },
                { syntax: 'ent who', desc: "Print player who placed object." },
                { syntax: 'ent kill', desc: "Destroy looked-at object." },
                { syntax: 'ent unlock', desc: "Unlock looked-at lock." },
                { syntax: 'ent lock', desc: "Lock looked-at lock." },
                { syntax: 'baseprojectile.fullstartingmagazine "0/1"', desc: "Toggle full starting magazine." },
                { syntax: 'baseprojectile.infiniteammo "0/1"', desc: "Toggle infinite ammo." },
                { syntax: 'craft.adddefaultblueprint "shortname"', desc: "Add default blueprint on spawn." },
                { syntax: 'craft.removedefaultblueprint "shortname"', desc: "Remove default blueprint." },
                { syntax: 'craft.listdefaultblueprint', desc: "List default blueprints." },
                { syntax: 'ai.killanimals', desc: "Kill all animals." },
                { syntax: 'ai.killscientists', desc: "Kill all scientists." },
                { syntax: 'construct.demolishhammer "0/1"', desc: "Toggle demolish hammer." },
                { syntax: 'construct.freeconstruction "0/1"', desc: "Toggle free building." },
                { syntax: 'construct.freeupgrading "0/1"', desc: "Toggle free upgrading." },
                { syntax: 'servermgr.numsleepingplayers', desc: "Show number of sleeping players." },
                { syntax: 'env.progresstime "0/1"', desc: "Stop time progression." },
                { syntax: 'env.time "int"', desc: "Set time." },
                { syntax: 'craft.itemcookspeedmultiplier scale', desc: "Scale cooking speed." },
                { syntax: 'craft.basecraftspeed "int"', desc: "Set base crafting speed." },
                { syntax: 'Spawn.fill_groups', desc: "Reset loot and AIs." },
                { syntax: 'junkpile.getjunkpilecounts', desc: "Print junkpile counts." },
                { syntax: 'ui.showbasestatsui', desc: "Show base upkeep stats." },
                { syntax: 'ai.npc_junkpilespawn_chance', desc: "Set scientist spawn chance at junkpiles." },
                { syntax: 'ai.npc_max_junkpile_count', desc: "Set max scientists at junkpiles." },
                { syntax: 'attackentity.npc_aimconescale “number”', desc: "Scale AI aim cone." },
                { syntax: 'attackentity.npc_attackcooldownscale “number”', desc: "Scale AI attack cooldown." },
                { syntax: 'attackentity.npc_attacklengthscale “number”', desc: "Scale AI attack length." },
                { syntax: 'attackentity.npc_attackspacingscale “number”', desc: "Scale AI attack spacing." },
                { syntax: 'attackentity.npc_damagescale “number”', desc: "Scale AI damage." },
                { syntax: 'attackentity.set_easy_ai', desc: "Set AI to easy mode." },
                { syntax: 'attackentity.set_normal_ai', desc: "Set AI to normal." },
                { syntax: 'gamemodesoftcore.reclaim_fraction_belt 0.5', desc: "Set belt reclaim fraction." },
                { syntax: 'gamemodesoftcore.reclaim_fraction_main 0.5', desc: "Set main reclaim fraction." },
                { syntax: 'gamemodesoftcore.reclaim_fraction_wear 0', desc: "Set wear reclaim fraction." },
                { syntax: 'reclaimmanager.reclaim_expire_minutes 120', desc: "Set reclaim expiry." },
                { syntax: 'env.nightlight_distance 7', desc: "Set nightlight distance." },
                { syntax: 'env.nightlight_brightness 0.0175', desc: "Set nightlight brightness." }
            ]
        },
        inventory: {
            name: "Inventory",
            commands: [
                { syntax: 'inventory.adddefaultitem "string"', desc: "Add default item on spawn." },
                { syntax: 'inventory.cleardefaultitem', desc: "Clear default items." },
                { syntax: 'inventory.removedefaultitem "string"', desc: "Remove default item." },
                { syntax: 'inventory.give "string" "quantity"', desc: "Give yourself an item." },
                { syntax: 'inventory.giveall "string" "quantity"', desc: "Give everyone an item." },
                { syntax: 'inventory.givedrop "string"', desc: "Drop item in front of you." },
                { syntax: 'inventory.giveto "ID" "string"', desc: "Give item to player." },
                { syntax: 'inventory.resetbp', desc: "Reset everyone's blueprints." },
                { syntax: 'inventory.unlockall', desc: "Unlock all blueprints for you." },
                { syntax: 'inventory.removedroppeditems "item shortname"', desc: "Remove all dropped instances of an item." }
            ]
        },
        zones: {
            name: "Zones",
            commands: [
                { syntax: 'createcustomzone [0] [1] [2] [3] [4] [5] [6] [7] [8] [9]', desc: "Create a custom zone." },
                { syntax: 'editcustomzone "zone name" enabled 0/1', desc: "Toggle zone active." },
                { syntax: 'editcustomzone "zone name" position (x,y,z)', desc: "Set zone center." },
                { syntax: 'editcustomzone "zone name" rotation "number"', desc: "Set zone rotation." },
                { syntax: 'editcustomzone "zone name" type box/sphere', desc: "Set zone shape." },
                { syntax: 'editcustomzone "zone name" size (x,y,z) / "number"', desc: "Set zone size." },
                { syntax: 'editcustomzone "zone name" allowpvpdamage 0/1', desc: "Toggle PvP damage." },
                { syntax: 'editcustomzone "zone name" allownpcdamage 0/1', desc: "Toggle NPC damage." },
                { syntax: 'editcustomzone "zone name" radiationdamage "number"', desc: "Set radiation amount." },
                { syntax: 'editcustomzone "zone name" allowbuildingdamage 0/1', desc: "Toggle building damage." },
                { syntax: 'editcustomzone "zone name" allowbuilding 0/1', desc: "Toggle building allowed." },
                { syntax: 'editcustomzone "zone name" showarea 0/1', desc: "Toggle zone visibility." },
                { syntax: 'editcustomzone "zone name" color (R,G,B)', desc: "Set zone color." },
                { syntax: 'editcustomzone "zone name" showchatmessage 0/1', desc: "Toggle chat messages." },
                { syntax: 'editcustomzone "zone name" entermessage "Text"', desc: "Set enter message." },
                { syntax: 'editcustomzone "zone name" leavemessage "Text"', desc: "Set leave message." },
                { syntax: 'listcustomzones', desc: "List all custom zones." },
                { syntax: 'customzoneinfo "zone name"', desc: "Show zone details." },
                { syntax: 'deletecustomzone "zone name"', desc: "Delete a zone." }
            ]
        },
        scheduler: {
            name: "Scheduler",
            commands: [
                { syntax: 'CreateAction ConVarSchedulerAction [0] [1] [2] [3] [4] [5]', desc: "Create scheduled action." },
                { syntax: 'listactions', desc: "List all actions." },
                { syntax: 'removeaction [ID]', desc: "Remove an action." }
            ]
        }
    };

    monumentIds = {
        "sphere_tank": "Dome",
        "harbor_1": "Small Harbor",
        "harbor_2": "Large Harbor",
        "airfield_1": "Airfield",
        "launch_site_1": "Launch Site",
        "powerplant_1": "Power Plant",
        "trainyard_1": "Train Yard",
        "water_treatment_plant_1": "Water Treatment",
        "lighthouse": "Lighthouse",
        "radtown_small_3": "Sewer Branch",
        "gas_station_1": "Oxum's Gas Station",
        "mining_quarry_a": "Sulfur Quarry",
        "mining_quarry_b": "Stone Quarry",
        "mining_quarry_c": "HQM Quarry",
        "satellite_dish": "Satellite Dish",
        "supermarket_1": "Abandoned Supermarket",
        "oilrig_1": "Large Oil Rig",
        "oilrig_2": "Small Oil Rig",
        "cargoshipdynamic1": "Shipping Cargo",
        "cargoshipdynamic2": "Military Cargo",
        "military_tunnel": "Military Tunnel",
        "underwater_lab": "Underwater Lab",
        "water_well_a": "Water Well A",
        "water_well_b": "Water Well B",
        "water_well_c": "Water Well C",
        "water_well_d": "Water Well D",
        "water_well_e": "Water Well E",
        "warehouse": "Mining Outpost",
        "junkyard_1": "Junkyard"
    };

    // ---------- Initialization ----------
    init() {
        this.createHTML();
        this.attachEvents();
        window.addEventListener('tab-changed', (e) => {
            if (e.detail.tab === 'resources') {
                this.refresh();
            }
        });
    }

    createHTML() {
        const tab = document.getElementById('tab-resources');
        if (!tab) return;
        if (!this.access.hasRole('master')) {
            tab.innerHTML = '<div class="access-denied">Master access required</div>';
            return;
        }

        tab.innerHTML = `
            <div class="resources-container">
                <div class="resources-header">
                    <h2>📚 Knowledge Base & Commands</h2>
                    <div class="resources-search">
                        <input type="text" id="resources-global-search" placeholder="Search everything...">
                    </div>
                </div>

                <div class="resources-tabs">
                    <button class="resources-tab active" data-tab="build">🏗️ Build & Raid</button>
                    <button class="resources-tab" data-tab="monuments">🏛️ Monuments</button>
                    <button class="resources-tab" data-tab="items">📦 Items</button>
                    <button class="resources-tab" data-tab="commands">⚡ Commands</button>
                    <button class="resources-tab" data-tab="utilities">🔧 Utilities</button>
                </div>

                <!-- Build & Raid Tab -->
                <div id="resources-build" class="resources-tab-content active">
                    <div class="build-subtabs">
                        <button class="build-subtab active" data-subtab="build">Build Costs</button>
                        <button class="build-subtab" data-subtab="raid">Raid Costs</button>
                    </div>
                    <div id="build-costs" class="build-subcontent active"></div>
                    <div id="raid-costs" class="build-subcontent"></div>
                </div>

                <!-- Monuments Tab -->
                <div id="resources-monuments" class="resources-tab-content"></div>

                <!-- Items Tab -->
                <div id="resources-items" class="resources-tab-content">
                    <div class="items-controls">
                        <input type="text" id="items-search" placeholder="Search items...">
                        <select id="items-category-filter">
                            <option value="all">All Categories</option>
                            <option value="Ammo">Ammo</option>
                            <option value="Weapons">Weapons</option>
                            <option value="Construction">Construction</option>
                            <option value="Items">Items</option>
                            <option value="Resources">Resources</option>
                            <option value="Attire">Attire</option>
                            <option value="Tools">Tools</option>
                            <option value="Medical">Medical</option>
                            <option value="Food">Food</option>
                            <option value="Traps">Traps</option>
                            <option value="Misc">Misc</option>
                            <option value="Components">Components</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Animals">Animals</option>
                            <option value="Vehicles">Vehicles</option>
                            <option value="Vehicle Parts">Vehicle Parts</option>
                            <option value="Seasonal">Seasonal</option>
                        </select>
                    </div>
                    <div id="items-list" class="items-database"></div>
                </div>

                <!-- Commands Tab -->
                <div id="resources-commands" class="resources-tab-content">
                    <div class="commands-controls">
                        <select id="commands-category" class="commands-category">
                            ${Object.keys(this.commandCategories).map(key => `<option value="${key}">${this.commandCategories[key].name}</option>`).join('')}
                        </select>
                        <input type="text" id="commands-search" placeholder="Filter commands...">
                    </div>
                    <div id="commands-list" class="commands-list"></div>
                </div>

                <!-- Utilities Tab -->
                <div id="resources-utilities" class="resources-tab-content">
                    <div class="utilities-grid">
                        <div class="utility-card">
                            <h3>Camera IDs</h3>
                            <div class="camera-ids"></div>
                        </div>
                        <div class="utility-card">
                            <h3>Frequency Codes</h3>
                            <div class="frequency-codes"></div>
                        </div>
                        <div class="utility-card">
                            <h3>Electrical Consumption</h3>
                            <div class="electrical-consumption"></div>
                        </div>
                        <div class="utility-card">
                            <h3>Power Supply</h3>
                            <div class="power-supply"></div>
                        </div>
                        <div class="utility-card">
                            <h3>Battery Storage</h3>
                            <div class="battery-storage"></div>
                        </div>
                        <div class="utility-card">
                            <h3>Monument IDs</h3>
                            <div class="monument-ids"></div>
                        </div>
                        <div class="utility-card">
                            <h3>Server Name Color Generator</h3>
                            <div class="color-generator"></div>
                        </div>
                    </div>
                </div>

                <!-- Command Execution Modal -->
                <div id="command-exec-modal" class="modal hidden">
                    <div class="modal-content">
                        <h3 id="exec-modal-title">Execute Command</h3>
                        <div id="exec-modal-params"></div>
                        <div class="modal-actions">
                            <button id="exec-modal-run" class="resources-btn primary">Execute</button>
                            <button id="exec-modal-cancel" class="resources-btn">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderBuildCosts();
        this.renderRaidCosts();
        this.renderMonuments();
        this.renderItems();
        this.renderCommands();
        this.renderUtilities();
    }

    attachEvents() {
        // Tab switching
        document.querySelectorAll('.resources-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.resources-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.resources-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`resources-${e.target.dataset.tab}`).classList.add('active');
            });
        });

        // Build sub‑tabs
        document.querySelectorAll('.build-subtab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.build-subtab').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.build-subcontent').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                const sub = e.target.dataset.subtab;
                document.getElementById(sub === 'build' ? 'build-costs' : 'raid-costs').classList.add('active');
            });
        });

        // Items search
        document.getElementById('items-search')?.addEventListener('input', () => this.renderItems());
        document.getElementById('items-category-filter')?.addEventListener('change', () => this.renderItems());

        // Commands category change / search
        document.getElementById('commands-category')?.addEventListener('change', () => this.renderCommands());
        document.getElementById('commands-search')?.addEventListener('input', () => this.renderCommands());

        // Global search (simplified – just switch to appropriate tab? We'll implement later)
        document.getElementById('resources-global-search')?.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            // For now, just filter visible content? Not trivial. We'll leave as placeholder.
        });

        // Modal buttons
        document.getElementById('exec-modal-cancel')?.addEventListener('click', () => {
            document.getElementById('command-exec-modal').classList.add('hidden');
        });
        document.getElementById('exec-modal-run')?.addEventListener('click', () => this.executeCommandFromModal());

        // Delegate for command execute buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('cmd-exec-btn')) {
                const cmd = e.target.dataset.cmd;
                const params = e.target.dataset.params ? e.target.dataset.params.split(',') : [];
                this.openCommandModal(cmd, params);
            }
        });
    }

    // ---------- Rendering Methods ----------
    renderBuildCosts() {
        const container = document.getElementById('build-costs');
        if (!container) return;
        let html = '<table class="costs-table"><tr><th>Building Part</th><th>Wood</th><th>Stone</th><th>Metal</th><th>HQM</th></tr>';
        const allParts = Object.keys(this.buildCosts.wood);
        allParts.sort().forEach(part => {
            html += `<tr>
                <td>${part}</td>
                <td>${this.buildCosts.wood[part]}</td>
                <td>${this.buildCosts.stone[part]}</td>
                <td>${this.buildCosts.metal[part]}</td>
                <td>${this.buildCosts.hqm[part]}</td>
            </tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    }

    renderRaidCosts() {
        const container = document.getElementById('raid-costs');
        if (!container) return;
        const explosives = ['timed', 'rocket', 'explo', 'satchel', 'hegrenade'];
        const explosiveNames = { timed: 'Timed', rocket: 'Rocket', explo: 'Explo Ammo', satchel: 'Satchel', hegrenade: 'HE Grenade' };
        const targets = Object.keys(this.raidCosts.timed);
        let html = '<table class="costs-table"><tr><th>Target</th>';
        explosives.forEach(exp => html += `<th>${explosiveNames[exp]}</th>`);
        html += '</tr>';
        targets.sort().forEach(target => {
            html += `<tr><td>${target}</td>`;
            explosives.forEach(exp => {
                const val = this.raidCosts[exp][target];
                html += `<td>${val}</td>`;
            });
            html += '</tr>';
        });
        html += '</table>';
        container.innerHTML = html;
    }

    renderMonuments() {
        const container = document.getElementById('resources-monuments');
        if (!container) return;
        let html = '<table class="monuments-table"><tr><th>Name</th><th>Radiation</th><th>Card</th><th>Puzzle</th><th>Safe Zone</th></tr>';
        this.monuments.sort((a,b) => a.name.localeCompare(b.name)).forEach(m => {
            html += `<tr>
                <td>${m.name}</td>
                <td>${m.rad}</td>
                <td>${m.card}</td>
                <td>${m.puzzle ? '✅' : '❌'}</td>
                <td>${m.safe ? '✅' : '❌'}</td>
            </tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    }

    renderItems() {
        const container = document.getElementById('items-list');
        if (!container) return;
        const search = document.getElementById('items-search')?.value.toLowerCase() || '';
        const category = document.getElementById('items-category-filter')?.value || 'all';
        const items = window.itemsDatabase || []; // fallback to empty
        let filtered = items;
        if (category !== 'all') filtered = filtered.filter(i => i.category === category);
        if (search) filtered = filtered.filter(i => i.name.toLowerCase().includes(search) || i.shortname.toLowerCase().includes(search));
        filtered = filtered.slice(0, 200); // limit for performance
        if (filtered.length === 0) {
            container.innerHTML = '<div class="no-items">No items found</div>';
            return;
        }
        let html = '<table class="items-table"><tr><th>Name</th><th>Shortname</th><th>Category</th></tr>';
        filtered.forEach(item => {
            html += `<tr><td>${item.name}</td><td><code>${item.shortname}</code></td><td>${item.category}</td></tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
    }

    renderCommands() {
        const container = document.getElementById('commands-list');
        if (!container) return;
        const catKey = document.getElementById('commands-category')?.value || 'banitem';
        const search = document.getElementById('commands-search')?.value.toLowerCase() || '';
        const category = this.commandCategories[catKey];
        if (!category) return;
        let filtered = category.commands.filter(cmd => 
            cmd.syntax.toLowerCase().includes(search) || cmd.desc.toLowerCase().includes(search)
        );
        let html = `<h3>${category.name}</h3>`;
        filtered.forEach(cmd => {
            const params = this.extractParams(cmd.syntax);
            // Escape HTML in syntax to prevent injection (e.g., <color> tags)
            const escapedSyntax = cmd.syntax.replace(/</g, '&lt;').replace(/>/g, '&gt;');
            html += `
                <div class="command-item">
                    <code>${escapedSyntax}</code>
                    <span class="cmd-desc">${cmd.desc}</span>
                    <button class="small-btn cmd-exec-btn" data-cmd="${this.escapeAttr(cmd.syntax)}" data-params="${params.join(',')}">Execute</button>
                </div>
            `;
        });
        container.innerHTML = html;
    }

    renderUtilities() {
        // Camera IDs
        const cameraDiv = document.querySelector('.camera-ids');
        if (cameraDiv) {
            let html = '';
            for (let [mon, ids] of Object.entries(this.cameraIds)) {
                html += `<div><strong>${mon}:</strong> ${ids.join(', ')}</div>`;
            }
            cameraDiv.innerHTML = html;
        }
        // Frequency Codes
        const freqDiv = document.querySelector('.frequency-codes');
        if (freqDiv) {
            let html = '';
            for (let [mon, code] of Object.entries(this.frequencyCodes)) {
                html += `<div><strong>${mon}:</strong> ${code}</div>`;
            }
            freqDiv.innerHTML = html;
        }
        // Electrical Consumption
        const elecDiv = document.querySelector('.electrical-consumption');
        if (elecDiv) {
            let html = '<table><tr><th>Component</th><th>Usage</th></tr>';
            for (let [comp, usage] of Object.entries(this.electricalConsumption)) {
                html += `<tr><td>${comp}</td><td>${usage}</td></tr>`;
            }
            html += '</table>';
            elecDiv.innerHTML = html;
        }
        // Power Supply
        const powerDiv = document.querySelector('.power-supply');
        if (powerDiv) {
            let html = '<table><tr><th>Source</th><th>Output</th></tr>';
            for (let [src, out] of Object.entries(this.powerSupply)) {
                html += `<tr><td>${src}</td><td>${out}</td></tr>`;
            }
            html += '</table>';
            powerDiv.innerHTML = html;
        }
        // Battery Storage
        const battDiv = document.querySelector('.battery-storage');
        if (battDiv) {
            let html = '<table><tr><th>Battery</th><th>Capacity/Output</th></tr>';
            for (let [bat, spec] of Object.entries(this.batteryStorage)) {
                html += `<tr><td>${bat}</td><td>${spec}</td></tr>`;
            }
            html += '</table>';
            battDiv.innerHTML = html;
        }
        // Monument IDs
        const monIdDiv = document.querySelector('.monument-ids');
        if (monIdDiv) {
            let html = '<table><tr><th>ID</th><th>Name</th></tr>';
            for (let [id, name] of Object.entries(this.monumentIds)) {
                html += `<tr><td><code>${id}</code></td><td>${name}</td></tr>`;
            }
            html += '</table>';
            monIdDiv.innerHTML = html;
        }
        // Color Generator
        const colorGenDiv = document.querySelector('.color-generator');
        if (colorGenDiv) {
            colorGenDiv.innerHTML = `
                <p>Use the following in server name or chat messages:</p>
                <div class="form-group">
                    <label>Text:</label>
                    <input type="text" id="color-text" placeholder="Your server name">
                </div>
                <div class="form-group">
                    <label>Color (hex):</label>
                    <input type="color" id="color-picker" value="#FFB100">
                </div>
                <div class="form-group">
                    <label>Result:</label>
                    <input type="text" id="color-result" readonly>
                </div>
                <button id="copy-color-code" class="small-btn">Copy</button>
                <p>For gradients, use <a href="https://www.birdflop.com/resources/rgb/" target="_blank">birdflop RGB generator</a> and select 'Chat (<#rrggbb>)' format.</p>
            `;
            document.getElementById('color-picker')?.addEventListener('input', () => this.updateColorPreview());
            document.getElementById('color-text')?.addEventListener('input', () => this.updateColorPreview());
            document.getElementById('copy-color-code')?.addEventListener('click', () => {
                const result = document.getElementById('color-result');
                result.select();
                document.execCommand('copy');
                toast.success('Copied!');
            });
        }
    }

    updateColorPreview() {
        const text = document.getElementById('color-text').value;
        const color = document.getElementById('color-picker').value;
        const result = `<color=${color}>${text}</color>`;
        document.getElementById('color-result').value = result;
    }

    // Helper to extract parameter placeholders from command syntax
    extractParams(syntax) {
        const regex = /"([^"]+)"|\[([^\]]+)\]|([a-zA-Z0-9_]+)/g;
        const params = [];
        let match;
        while ((match = regex.exec(syntax)) !== null) {
            const val = match[1] || match[2] || match[3];
            if (val && !['kit', 'add', 'remove', 'list', 'info', 'edit', 'delete', 'give', 'giveto', 'giveall', 'banitem', 'unbanitem', 'spawn', 'createcustomzone', 'editcustomzone', 'listcustomzones', 'customzoneinfo', 'deletecustomzone', 'CreateAction', 'listactions', 'removeaction'].includes(val)) {
                params.push(val);
            }
        }
        return params;
    }

    escapeAttr(str) {
        return str.replace(/"/g, '&quot;');
    }

    openCommandModal(cmd, params) {
        const modal = document.getElementById('command-exec-modal');
        const title = document.getElementById('exec-modal-title');
        title.innerText = `Execute: ${cmd}`;
        const paramsDiv = document.getElementById('exec-modal-params');
        paramsDiv.innerHTML = '';
        if (params.length > 0) {
            paramsDiv.innerHTML = '<p>Enter parameters:</p>';
            params.forEach((p, i) => {
                const input = document.createElement('input');
                input.type = 'text';
                input.placeholder = p;
                input.className = 'modal-param-input';
                input.dataset.index = i;
                paramsDiv.appendChild(input);
            });
        } else {
            paramsDiv.innerHTML = '<p>No parameters required. Click Execute to send.</p>';
        }
        modal.dataset.cmd = cmd;
        modal.classList.remove('hidden');
    }

    async executeCommandFromModal() {
        const modal = document.getElementById('command-exec-modal');
        const cmd = modal.dataset.cmd;
        const inputs = document.querySelectorAll('#exec-modal-params .modal-param-input');
        let fullCmd = cmd;
        if (inputs.length > 0) {
            const values = Array.from(inputs).map(inp => inp.value.trim());
            if (values.some(v => v === '')) {
                toast.error('Please fill all parameters');
                return;
            }
            fullCmd = cmd + ' ' + values.join(' ');
        }
        try {
            const result = await ConnectionManager.executeCommand(fullCmd);
            toast.success('Command executed');
            if (result) toast.info(`Result: ${result.substring(0, 200)}`);
        } catch (err) {
            toast.error(`Failed: ${err.message}`);
        }
        modal.classList.add('hidden');
    }

    refresh() {
        const activeTab = document.querySelector('.resources-tab.active')?.dataset.tab || 'build';
        if (activeTab === 'build') {
            this.renderBuildCosts();
            this.renderRaidCosts();
        } else if (activeTab === 'monuments') {
            this.renderMonuments();
        } else if (activeTab === 'items') {
            this.renderItems();
        } else if (activeTab === 'commands') {
            this.renderCommands();
        } else if (activeTab === 'utilities') {
            this.renderUtilities();
        }
    }
}

// Initialize when tablet is ready
document.addEventListener('DOMContentLoaded', () => {
    window.resources = new Resources();
});