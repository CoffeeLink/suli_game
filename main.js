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
        commands.spawn(dog_components).get_comp(Transform).x = 100;
        commands.spawn(dog_components).get_comp(Transform).x = 220;
        commands.spawn(dog_components);
        commands.spawn(dog_components).get_comp(Transform).x = 340;
        commands.spawn(dog_components).get_comp(Transform).x = 460;

        commands.spawn(cat_components, new Player);
    }
}
class Player extends Component {}
class PlayerMovement extends System {
    constructor() {
        super();

        this.required_components = [Player, Transform];
        this.on_event = Update;
    }

    run_system(commands, resources, matched_entities) {
        const input_res = resources.get(InputResource);
        const time = resources.get(TimeResource);
        for (let entity of matched_entities) {
            let pos = entity.get_comp(Transform);
            if (input_res.is_down("a")) {
                pos.x -= 200 * time.delta_time / 1000;
            }
            if (input_res.is_down("d")) {
                pos.x += 200 * time.delta_time / 1000;
            }
        }
    }
}

// add systems
app.add_system_group(new CoreSystemGroup);
app.add_system(Startup, new StartSystem);
app.add_system(Update, new PlayerMovement)

app.run()

// TODO:
//  - GameStateManager (Resource and System)
//  - Sound?,