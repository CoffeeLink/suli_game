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

class EnemyDifficultyInfo extends Resource {
    constructor() {
        super();

        // Health
        this.health_base = 100;
        this.health_multiplier = 1;
        this.health_multiplier_per_wave = 0.2;

        // Damage
        this.damage_base = 30;
        this.damage_multiplier = 1;
        this.damage_multiplier_per_wave = 0.3;

        // fire rate
        this.firerate_base = 600;
        this.firerate_multiplier = 1;
        this.firerate_multiplier_per_wave = -0.05;
        this.firerate_min = 200;

        // bullet speed
        this.bullet_speed_base = -640;
        this.bullet_speed_multiplier = 1;
        this.bullet_speed_multiplier_per_wave = 0.05;
        this.bullet_speed_max = -800;

        // movement_speed
        this.speed_base = 100;
        this.speed_base_multiplier = 1;
        this.speed_multiplier_per_wave = 0.08;
        this.speed_max = 300;

    }
}