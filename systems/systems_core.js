class Sprite2dRenderer extends System {
    constructor() {
        super();
        this.required_components = [Transform, Sprite2D];
        this.on_event = Render;

        this.canvas_res = null;
    }
    run_system(commands, resources, matched_entities) {
        if (this.canvas_res == null){
            this.canvas_res = resources.get(CanvasResource);
        }

        let canvas_resource = this.canvas_res.context;

        matched_entities = matched_entities.sort((a, b) => {
            let a_sprite = a.get_comp(Sprite2D);
            let b_sprite = b.get_comp(Sprite2D);
            if (a_sprite.layer > b_sprite.layer) {
                return 1;
            } else if (a_sprite.layer === b_sprite.layer) {
                return 0;
            } else {
                return -1;
            }
        })

        for (let entity of matched_entities) {
            let pos = entity.get_comp(Transform);
            let rend = entity.get_comp(Sprite2D);

            canvas_resource.drawImage(rend.texture, pos.x + rend.offset_x, pos.y + rend.offset_y);
        }
    }
}

class RenderPreClear extends System {
    constructor() {
        super();
        this.required_components = [];
        this.needs_entities = false;
        this.on_event = PreRender;

        // cache canvas
        this.canvas_res = null;
    }
    run_system(commands, resources, matched_entities) {
        if (this.canvas_res == null) {
            this.canvas_res = resources.get(CanvasResource);
        }

        let ctx = this.canvas_res.context;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

class InputUpdaterSystem extends System {
    constructor() {
        super();
        this.required_components = [];
        this.on_event = PreUpdate;
    }
    run_system(commands, resources, matched_entities) {
        let input_res = resources.get(InputResource);
        input_res.update_keys();
    }
}

class TimeUpdateSystem extends System {
    constructor() {
        super();

        this.required_components = [];
        this.on_event = FrameStart;

        this.time_resource = null;
    }

    run_system(commands, resources, matched_entities) {
        if (this.time_resource == null) {
            this.time_resource = resources.get(TimeResource);
        }

        const now = performance.now();
        let time = this.time_resource;

        time.delta_time = now - time.last_timestamp;
        time.frame_rate = 1000 / time.delta_time;
        time.last_timestamp = now;
    }
}

class Collider2dSystem extends System {
    constructor() {
        super();
        this.required_components = [Transform, Collider2D];
    }

    run_system(commands, resources, matched_entities) {
        for (let entity of matched_entities) {
            let pos = entity.get_comp(Transform);
            let col = entity.get_comp(Collider2D);

            // draw rect

            if (col.draw) {
                let ctx = resources.get(CanvasResource).context;
                ctx.beginPath();
                ctx.rect(pos.x, pos.y, col.width, col.height);
                ctx.stroke();
            }
            col.colliding_with.clear();

            for (let other of matched_entities) {
                if (entity.id === other.id) continue;

                let other_pos = other.get_comp(Transform);
                let other_col = other.get_comp(Collider2D);

                if (pos.x < other_pos.x + other_col.width &&
                    pos.x + col.width > other_pos.x &&
                    pos.y < other_pos.y + other_col.height &&
                    pos.y + col.height > other_pos.y) {

                    col.colliding_with.add(other);
                }
            }
        }
    }
}

// holds all systems core to the engine.
class CoreSystemGroup extends SystemGroup {
    build(commands) {
        this.add_system(commands, FrameStart, new TimeUpdateSystem);
        this.add_system(commands, FrameStart, new InputUpdaterSystem);
        this.add_system(commands, PreUpdate, new RenderPreClear);
        this.add_system(commands, Update, new Collider2dSystem);
        this.add_system(commands, Render, new Sprite2dRenderer);
    }
}