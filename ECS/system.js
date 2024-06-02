class System {
    constructor(on_event = NeverEvent, query= [], enabled= true) {

        for (let comp of query) {
            if (!comp instanceof Component) {
                throw new Error("query must be an array of Component classes");
            }
        }

        this.required_components = query;
        this.needs_entities = true;

        this.on_event = on_event;
        this.enabled = enabled;

        this.only_takes_active_scene_entities = false;
    }

    run_system(commands, resources, matched_entities){
        throw new Error("Attempt to run blank system");
    }

    enable() {
        this.enabled = true;
    }
    disable() {
        this.enabled = false;
    }
}

class SystemGroup {
    constructor() {
        this.systems = [];
    }
    add_system(commands, event, system) {
        this.systems.push(commands.add_system(event, system));
    }
    build(commands) {}
    enable() {
        for (let system of this.systems) {
            system.enabled = true;
        }
    }
    disable() {
        for (let system of this.systems) {
            system.enabled = false;
        }
    }
}