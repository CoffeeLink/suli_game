class GameState extends Resource {
    constructor() {
        super();

        this.wave = 0;

        this.score = 0;
        this.enemies_remaining = 0;
        this.kills = 0;

        this.difficulty_multiplier = 1;

    }
}

class Settings extends Resource {
    constructor() {
        super();

        this.volume = 100; // 100% volume

        this.move_left = "a";
        this.move_right = "d";
        this.shoot = " ";
        this.activate_super = "f";

        this.select_menu = "Enter";

        this.menu_up = "ArrowUp";
        this.menu_down = "ArrowDown";

        this.menu_right = "ArrowRight";
        this.menu_Left = "ArrowLeft";
    }
}

class PlayerStats extends Resource {
    constructor() {
        super();

        this.player_speed = 200;

        this.fire_interval = 600;
        this.damage = 60;

        this.weapon_mode = 1;

        this.in_super = false;
        this.super_remaining = 0;

        this.super_level = 0; // needs 1000 to be active;

        this.level_dmg = 1;
        this.level_health = 1;
        this.level_regen = 1;
        this.level_speed = 1;
        this.level_fire_rate = 1;
        this.level_bullet_speed = 1;
    }
}

class AudioManager extends Resource {
    constructor(settings_resource) {
        super();

        this.settings = settings_resource;

    }
    play(url) {
        let sfx = new Audio(url);
        sfx.volume = this.settings.volume / 100;
        sfx.play().catch();
    }
}