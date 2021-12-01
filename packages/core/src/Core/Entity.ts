import {
  ComponentConstructor,
  ComponentData, ComponentStatus,
  EntityEvents,
  IComponent,
  IEntityWithCommit
} from "../Contract/Core";
import {castComponent} from "./Helpers";
import {EventEmitter} from "../Events/EventEmitter";

export class Entity extends EventEmitter<EntityEvents> implements IEntityWithCommit {
  private readonly components: { [tag: string]: IComponent } = {};
  private readonly componentClasses: { [tag: string]: ComponentConstructor<IComponent> } = {};
  private readonly id: number = 0;
  private componentsPrev: { [tag: string]: IComponent } = {};
  private componentsStatus: { [tag: string]: ComponentStatus } = {};
  private firstCommitted: boolean = false;

  constructor(id: number) {
    super();
    this.id = id;
  }

  getId(): number {
    return this.id;
  }

  listComponents(): IComponent[] {
    return Object.keys(this.components).map(tag => this.components[tag]);
  }

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor<IComponent> }[] {
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

  getComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): Readonly<T> {
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
    return component;
  }

  setComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): Readonly<T> {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag];
    if (component) {
      if (!castComponent(component, componentClass)) {
        throw new Error(
          `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
        );
      }

      if (this.firstCommitted && !this.componentsPrev[tag]) {
        this.componentsPrev[tag] = component;
        this.components[tag] = new componentClass();
        this.componentsStatus[tag] = ComponentStatus.Updated;
      }
    } else {
      this.componentsStatus[tag] = ComponentStatus.Created;
      this.components[tag] = new componentClass();
    }

    Object.keys(data).forEach((key) => this.components[tag][key] = data[key]);
    this.componentClasses[tag] = componentClass;
    this.emit("setComponent", {componentClass, tag, component, entity: this});
    return this.components[tag] as Readonly<T>;
  }

  updateComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, data: Partial<ComponentData<T>>): Readonly<T> {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag];
    if (!component) {
      throw new Error(
        `Cannot find component "${tag}" for update.`
      );
    }

    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }

    if (this.firstCommitted && !this.componentsPrev[tag]) {
      this.componentsPrev[tag] = component;
      // clone
      this.components[tag] = new componentClass();
      Object.keys(component).forEach((key) => this.components[tag][key] = component[key]);
    }

    this.componentsStatus[tag] = ComponentStatus.Updated;

    Object.keys(data).forEach((key) => this.components[tag][key] = data[key]);
    this.componentClasses[tag] = componentClass;
    this.emit("setComponent", {componentClass, tag, component, entity: this});
    return this.components[tag] as Readonly<T>;
  }

  removeComponent<T extends IComponent>(componentClass: ComponentConstructor<T>) {
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
    if (this.firstCommitted && !this.componentsPrev[tag]) {
      this.componentsPrev[tag] = this.components[tag];
    }
    delete this.components[tag];
    this.componentsStatus[tag] = ComponentStatus.Removed;
    this.emit("removeComponent", {componentClass, tag, component, entity: this});
  }

  getPrevComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): Readonly<T> {
    const tag = componentClass.tag || componentClass.name;
    const component = this.componentsPrev[tag] as T;
    if (!component) {
      throw new Error(`Cannot get component "${tag}" from entity.`);
    }
    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }
    return component;
  }

  hasPrevComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void): boolean {
    const tag = componentClass.tag || componentClass.name;
    const component = this.componentsPrev[tag] as T;
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

  commit() {
    this.firstCommitted = true;
    if (Object.keys(this.componentsPrev).length || Object.keys(this.componentsStatus).length) {
      this.componentsPrev = {};
      this.componentsStatus = {};
      this.emit('updateComponents', {entity: this});
    }
  }

  getComponentStatus<T extends IComponent>(componentClass: ComponentConstructor<T>): ComponentStatus {
    const tag = componentClass.tag || componentClass.name;

    if(this.hasPrevComponent(componentClass) && this.componentsStatus[tag] === ComponentStatus.Removed){
      return ComponentStatus.Removed;
    }

    if (!this.hasComponent(componentClass)) {
      return ComponentStatus.NotFound;
    }
    const component = this.components[tag];
    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }

    if(!this.componentsStatus[tag]) {
      return ComponentStatus.NoChanges;
    }

    return this.componentsStatus[tag];
  }
}
