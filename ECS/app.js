    class EcsApp {
        constructor() {
            // Holds all entities
            this.entities = [];

            // Holds all systems (class)
            this.systems = [];
            this.resources = [];
            this.event_types = [Startup, Update];

            this.last_entity_id = 0;

        }

        // creates a new entity and adds the given components to it
        spawn(...components) {
            let entity = new Entity(this.last_entity_id++);
            for (let component of components) {
                entity.add_component(component);
            }
            this.entities.push(entity);
            return entity;
        }

        delete_entity(entity) {
            let index = this.entities.indexOf(entity);
            if (index > -1) {
                this.entities.splice(index, 1);
            }
        }

        add_resource(resource) {
            if (!resource instanceof Resource) {
                throw new Error("Resource must be an instance of Resource");
            }
            this.resources.push(resource);
        }
        // no function to remove a resource cuz those cant be removed

        add_system(event, system) {
            if (!system instanceof System) {
                throw "nah"
            }

            system.on_event = event;
            this.systems.push(system)
        }

        get_matching(required_comps) {
            let ents = [];
            for (let entity of this.entities) {
                if (entity.has_components(required_comps)) {
                    ents.push(entity);
                }
            }

            return ents;
        }

        run() {
            for (let sys of this.systems) {
                if (sys.on_event === Startup) {
                    let entities = this.get_matching(sys.required_components);
                    sys.run_system(this, this.resources, entities);
                }
            }
            for (let sys of this.systems) {
                if (sys.on_event === Update) {
                    let entities = this.get_matching(sys.required_components);
                    sys.run_system(this, this.resources, entities);
                }
            }

        }


    }