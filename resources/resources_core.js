class CanvasResource extends Resource {
    constructor(canvas) {
        super();
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }
}

class InputResource extends Resource {
    constructor() {
        super();
        // While the systems are running, this should store all actions then at the end it should be copied to keys_pressed.
        this.keys_pressed_before_update_cyle = new Set();

        // Holds all "registered" key presses.
        this.keys_down_last_frame = new Set
        this.keys_down = new Set();
    }

    is_down(key) {
        return this.keys_down.has(key);
    }

    is_up(key) {
        return !this.keys_down.has(key);
    }

    is_pressed(key) {
        return (!this.keys_down_last_frame.has(key) && this.keys_down.has(key));
    }

    on_key_down(key) {
        this.keys_pressed_before_update_cyle.add(key);
    }

    on_key_up(key) {
        this.keys_pressed_before_update_cyle.delete(key);
    }

    update_keys() {
        this.keys_down_last_frame = this.keys_down;
        this.keys_down = new Set(this.keys_pressed_before_update_cyle);
    }
}

class TimeResource extends Resource {
    constructor() {
        super();

        this.last_timestamp = performance.now();
        this.delta_time = 0;
        this.frame_rate = 0;
    }
}