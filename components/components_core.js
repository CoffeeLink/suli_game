class Transform extends Component {
    constructor(x=0, y=0) {
        super();

        this.x = x;
        this.y = y;
    }
}

class Sprite2D extends Component {
    constructor(texture, offset_x = 0, offset_y = 0, layer = 0) {
        super();

        this.texture = texture;
        this.offset_x = offset_x;
        this.offset_y = offset_y;
        this.layer = layer;

        this.visable = true;
    }
}

class Collider2D extends Component {
    constructor(width, height, draw = false) {
        super();
        this.width = width;
        this.height = height;
        this.draw = draw;

        this.colliding_with = new Set(); // Stores all entities that this entity is colliding with.
    }
}

class UIElement extends Component {
    constructor(selected_func, deselected_func) {
        super();

        this.selected_func = selected_func; // components btw
        this.deselected_func = deselected_func;

        this.selected = false;

        this.above = null;
        this.under = null;
        this.left = null;
        this.right = null;
    }
}

class UIText extends Component {
    constructor(text, size = 48, color = "black",offset_x = 0, offset_y = 0) {
        super();

        this.text = text;
        this.size = size;
        this.offset_x = offset_x;
        this.offset_y = offset_y;
        this.color = color;
    }
}