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
