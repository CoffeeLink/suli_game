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


        console.log("Frame rate: " + Math.round(time.frame_rate));
    }
}
