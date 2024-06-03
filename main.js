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
const laser_texture = document.getElementById("laser");

let dog_components = new Sprite(0, 0, dog_img, -16, -26, 0, 115, 80);
let cat_components = new Sprite(250, 716, cat0_img, -21, -20, 1, 104, 85);

class GameStartEvent extends Event {}

class StartSystem extends System {
    constructor() {
        super();
        this.needs_entities = false;
    }
    run_system(commands, resources, matched_entities) {
        commands.set_scene(SCENE_MENU_ID);

        commands.spawn(new Transform(10, 100), new UIText("Macs Attack!", 50));

        let base_ui = commands.spawn(
            new Transform(10, 200),
            new UIText("New Game", 30, "yellow"),
            new UIElement((e) => {
                e.get_comp(UIText).color = "yellow"
            }, (e)=> {
                e.get_comp(UIText).color = "black"
            }, () => {
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
            }, (e) => {
                console.log("Credits");
            })
        );

        let credits_uie = credits_select.get_comp(UIElement);

        options_uie.under = credits_select;
        credits_uie.above = options;

    }
}

// add systems
app.add_system_group(new CoreSystemGroup);
app.add_system(Startup, new StartSystem);



app.run()

// TODO:
//  - Sound?,
//  - Particles??