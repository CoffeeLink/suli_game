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
const cat_food = document.getElementById("cat_food");
const dog_food = document.getElementById("dog_food");

let dog_components = new Sprite(0, 0, dog_img, -16, -26, 0, 115, 80);
let cat_components = new Sprite(250, 716, cat0_img, -21, -20, 1, 104, 85);

class StartSystem extends System {
    constructor() {
        super();
        this.needs_entities = false;
    }
    run_system(commands, resources, matched_entities) {
        commands.set_scene(SCENE_MENU_ID);

        commands.spawn(new Transform(10, 100), new UIText("Macs Attack!", 50));

    }
}

// add systems
app.add_system_group(new CoreSystemGroup);
app.add_system(Startup, new StartSystem);

app.run()

// TODO:
//  - Sound?,
//  - Particles??