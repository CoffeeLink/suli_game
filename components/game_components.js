class Player extends Component {}
class Health extends Component {
    constructor(health = 100) {
        super();

        this.health = health;
    }
}

class Bullet extends Component {
    constructor(damage, velocity_x, velocity_y) {
        super();

        this.damage = damage;
        this.vx = velocity_x;
        this.vy = velocity_y;
    }
}

class Enemy extends Component {
    constructor(fire_rate = 1, fire_chance = 0.8, bullet_to_clone, movement_rate = 100) {
        super();

        this.fire_rate = fire_rate;
        this.fire_chance = fire_chance;
        this.bullet_to_clone = bullet_to_clone;
        this.movement_rate = movement_rate;

    }
}