class Entity {
    constructor(id, scene_id) {
        this.id = id;
        this.scene_id = scene_id;
        this.components = [];
    }

    add_component(component) {
        if (component instanceof ComponentGroup) {
            component.build(this);
            return;
        }

        if (this.components.filter(comp => comp.constructor.name === component.constructor.name).length > 0) {
            throw new Error("Entity already has this component")
        }

        this.components.push(component);
    }

    has_components(component_types) {
        for (let comp of component_types) {
            let in_comps = this.components.find(component => component instanceof comp);
            if (!in_comps) {
                return false;
            }
        }

        return true;
    }

    get_comp(comp_type) {
        return this.components.filter(comp => (comp instanceof comp_type))[0];
    }

    remove_component(component_type) {
        if (!(component_type instanceof Component)) {
            return;
        }
        // ez sokkal gyorsabb mint egy sima for loop mert built in cucc azt teszt alapján olyan 3x gyorsabb
        // ennyit a JIT csodáirol...
        this.components = this.components.filter(component => !(component instanceof component_type));
    }
}