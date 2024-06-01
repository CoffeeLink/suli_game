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

class StartSystem extends System {
    constructor() {
        super();
        this.needs_entities = false;
    }
    run_system(commands, resources, matched_entities) {
        commands.spawn(new Transform(0, 100), new Sprite2D(image, -16, -26));
        commands.spawn(new Transform(20, 200), new Sprite2D(image, -16, -26));
        commands.spawn(new Transform(20, 10), new Sprite2D(image, -16, -26, 1), new Player, new Collider2D(115, 80));
        commands.spawn(new Transform(100, 0), new Sprite2D(image, -16, -26), new Collider2D(115, 80));
        commands.spawn(new Transform(200, 200), new Sprite2D(image, -16, -26));

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
app.add_system(FrameStart, new TimeUpdateSystem());

app.add_system(Startup, new StartSystem);

app.add_system(PreUpdate, new RenderPreClear);
app.add_system(PreUpdate, new InputUpdaterSystem);
app.add_system(Update, new Collider2dSystem);
app.add_system(Update, new PlayerMovement);

app.add_system(Render, new Sprite2dRenderer);

app.run()

// TODO:
//  - UI,
//  - Scenes,
//  - Sound?,
//  - score,