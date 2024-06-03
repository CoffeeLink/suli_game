const canvas = document.querySelector('canvas');

//silly input solutions
const input_res = new InputResource();

document.addEventListener('keydown', (event) => {
    event = event || window.event; // Internet Explorer compatibility. (SO-n találtam)
    input_res.on_key_down(event.key);
});

document.addEventListener('keyup', (event) => {
    event = event || window.event;
    input_res.on_key_up(event.key);
})

let app = new EcsApp(60);

// add resources
app.add_resource(CanvasResource, new CanvasResource(canvas))
app.add_resource(InputResource, input_res);

const SCENE_MENU_ID = app.new_scene();
const SCENE_SETTINGS_ID = app.new_scene();

const SCENE_SOLO_ID = app.new_scene();
const SCENE_SOLO_UPGRADES_ID = app.new_scene();
const SCENE_SOLO_GAME_OVER_ID = app.new_scene();

const dog_img = document.getElementById("dog0_img");
const cat0_img = document.getElementById("cat0_img");
const cat_food_img = document.getElementById("cat_food");
const dog_food_img = document.getElementById("dog_food");
const laser_img = document.getElementById("laser");

const laser_sfx = new Audio("/assets/sfx/laserShoot.wav");

let dog_components = new Sprite(0, 0, dog_img, -16, -26, 0, 115, 80);
let player = new Sprite(250, 716, cat0_img, -21, -20, 1, 104, 85);

class GameStartEvent extends Event {}

class StartSystem extends System {
    constructor() {
        super();
        this.needs_entities = false;
    }

    create_ui(commands) {
        commands.spawn(new Transform(10, 100), new UIText("Macs Attack!", 50));

        let base_ui = commands.spawn(
            new Transform(10, 200),
            new UIText("New Game", 30, "yellow"),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow"
            }, (e)=> {
                e.get_comp(UIText).color = "black"
            }, () => {
                commands.queue_event(GameStartEvent)
                commands.set_scene(SCENE_SOLO_ID);
            }));
        let base_uie = base_ui.get_comp(UIElement);
        base_uie.selected = true;

        let coop_select = commands.spawn(
            new Transform(10, 240),
            new UIText("Co-op",30),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow"
            }, (e) => {
                e.get_comp(UIText).color = "black"
            }, () => {
                console.log("Co-op");
            })
        );

        let coop_uie = coop_select.get_comp(UIElement);

        coop_uie.above = base_ui;
        base_uie.under = coop_select;

        let options = commands.spawn(
            new Transform(10, 280),
            new UIText("Options", 30),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow"
            }, (e) => {
                e.get_comp(UIText).color = "black"
            }, () => {
                console.log("Options")
            })
        )

        let options_uie = options.get_comp(UIElement);

        options_uie.above = coop_select;
        coop_uie.under = options;

        let credits_select = commands.spawn(
            new Transform(10, 320),
            new UIText("Credits", 30),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow";
            }, (e) => {
                e.get_comp(UIText).color = "black";
            }, () => {
                console.log("Credits");
            })
        );

        let credits_uie = credits_select.get_comp(UIElement);

        options_uie.under = credits_select;
        credits_uie.above = options;
    }

    run_system(commands, resources, matched_entities) {
        commands.set_scene(SCENE_MENU_ID);
        this.create_ui(commands);


    }
}

class GameStartSystem extends System {
    constructor() {
        super();

        this.needs_entities = false;
    }

    run_system(commands, resources, matched_entities) {
        // spawn player

        commands.spawn(
            new Player,
            new Health(100),
            player,
        )

    }
}

class PlayerMovement extends System {
    constructor() {
        super();

        this.required_components = [Transform, Player];
    }

    run_system(commands, resources, matched_entities) {
        let input = resources.get(InputResource);
        let time = resources.get(TimeResource);

        let speed = 200;
        let adjust = 0;

        if (input.is_down("a")) {
            adjust -= speed * (time.delta_time / 1000); // not the most accurate in an ECS enviorment.
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

class PlayerShooterSystem extends System {
    constructor() {
        super();

        this.required_components = [Player, Transform];

        this.last_fired = 0;
        this.fire_interval = 100;
    }

    run_system(commands, resources, matched_entities) {
        let input = resources.get(InputResource);
        let time = resources.get(TimeResource);

        this.last_fired += time.delta_time;

        if (this.last_fired < this.fire_interval) {
            return;
        }

        if (!input.is_down("g")) {
            return;
        }

        this.last_fired = 0;

        for (let e of matched_entities) {
            let pos = e.get_comp(Transform);

            commands.spawn(
                new Transform(pos.x, pos.y),
                new Sprite2D(laser_img),
                new Bullet(60, 0, -0.4)
            )
            let audio = new Audio("/assets/sfx/laserShoot.wav");
            audio.play().catch();
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

            pos.x += bullet.vx * (1000 / time.delta_time);
            pos.y += bullet.vy * (1000 / time.delta_time);

            if (pos.y < -100) {
                // out of screen, delete

                commands.delete_entity(e);

            }
        }
    }
}

// add systems
app.add_system_group(new CoreSystemGroup);
app.add_system(Startup, new StartSystem);
app.add_system(GameStartEvent, new GameStartSystem);
app.add_system(Update, new PlayerMovement);
app.add_system(Update, new PlayerShooterSystem);
app.add_system(Update, new BulletMovement);



app.run()

// TODO:
//  - Sound?,
//  - Particles??