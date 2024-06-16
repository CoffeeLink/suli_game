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
app.add_resource(PlayerStats, new PlayerStats);
app.add_resource(GameState, new GameState);
app.add_resource(Settings, new Settings);
app.add_resource(AudioManager, new AudioManager(app.resources.get(Settings))) // silly ref :3

const SCENE_MENU_ID = app.new_scene();
const SCENE_SETTINGS_ID = app.new_scene();

const SCENE_SOLO_ID = app.new_scene();
const SCENE_SOLO_UPGRADES_ID = app.new_scene();
const SCENE_SOLO_GAME_OVER_ID = app.new_scene();

const dog_img = document.getElementById("dog0_img");
const cat0_img = document.getElementById("cat0_img");

const cat1_img = document.getElementById("cat1_img");

const cat_food_img = document.getElementById("cat_food");
const dog_food_img = document.getElementById("dog_food");
const laser_img = document.getElementById("laser");

const laser_sfx = new Audio("/assets/sfx/laserShoot.wav");

const map_wall_width = 10;

let dog_components = new Sprite(0, 0, dog_img, -16, -26, 0, 115, 80);
let player = new Sprite(250, 716, cat0_img, -21, -20, 1, 104, 85);

let dog_bullet_sprite = new Sprite(0, 0, dog_food_img, -10, -13, 1, 35, 50);

class GameStartEvent extends Event {}
class WaveSpawn extends Event {}
class UpgradeMenu extends Event {}

class StartSystem extends System {
    constructor() {
        super();
        this.needs_entities = false;
    }

    create_ui(commands) {
        commands.spawn(new Transform(10, 100), new UIText("Macs Attack!", 50, "white"));

        let base_ui = commands.spawn(
            new Transform(10, 200),
            new UIText("New Game", 30, "yellow"),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow"
                new Audio("/assets/sfx/select_ui.wav").play().catch();
            }, (e)=> {
                e.get_comp(UIText).color = "white"

            }, () => {
                commands.queue_event(GameStartEvent)
                commands.set_scene(SCENE_SOLO_ID);
                commands.queue_event(WaveSpawn)
                // spawn player

                // PLAYER #####################<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>yy

                commands.spawn(
                    new Player,
                    new Health(10000),
                    new Cannon(30, -10),
                    player,
                );

                // spawn 2 walls

                commands.spawn(
                    new Transform(0, 0),
                    new Collider2D(map_wall_width, canvas.height),
                    new MapWall,
                );

                commands.spawn(
                    new Transform(canvas.width - map_wall_width, 0),
                    new Collider2D(map_wall_width , canvas.height),
                    new MapWall(true), // jobb oldal
                );

            }));
        let base_uie = base_ui.get_comp(UIElement);
        base_uie.selected = true;

        let coop_select = commands.spawn(
            new Transform(10, 240),
            new UIText("Co-op",30, "white"),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow"
                new Audio("/assets/sfx/select_ui.wav").play().catch();
            }, (e) => {
                e.get_comp(UIText).color = "white"
            }, () => {
                console.log("Co-op");
            })
        );

        let coop_uie = coop_select.get_comp(UIElement);

        coop_uie.above = base_ui;
        base_uie.under = coop_select;

        let options = commands.spawn(
            new Transform(10, 280),
            new UIText("Options", 30, "white"),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow"
                new Audio("/assets/sfx/select_ui.wav").play().catch();
            }, (e) => {
                e.get_comp(UIText).color = "white"
            }, () => {
                console.log("Options")
            })
        )

        let options_uie = options.get_comp(UIElement);

        options_uie.above = coop_select;
        coop_uie.under = options;

        let credits_select = commands.spawn(
            new Transform(10, 320),
            new UIText("Credits", 30, "white"),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow";
                new Audio("/assets/sfx/select_ui.wav").play().catch();
            }, (e) => {
                e.get_comp(UIText).color = "white";
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

// add systems
app.add_system_group(new CoreSystemGroup);
app.add_system(Startup, new StartSystem);
app.add_system(Update, new PlayerMovement);
app.add_system(Update, new PlayerActions);
app.add_system(Update, new BulletMovement);
app.add_system(Update, new EnemyActions);
app.add_system(WaveSpawn, new WaveSpawner)
app.add_system(UpgradeMenu, new PostWaveHandler)
app.add_system(Update, new PlayerDamageSystem());


app.run()

// TODO:
//  - Sound?,
//  - Particles??