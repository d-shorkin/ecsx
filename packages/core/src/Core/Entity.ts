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
  private readonly reactComponentsCollection: IReactComponentsCollection;
  private lastReactiveComponents: ComponentConstructor[] = [];

  constructor(id: number, reactComponents: IReactComponentsCollection) {
    super();
    this.id = id;
    this.reactComponentsCollection = reactComponents;
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
    this.checkReactivity();
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

  setComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): T {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag] as T;
    if (component && !castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }

    let nComponent = new componentClass();
    Object.keys(data).forEach((key) => nComponent[key] = data[key]);

    const isReact = this.reactComponentsCollection.isReactComponent(componentClass);

    if (isReact) {
      nComponent = this.makeComponentReactive(componentClass, nComponent);
      !this.lastReactiveComponents.includes(componentClass) && this.lastReactiveComponents.push(componentClass)
    }

    if (!component) {
      this.emit("createComponent", {componentClass, tag, component: nComponent, entity: this});
    } else if (isReact) {
      this.emit("updateComponent", {componentClass, tag, component: nComponent, prev: component, entity: this});
    }

    this.components[tag] = Object.seal(nComponent);
    this.componentClasses[tag] = componentClass;

    return nComponent;
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

  private checkReactivity() {
    const newReactiveComponents = this.reactComponentsCollection.getImmutableReactComponents();
    if (newReactiveComponents === this.lastReactiveComponents) {
      return;
    }

    Object.keys(this.components).forEach((tag) => {
      const componentClass = this.componentClasses[tag];
      if (newReactiveComponents.includes(componentClass) && !this.lastReactiveComponents.includes(componentClass)) {
        this.components[tag] = Object.seal(
          this.makeComponentReactive(componentClass, this.components[tag])
        );
      } else if (!newReactiveComponents.includes(componentClass) && this.lastReactiveComponents.includes(componentClass)) {
        const old = this.components[tag];
        const component = new componentClass();
        Object.keys(old).forEach((key) => component[key] = old[key]);
        this.components[tag] = Object.seal(component)
      }
    });

    this.lastReactiveComponents = newReactiveComponents;
  }

  private makeComponentReactive<T extends IComponent>(componentClass: ComponentConstructor<T>, component: T): T {
    const tag = componentClass.tag || componentClass.name;
    const h = new componentClass();
    const c = new componentClass();
    Object.keys(component).forEach(p => {
      h[p] = component[p];
      Object.defineProperty(c, p, {
        configurable: false,
        get: () => h[p],
        set: v => {
          const old = new componentClass();
          Object.keys(component).forEach((key) => old[key] = h[key]);
          h[p] = v;
          this.emit("updateComponent", {componentClass, tag, component, prev: old, entity: this})
        }
      });
    });

    return c;
  }
}
