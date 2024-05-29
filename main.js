const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let app = new EcsApp();

class Name extends Component {
    constructor(name) {
        super();
        this.name = name;
    }
}

class Age extends Component {
    constructor(age) {
        super();
        this.age = age;
    }
}

app.spawn(new Name("Hello"), new Age(10));
app.spawn(new Name("Te"), new Age(17));
app.spawn(new Name("én"), new Age(19));

app.spawn(new Age(10));

class NameDisplay extends System {
    constructor() {
        super();
        this.required_components = [Name, Age]
    }

    run_system(commands, resources, matched_entities) {
        for (let match of matched_entities) {
            console.log(match.get_comp(Name).name);
        }
    }
}

class AgeDisplay extends System {
    constructor() {
        super();
        this.required_components = [Age];
    }

    run_system(commands, resources, matched_entities) {
        for (let match of matched_entities) {
            console.log(match.get_comp(Age).age);
        }
    }
}

class Renderable extends Component {
    constructor(x, y, color) {
        super();

        this.x = x;
        this.y = y;

        this.color = color;
    }
}

class RenderSystem extends System {
    constructor() {
        super();

        this.required_components = [Renderable]
    }

    run_system(commands, resources, matched_entities) {
        for (let entity of matched_entities) {
            let rend = entity.get_comp(Renderable)
            console.log(rend.x, rend.y, rend.color);
        }
    }
}

class AfterUpdate extends Event {}

app.add_system(Startup, new NameDisplay);
app.add_system(Startup, new AgeDisplay);

app.add_system(Update, new RenderSystem);

app.spawn(new Renderable(10, 12, "zöd"));

app.run()