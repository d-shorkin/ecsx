import {
  ComponentConstructor,
  ComponentData,
  EntityReactEvents,
  IComponent,
  IEntity, IReactComponentsCollection,
} from "../Contract/Core";
import {castComponent} from "./Helpers";
import {EventEmitter} from "../Events/EventEmitter";


export class Entity extends EventEmitter<EntityReactEvents> implements IEntity {
  private readonly components: { [tag: string]: IComponent } = {};
  private readonly componentClasses: { [tag: string]: ComponentConstructor } = {};
  private readonly id: number = 0;
  private readonly reactComponents: IReactComponentsCollection;

  constructor(id: number, reactComponents: IReactComponentsCollection) {
    super();
    this.id = id;
    this.reactComponents = reactComponents;
  }

  getId(): number {
    return this.id;
  }

  listComponents(): IComponent[] {
    return Object.keys(this.components).map(tag => this.components[tag]);
  }

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor }[] {
    return Object.keys(this.components).map(tag => ({
      component: this.components[tag],
      type: this.componentClasses[tag]
    }));
  }

  listComponentsWithTags(): { tag: string, component: IComponent }[] {
    return Object.keys(this.components).map(tag =>
      Object.freeze({
        tag,
        component: this.components[tag]
      })
    );
  }

  hasComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void) {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag] as T;
    if (!component) return false;
    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }
    if (existsCallback) {
      existsCallback(component);
    }
    return true;
  }

  getComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): T {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag] as T;
    if (!component) {
      throw new Error(`Cannot get component "${tag}" from entity.`);
    }
    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }
    return this.wrapComponent(componentClass, component);
  }

  setComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): T {
    const tag = componentClass.tag || componentClass.name;
    let component = this.components[tag] as T;
    const isCreating = !component;
    if (component) {
      if (!castComponent(component, componentClass)) {
        throw new Error(
          `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
        );
      }
    } else {
      // todo: make proxy here?
      component = new componentClass()
      this.components[tag] = component;
    }

    if (isCreating) {
      Object.keys(data).forEach((key) => component[key] = data[key])
      this.emit("createComponent", {componentClass, tag, component, entity: this});
    } else {
      const old = new componentClass()
      Object.keys(component).forEach((key) => old[key] = component[key])
      Object.keys(data).forEach((key) => component[key] = data[key])
      this.emit("updateComponent", {componentClass, tag, component, prev: old, entity: this});
    }

    this.componentClasses[tag] = componentClass;

    return this.wrapComponent(componentClass, component);
  }

  removeComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): void {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag];
    if (!component) {
      return;
    }
    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }

    delete this.components[tag];
    this.emit("removeComponent", {componentClass, tag, component, entity: this});
  }

  private wrapComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, component: T): T {
    if(!this.reactComponents.isReactComponent(componentClass)){
      return component;
    }

    return new Proxy(component, {
      set: (target: T, p: PropertyKey, value: any): boolean => {
        const old = new componentClass()
        Object.keys(component).forEach((key) => old[key] = target[key])
        target[p] = value;
        const tag = componentClass.tag || componentClass.name;
        this.emit("updateComponent", {componentClass, tag, component: target, prev: old, entity: this})
        return true;
      }
    })
  }
}
