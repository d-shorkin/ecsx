import {
  ComponentConstructor,
  ComponentData,
  EntityReactEvents,
  IComponent,
  IEntity, IWatchComponentsCollection,
} from "../Contract/Core";
import {castComponent} from "./Helpers";
import {EventEmitter} from "../Events/EventEmitter";


export class MapEntity extends EventEmitter<EntityReactEvents> implements IEntity {
  private readonly components: Map<string, IComponent> = new Map();
  private readonly componentClasses: Map<string, ComponentConstructor> = new Map();
  private readonly id: number = 0;
  private readonly watchComponents: IWatchComponentsCollection;

  constructor(id: number, watchComponents: IWatchComponentsCollection) {
    super();
    this.id = id;
    this.watchComponents = watchComponents;
  }

  getId(): number {
    return this.id;
  }

  listComponents(): IComponent[] {
    const components: IComponent[] = [];
    this.components.forEach(v => components.push(v))
    return components
  }

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor }[] {
    const components: { component: IComponent; type: ComponentConstructor }[] = [];

    this.components.forEach((v, key) => {
      const componentClass = this.componentClasses.get(key)
      if (!componentClass) {
        throw new Error(`Cannot find ${key} class`)
      }
      components.push({
        component: v,
        type: componentClass
      })
    })
    return components
  }

  listComponentsWithTags(): { tag: string, component: IComponent }[] {
    const components: { tag: string, component: IComponent }[] = [];

    this.components.forEach((component, tag) => {
      components.push({component, tag})
    })
    return components
  }

  hasComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void) {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components.get(tag) as T;
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
    const component = this.components.get(tag) as T;
    if (!component) {
      throw new Error(`Cannot get component "${tag}" from entity.`);
    }
    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }
    return this.wrapComponent(componentClass, component);
    return component
  }

  setComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): T {
    const tag = componentClass.tag || componentClass.name;
    let component = this.components.get(tag) as T;
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
      this.components.set(tag, component);
    }

    if (isCreating) {
      Object.keys(data).forEach((key) => component[key] = data[key])
      this.emit("createComponent", {componentClass, tag, component, entity: this});
    } else if (this.watchComponents.isWatchComponent(componentClass)) {
      const old = new componentClass()
      Object.keys(component).forEach((key) => old[key] = component[key])
      Object.keys(data).forEach((key) => component[key] = data[key])
      this.emit("updateComponent", {componentClass, tag, component, prev: old, entity: this});
    } else {
      Object.keys(data).forEach((key) => component[key] = data[key])
    }

    this.componentClasses.set(tag, componentClass);

    return this.wrapComponent(componentClass, component);
  }

  removeComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): void {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components.get(tag);
    if (!component) {
      return;
    }
    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }

    this.components.delete(tag);
    this.emit("removeComponent", {componentClass, tag, component, entity: this});
  }

  setAction<T extends IComponent>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): T {
    const tag = componentClass.tag || componentClass.name;
    const component = this.setComponent(componentClass, data)
    this.emit('createAction', {componentClass, tag, component, entity: this})
    return component;
  }

  private wrapComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, component: T): T {
    if (!this.watchComponents.isWatchComponent(componentClass)) {
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
