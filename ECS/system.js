class System {
    constructor(on_event = NeverEvent, required_components= [], required_resources= [], enabled= true) {

        for (let comp of required_components) {
            if (!comp instanceof Component) {
                throw new Error("required_components must be an array of Component classes");
            }
        }

        for (let res of required_resources) {
            if (!res instanceof Resource) {
                throw new Error("required_resources must be an array of Resource classes");
            }
        }

        this.required_components = required_components;
        this.required_resources = required_resources;

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