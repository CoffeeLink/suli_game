class Player extends Component {}
class Health extends Component {
    constructor(health = 100) {
        super();

        this.health = health;
    }
}

class EnemyBullet extends Component {}

class Bullet extends Component {
    constructor(damage, velocity_x = 0, velocity_y = 0, offset_x = 0, offset_y = 0) {
        super();

        this.damage = damage;
        this.vx = velocity_x;
        this.vy = velocity_y;

        this.offset_x = offset_x;
        this.offset_y = offset_y;
    }
}

class Enemy extends Component {
    constructor(fire_interval = 1, fire_chance = 0.8, movement_rate = 100) {
        super();

        this.reverse_movement = false;
        this.fire_interval = fire_interval;
        this.fire_chance = fire_chance;
        this.last_fired = 0;
        this.movement_rate = movement_rate;
    }
}

class Cannon extends Component {
    constructor(offset_x = 0, offset_y = 0) {
        super();

        this.offset_x = offset_x;
        this.offset_y = offset_y;
    }
}

class EnemyCannon extends Component {
    constructor(Bullet, offset_x = 0, offset_y = 0) {
        super();

        this.Bullet = Bullet; // The bullet to instance
        this.offset_x = offset_x;
        this.offset_y = offset_y;
    }
}