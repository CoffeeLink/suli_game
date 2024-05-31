class Transform extends Component {
    constructor(x=0, y=0, rotation=0) {
        super();

        this.x = x;
        this.y = y;
        this.rotation = rotation;
    }
}

class Sprite2D extends Component {
    constructor(texture, offset_x = 0, offset_y = 0) {
        super();

        this.texture = texture;
        this.offset_x = offset_x;
        this.offset_y = offset_y;
    }
}