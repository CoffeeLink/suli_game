class GameState extends Resource {
    constructor() {
        super();

        this.score = 0;
        this.enemies_remaining = 0;

    }
}

class Settings extends Resource {
    constructor() {
        super();

        this.volume = 100; // 100% volume
    }
}

class PlayerStats extends Resource {
    constructor() {
        super();

        this.fire_interval = 600;
        this.player_speed = 200;
    }
}