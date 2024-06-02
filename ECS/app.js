class EcsApp {
    constructor(frame_rate = 60) {
        // Holds all entities
        this.entities = [];

        // Holds all systems (class)
        this.systems = [];

        // The default event schedule
        this.event_schedule = [FrameStart, PreUpdate, Update, PostUpdate, PreRender, Render, FrameEnd];
        this.event_queue = [];

        this.target_frame_rate = frame_rate;

        this.resources = new Map();
        this.last_entity_id = 0;

        this.update_interval_id = null;

        this.scenes = [0];
        this.current_scene = 0;
        this.last_scene_id = 0;
    }

    // creates a new entity and adds the given components to it
    spawn(...components) {
        let entity = new Entity(this.last_entity_id++, this.current_scene);
        for (let component of components) {
            if (component instanceof ComponentGroup) {
                component.build(entity);
            } else {
                entity.add_component(component);
            }
        }
        this.entities.push(entity);
        return entity;
    }

    spawn_on_scene(scene_id, ...components) {
        let entity = new Entity(this.last_entity_id++, scene_id);
        for (let component of components) {
            if (component instanceof ComponentGroup) {
                component.build(entity);
            } else {
                entity.add_component(component);
            }
        }
        this.entities.push(entity);
        return entity;
    }

    // creates a new scene id and adds it to the list of scenes, then returns it;
    new_scene() {
        let id = this.last_scene_id += 1;
        this.scenes.push(id);
        return id;
    }

    set_scene(id) {
        this.current_scene = id;
    }

    delete_entity(entity) {
        let index = this.entities.indexOf(entity);
        if (index > -1) {
            this.entities.splice(index, 1);
        }
    }

    add_resource(key, resource) {
        if (!resource instanceof Resource) {
            throw new Error("Resource must be an instance of Resource");
        }

        if (this.resources.has(resource.constructor)) {
            throw new Error("Resource already added");
        }

        this.resources.set(key, resource)
    }
    // no function to remove a resource cuz those cant be removed

    add_system(event, system) {
        if (!system instanceof System) {
            throw "Attempting to add " + system.constructor.name + " as a System"
        }

        system.on_event = event;
        this.systems.push(system)
        return system;
    }

    add_system_group(system_group) {
        if (!system_group instanceof SystemGroup) {
            throw new Error("Attempted to add something that's not a system group as a system group")
        }
        system_group.build(this);
    }

    get_matching(required_comps) {
        return this.entities.filter((entity) => {
            return entity.has_components(required_comps);
        })
    }

    get_matching_scene_only(required_comps) {
        return this.entities.filter((entity) => {
            return entity.scene_id === this.current_scene && entity.has_components(required_comps);
        })
    }

    run() {
        this.add_resource(TimeResource, new TimeResource()); // Time should be core
        this.run_systems(Startup);

        this.update_interval_id = setInterval(() => this.update_run(this), 1000 / this.target_frame_rate)
    }

    change_target_frame_rate(frame_rate) {
        clearInterval(this.update_interval_id);
        this.update_interval_id = setInterval(() => this.update_run(this), 1000 / frame_rate);
        this.target_frame_rate = frame_rate;
    }

    queue_event(event) {
        this.event_queue.push(event);
    }

    add_event_before(other_event, event) {
        let index = this.event_schedule.indexOf(other_event);
        if (index && index !== -1) {
            this.event_schedule.splice(index, 0, event);
        }
    }

    add_event_after(other_event, event) {
        let index = this.event_schedule.indexOf(other_event);
        if (index && index !== -1) {
            this.event_schedule.splice(index + 1, 0, event);
        }
    }

    update_run(ecs) {
        for (let event of ecs.event_schedule) {
            ecs.run_systems(event);
        }
    }

    run_systems(event_type) {
        let matching = this.systems.filter(sys => sys.on_event === event_type && sys.enabled === true);
        for (let sys of matching) {
            // no entities req if false
            let entities = [];
            if (sys.needs_entities && sys.only_takes_active_scene_entities) {
                entities = this.get_matching_scene_only(sys.required_components);
            } else if (sys.needs_entities) {
                entities = this.get_matching(sys.required_components);
            }

            sys.run_system(this, this.resources, entities);
        }
    }
}