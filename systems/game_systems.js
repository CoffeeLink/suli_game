class PlayerMovement extends System {
    constructor() {
        super();

        this.required_components = [Transform, Player];
        this.only_takes_active_scene_entities = true;

        this.player_stats = null;
    }

    run_system(commands, resources, matched_entities) {
        let input = resources.get(InputResource);
        let time = resources.get(TimeResource);

        if (this.player_stats == null) {
            this.player_stats = resources.get(PlayerStats);
        }

        let speed = this.player_stats.player_speed;
        let adjust = 0;

        if (input.is_down("a")) {
            adjust -= speed * (time.delta_time / 1000); // not the most accurate in an ECS environment.
        }
        if (input.is_down("d")) {
            adjust += speed * (time.delta_time / 1000);
        }

        for (let entity of matched_entities) {
            let pos = entity.get_comp(Transform);
            pos.x += adjust;
        }
    }
}

class BulletMovement extends System {
    constructor() {
        super();

        this.required_components = [Bullet, Transform];
        this.only_takes_active_scene_entities = true;
    }

    run_system(commands, resources, matched_entities) {
        let time = resources.get(TimeResource);

        for (let e of matched_entities) {
            let bullet = e.get_comp(Bullet);
            let pos = e.get_comp(Transform);

            pos.x += bullet.vx * (time.delta_time / 1000);
            pos.y += bullet.vy * (time.delta_time / 1000);

            if (pos.y < -100) {
                // out of screen, delete

                commands.delete_entity(e);
            }
        }
    }
}

class PlayerActions extends System {
    constructor() {
        super();

        this.required_components = [Player, Transform, Cannon];
        this.only_takes_active_scene_entities = true;
        this.needs_entities = true;

        this.player_stats = null;
        this.input = null;
        this.time = null;

        this.last_fired = 0;
    }

    run_system(commands, resources, matched_entities) {
        if (this.player_stats == null) {
            this.player_stats = resources.get(PlayerStats);
        }
        if (this.input == null) {
            this.input = resources.get(InputResource);
        }
        if (this.time == null) {
            this.time = resources.get(TimeResource);
        }

        if (matched_entities.length === 0) { return; }

        this.last_fired += this.time.delta_time;

        if (this.last_fired < this.player_stats.fire_interval) {
            return;
        }

        if (!this.input.is_down(" ")) {
            return;
        }

        this.last_fired = 0;

        for (let e1 of matched_entities) {
            let pos = e1.get_comp(Transform);
            let cannon = e1.get_comp(Cannon);

            let e = commands.spawn(
                new Transform(pos.x + cannon.offset_x, pos.y + cannon.offset_y),
                new Bullet(60, 0, -640),
                new Sprite2D(laser_img, 0, 0, 1),
                new Collider2D(32, 32, true),
            );
            e.get_comp(Transform).x = pos.x + cannon.offset_x;
            e.get_comp(Transform).y = pos.y + cannon.offset_y;

            let audio = new Audio("/assets/sfx/laserShoot.wav");
            audio.play().catch();
        }
    }
}

class EnemyActions extends System {
    constructor() {
        super();

        this.required_components = [Enemy, Transform, Cannon, Collider2D, Health];
        this.only_takes_active_scene_entities = true;
        this.needs_entities = true;

        this.time = null;
    }

    run_system(commands, resources, matched_entities) {
        if (this.time == null) {
            this.time = resources.get(TimeResource);
        }

        for (let e of matched_entities) {
            let health = e.get_comp(Health);
            let enemy = e.get_comp(Enemy);
            let pos = e.get_comp(Transform);
            let cannon = e.get_comp(Cannon);
            let col = e.get_comp(Collider2D);

            // check if colliding with a bullet

            for (let other of col.colliding_with) {
                if (other.get_comp(Bullet) == null) {
                    continue;
                }

                if (!!other.get_comp(EnemyBullet)) {
                    continue;
                }

                let bullet = other.get_comp(Bullet);
                health.health -= bullet.damage;

                commands.delete_entity(other);
            }

            if (health.health <= 0) { // dead
                commands.delete_entity(e);
                continue;
            }

            // update last fired
            enemy.last_fired += this.time.delta_time;

            // try to fire

            if (enemy.last_fired > enemy.fire_interval) {
                if (Math.random() > enemy.fire_chance) {
                    commands.spawn(
                        new Transform(pos.x + cannon.offset_x, pos.y + cannon.offset_y),
                        new EnemyBullet,
                        new Bullet(50, 0, 640),
                        new Sprite2D(dog_food_img, 0, 0, 1),
                        new Collider2D(32, 32, true),
                    );
                }
                enemy.last_fired = 0;
            }

            // move

            if (pos.x < 0) {
                enemy.reverse_movement = false;
            }

            if (pos.x > 500) {
                enemy.reverse_movement = true;
            }


            if (enemy.reverse_movement) {
                pos.x -= enemy.movement_rate * (this.time.delta_time / 1000);
            }

            if (!enemy.reverse_movement) {
                pos.x += enemy.movement_rate * (this.time.delta_time / 1000);
            }
        }
    }
}