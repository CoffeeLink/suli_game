class Sprite2dRenderer extends System {
    constructor() {
        super();
        this.required_components = [Transform, Sprite2D];
        this.on_event = Render;

        this.only_takes_active_scene_entities = true;

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

            if (!rend.visable) {
                continue;
            }

            let new_width = (rend.texture.width * rend.scale);
            let new_height = (rend.texture.height * rend.scale);

            canvas_resource.drawImage(rend.texture, pos.x + rend.offset_x, pos.y + rend.offset_y, new_width, new_height);
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
        this.only_takes_active_scene_entities = true;
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

class UIInteractions extends System {
    constructor() {
        super();

        this.required_components = [UIElement];
        this.only_takes_active_scene_entities = true;
    }

    run_system(commands, resources, matched_entities) {
        if (!matched_entities) {
            return;
        }
        let selected = matched_entities.find((element) => {
            return element.get_comp(UIElement).selected;
        })

        if (!selected) {
            return;
        }

        let input_res = resources.get(InputResource)
        let selected_uie = selected.get_comp(UIElement);

        if (input_res.is_pressed("Enter")) {
            selected_uie.on_use_func(selected);
        }

        if (input_res.is_pressed("ArrowUp") && selected_uie.above !== null) {
            selected_uie.selected = false;
            selected_uie.deselected_func(selected);

            let ent = selected_uie.above;
            let uie = ent.get_comp(UIElement);
            uie.selected = true;
            uie.selected_func(ent);

            console.debug("selected UI: " + selected_uie.above.id);

        } else if (input_res.is_pressed("ArrowDown") && selected_uie.under !== null) {
            selected_uie.selected = false;
            selected_uie.deselected_func(selected);

            let ent = selected_uie.under;
            let uie = ent.get_comp(UIElement);
            uie.selected = true;
            uie.selected_func(ent);

            console.debug("selected UI: " + selected_uie.under.id);

        } else if (input_res.is_pressed("ArrowLeft") && selected_uie.left !== null) {
            selected_uie.selected = false;
            selected_uie.deselected_func(selected);

            let ent = selected_uie.left;
            let uie = ent.get_comp(UIElement);
            uie.selected = true;
            uie.selected_func(ent);

            console.debug("selected UI: " + selected_uie.left.id);

        } else if (input_res.is_pressed("ArrowRight") && selected_uie.right !== null) {
            selected_uie.selected = false;
            selected_uie.deselected_func(selected);

            let ent = selected_uie.right;
            let uie = ent.get_comp(UIElement);
            uie.selected = true;
            uie.selected_func(ent);

            console.debug("selected UI: " + selected_uie.right.id);
        }
    }
}

class TextUIRenderer extends System {
    constructor() {
        super();

        this.required_components = [Transform, UIText];
        this.only_takes_active_scene_entities = true;

        this.canvas_res = null;
    }

    run_system(commands, resources, matched_entities) {
        if (this.canvas_res === null) {
            this.canvas_res = resources.get(CanvasResource);
        }

        let ctx = this.canvas_res.context;
        for (let entity of matched_entities) {
            let pos = entity.get_comp(Transform);
            let text = entity.get_comp(UIText);

            ctx.font = text.size + "px MinecraftFont";
            ctx.fillStyle = text.color || "black";
            ctx.fillText(text.text, pos.x + text.offset_x, pos.y + text.offset_y);
        }
    }
}

class UiBoxRenderer extends System {
    constructor() {
        super();

        this.required_components = [Transform, UIBox];
        this.only_takes_active_scene_entities = true;

        this.canvas_res = null;
    }

    run_system(commands, resources, matched_entities) {
        if (this.canvas_res === null) {
            this.canvas_res = resources.get(CanvasResource);
        }

        let ctx = this.canvas_res.context;
        for (let entity of matched_entities) {
            let pos = entity.get_comp(Transform);
            let box = entity.get_comp(UIBox);

            if (!box.visible) { continue; }

            ctx.fillStyle = box.fill_color || "black";
            ctx.fillRect(pos.x + box.ox, pos.y + box.oy, box.width + box.ox, box.height + box.oy);
        }
    }

}


// holds all systems core to the engine.
class CoreSystemGroup extends SystemGroup {
    build(commands) {
        this.add_system(commands, FrameStart, new TimeUpdateSystem);
        this.add_system(commands, FrameStart, new InputUpdaterSystem);
        this.add_system(commands, PreUpdate, new RenderPreClear);
        this.add_system(commands, Update, new UIInteractions)
        this.add_system(commands, Update, new Collider2dSystem);
        this.add_system(commands, Render, new Sprite2dRenderer);
        this.add_system(commands, Render, new UiBoxRenderer);
        this.add_system(commands, Render, new TextUIRenderer);
    }
}