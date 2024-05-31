class System {
    constructor(on_event = NeverEvent, query= [], enabled= true) {

        for (let comp of query) {
            if (!comp instanceof Component) {
                throw new Error("query must be an array of Component classes");
            }
        }

        this.required_components = query;

        this.on_event = on_event;
        this.enabled = enabled;
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