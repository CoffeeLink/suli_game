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
            let col = entity.get_comp(Collider2D);

            for (let e of col.colliding_with) {
                if (e.get_comp(MapWall) == null) {
                    continue
                }

                let wall = e.get_comp(MapWall);

                if (wall.side) {
                    pos.x -= speed * (time.delta_time / 1000);
                } else if (! wall.side){
                    pos.x += speed * (time.delta_time / 1000);
                }

            }

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
                new Sprite2D(laser_img, 0, 0, 0),
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
        this.stats = null;
    }

    run_system(commands, resources, matched_entities) {
        if (this.time == null) {
            this.time = resources.get(TimeResource);
        }

        if (this.stats == null) {
            this.stats = resources.get(GameState);
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

                resources.get(AudioManager).play("/assets/sfx/hitHurt.wav");

                commands.delete_entity(other);
            }

            if (health.health <= 0) { // dead
                commands.delete_entity(e);
                this.stats.kills += 1;
                this.stats.enemies_remaining -= 1;

                resources.get(AudioManager).play("/assets/sfx/explosion.wav")

                if (this.stats.enemies_remaining === 0) {
                    commands.queue_event(UpgradeMenu);
                }

                continue;
            }

            // update last fired
            enemy.last_fired += this.time.delta_time;

            // try to fire

            if (enemy.last_fired > enemy.fire_interval) {
                if (Math.random() > enemy.fire_chance) {
                    let b = commands.spawn(
                        new EnemyBullet,
                        new Bullet(30, 0, 250),
                        dog_bullet_sprite,
                    );

                    let b_pos = b.get_comp(Transform);
                    let b_sprite = b.get_comp(Sprite2D);

                    b.get_comp(Sprite2D).layer = -1;

                    b_pos.x = pos.x + cannon.offset_x;
                    b_pos.y = pos.y + cannon.offset_y;

                    b_sprite.scale = 0.5;
                }
                enemy.last_fired = 0;
            }

            // move

            // change to looking for walls

            let collision_state = 0;

            for (let col_e of col.colliding_with) {
                let wall = col_e.get_comp(MapWall);
                let other_enemy = col_e.get_comp(Enemy);

                if (!wall && !other_enemy) {
                    continue;
                }

                let other_pos = col_e.get_comp(Transform);
                if (other_pos.x > e.get_comp(Transform).x) {
                    collision_state = 1;
                } else if (other_pos.x < e.get_comp(Transform).x) {
                    collision_state = 2;
                }
            }

            if (collision_state === 1) {
                enemy.reverse_movement = true;
            } else if (collision_state === 2) {
                enemy.reverse_movement = false;
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

class WaveSpawner extends System {200
    constructor() {
        super();

        this.needs_entities = false;
        this.on_event = WaveSpawn;

        this.game_state = null;
    }

    run_system(commands, resources, matched_entities) {
        if (this.game_state === null) {
            this.game_state = resources.get(GameState);
        }

        this.game_state.enemies_remaining += 6;

        this.spawn_basic_enemy(0, 0, 600, 0.9, 100, 100, 0 ,0,commands);
        this.spawn_basic_enemy(200, 0, 600, 0.9, 100, 100, 0 ,0,commands);
        this.spawn_basic_enemy(400, 0, 600, 0.9, 100, 100, 0 ,0,commands);
        this.spawn_basic_enemy(600, 0, 600, 0.9, 100, 100, 0 ,0,commands);
        this.spawn_basic_enemy(100, 150, 600, 0.9, 100, 100, 0 ,0,commands);
        this.spawn_basic_enemy(300, 150, 600, 0.9, 100, 100, 0 ,0,commands);

        this.game_state.wave += 1;
    }

    spawn_basic_enemy(x, y, fire_rate, fire_chance, speed, health, c_ox, c_oy, commands) {
        let e = commands.spawn(
            new Enemy(fire_rate, fire_chance, speed * this.game_state.difficulty_multiplier),
            new Health(health * this.game_state.difficulty_multiplier),
            new Cannon(c_ox, c_oy),
            dog_components,
        );
        e.get_comp(Transform).x = x;
        e.get_comp(Transform).y = y;
    }
}

class PostWaveHandler extends System {
    constructor() {
        super();

        this.needs_entities = false;
    }

    run_system(commands, resources, matched_entities) {

        let player_stats = resources.get(PlayerStats);

        let UI_elements = [];

        resources.get(AudioManager).play("/assets/sfx/pickupCoin.wav")

        const clearUI = () => {
            for (let ent of UI_elements) {
                commands.delete_entity(ent);
            }

            resources.get(AudioManager).play("/assets/sfx/pickupCoin.wav")
        }

        const postUpgrade = () => {
            clearUI();
            commands.queue_event(WaveSpawn);
        }

        UI_elements.push(
            commands.spawn(
            new Transform(100, 200),
            new UIText("Chose an Upgrade!", 45, "green"),
        ));

        UI_elements.push(
            commands.spawn(
                new Transform(100, 100),
                new UIText("Wave Complete!", 55, "yellow"),
            ));

        UI_elements.push(
            commands.spawn(
            new Transform(90, 90),
            new UIBox("rgba(127, 127, 127, 0.5)", 500, 550, 0, -50)),
        );

        let upgrade_1 = commands.spawn(
            new Transform(100, 250),
            new UIText("Damage (" + player_stats.level_dmg + ")", 35, "cyan"),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow";
                resources.get(AudioManager).play("/assets/sfx/select_ui.wav");
                },
                (e) => e.get_comp(UIText).color = "cyan",
                () => {
                    // Upgrade dmg

                    postUpgrade()
            })
        )

        let upgrade_2 = commands.spawn(
            new Transform(100, 300),
            new UIText("Fire rate (" + player_stats.level_fire_rate + ")", 35, "cyan"),
            new UIElement((e) => {
                    e.get_comp(UIText).color = "yellow";
                    resources.get(AudioManager).play("/assets/sfx/select_ui.wav");
                },
                (e) => e.get_comp(UIText).color = "cyan",
                () => {
                    // Upgrade speed

                    postUpgrade()
                })
        );

        let upgrade_3 = commands.spawn(
            new Transform(100, 350),
            new UIText("Bullet speed (" + player_stats.level_bullet_speed + ")", 35, "cyan"),
            new UIElement((e) => {
                    e.get_comp(UIText).color = "yellow";
                    resources.get(AudioManager).play("/assets/sfx/select_ui.wav");
                },
                (e) => e.get_comp(UIText).color = "cyan",
                () => {
                    // Upgrade speed

                    postUpgrade()
                })
        )

        let upgrade_4 = commands.spawn(
            new Transform(100, 400),
            new UIText("Health (" + player_stats.level_health + ")", 35, "cyan"),
            new UIElement((e) => {
                    e.get_comp(UIText).color = "yellow";
                    resources.get(AudioManager).play("/assets/sfx/select_ui.wav");
                },
                (e) => e.get_comp(UIText).color = "cyan",
                () => {
                    // Upgrade dmg

                    postUpgrade()
                })
        )

        let upgrade_5 = commands.spawn(
            new Transform(100, 450),
            new UIText("Speed (" + player_stats.level_speed + ")", 35, "cyan"),
            new UIElement((e) => {
                    e.get_comp(UIText).color = "yellow";
                    resources.get(AudioManager).play("/assets/sfx/select_ui.wav");
                },
                (e) => e.get_comp(UIText).color = "cyan",
                () => {
                    // Upgrade dmg

                    postUpgrade()
                })
        )

        let upgrade_6 = commands.spawn(
            new Transform(100, 500),
            new UIText("Regeneration (" + player_stats.level_regen + ")", 35, "cyan"),
            new UIElement((e) => {
                    e.get_comp(UIText).color = "yellow";
                    resources.get(AudioManager).play("/assets/sfx/select_ui.wav");
                },
                (e) => e.get_comp(UIText).color = "cyan",
                () => {
                    // Upgrade dmg

                    postUpgrade()
                })
        )

        // Link UI

        upgrade_1.get_comp(UIElement).selected = true;
        upgrade_1.get_comp(UIElement).under = upgrade_2;

        upgrade_2.get_comp(UIElement).above = upgrade_1;
        upgrade_2.get_comp(UIElement).under = upgrade_3;

        upgrade_3.get_comp(UIElement).above = upgrade_2;
        upgrade_3.get_comp(UIElement).under = upgrade_4;

        upgrade_4.get_comp(UIElement).above = upgrade_3;
        upgrade_4.get_comp(UIElement).under = upgrade_5;

        upgrade_5.get_comp(UIElement).above = upgrade_4;
        upgrade_5.get_comp(UIElement).under = upgrade_6;

        upgrade_6.get_comp(UIElement).above = upgrade_5;

        UI_elements.push(
            upgrade_1, upgrade_2, upgrade_3, upgrade_4, upgrade_5, upgrade_6
        );
    }
}

class PlayerDamageSystem extends System {
    constructor() {
        super();
        this.required_components = [Player, Collider2D, Health];

        this.only_takes_active_scene_entities = true;
    }

    run_system(commands, resources, matched_entities) {
        for (let player of matched_entities) {
            let colider = player.get_comp(Collider2D);

        }
    }
}