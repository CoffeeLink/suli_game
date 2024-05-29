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

app.add_system(Startup, new NameDisplay);

app.run()