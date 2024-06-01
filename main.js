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

const image = document.getElementById("test_image");


class Sprite extends ComponentGroup {
    constructor(x, y, texture, ox = 0, oy = 0, layer = 0, w = 0, h = 0) {
        super();

        this.x = x;
        this.y = y;
        this.texture = texture;

        this.ox = ox;
        this.oy = oy;
        this.layer = layer;

        this.w = w;
        this.h = h;
    }
    build(entity) {
        entity.add_component(new Transform(this.x, this.y));
        entity.add_component(new Sprite2D(this.texture, this.ox, this.oy, this.layer));
        entity.add_component(new Collider2D(this.w, this.h));
    }
}

let dog_components = new Sprite(0, 0, image, -16, -26, 0, 115, 80);

class StartSystem extends System {
    constructor() {
        super();
        this.needs_entities = false;
    }
    run_system(commands, resources, matched_entities) {
        commands.spawn(dog_components).get_comp(Transform).x = 100;
        commands.spawn(dog_components).get_comp(Transform).x = 220;
        commands.spawn(dog_components, new Player);
        commands.spawn(dog_components).get_comp(Transform).x = 340;
        commands.spawn(dog_components).get_comp(Transform).x = 460;

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
            if (input_res.is_down("w")) {
                pos.y -= 100 * time.delta_time / 1000;
            }
            if (input_res.is_down("s")) {
                pos.y += 100 * time.delta_time / 1000;
            }
            if (input_res.is_down("a")) {
                pos.x -= 100 * time.delta_time / 1000;
            }
            if (input_res.is_down("d")) {
                pos.x += 100 * time.delta_time / 1000;
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
//  - EntityGroups (almost scenes)
//  - Scene Manager
//  - UI,
//  - GameStateManager (Resource and System)
//  - Sound?