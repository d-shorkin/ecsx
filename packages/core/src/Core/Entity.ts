import {ComponentConstructor, EntityEvents, IComponent, IInitEntity, ILoopCounter} from "./Contract";
import {castComponent} from "./Helpers";
import {EventEmitter} from "../Events/EventEmitter";

export class Entity extends EventEmitter<EntityEvents> implements IInitEntity {
  private readonly components: { [tag: string]: IComponent } = {};
  private readonly componentClasses: { [tag: string]: ComponentConstructor<IComponent> } = {};
  private id: number = 0;
  private counter: ILoopCounter;

  getId(): number {
    return this.id;
  }

  listComponents(): IComponent[] {
    return Object.keys(this.components).map(i => this.components[i]);
  }

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor<IComponent> }[] {
    return Object.keys(this.components).map(i => ({
      component: this.components[i],
      type: this.componentClasses[i]
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

  has<T extends IComponent>(componentClass: ComponentConstructor<T>) {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag];
    if (!component) return false;
    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }
    return true;
  }

  get<T extends IComponent>(componentClass: ComponentConstructor<T>): T {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag];
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

  put<T extends IComponent>(componentClass: ComponentConstructor<T>): T {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag];
    if (component) {
      if (!castComponent(component, componentClass)) {
        throw new Error(
          `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
        );
      }
      delete this.components[tag];
      delete this.componentClasses[tag];
    }
    const newComponent = new componentClass();
    if (this.counter) {
      newComponent._setLoopCounter(this.counter);
    }
    this.components[tag] = newComponent;
    this.componentClasses[tag] = componentClass;
    this.emit("putComponent", {componentClass, tag, component, entity: this});
    return newComponent;
  }

  remove<T extends IComponent>(componentClass: ComponentConstructor<T>) {
    const tag = componentClass.tag || componentClass.name;
    const component = this.components[tag];
    if (!component) {
      throw new Error(`IComponent of tag "${tag}".\nDoes not exists.`);
    }
    if (!castComponent(component, componentClass)) {
      throw new Error(
        `There are multiple classes with the same tag or name "${tag}".\nAdd a different property "tag" to one of them.`
      );
    }
    delete this.components[tag];
    this.emit("removeComponent", {componentClass, tag, component, entity: this});
  }

  _setId(id: number) {
    if (this.id) {
      throw new Error('Cannot set id one more time');
    }
    this.id = id;
  }

  _setLoopCounter(counter: ILoopCounter): void {
    this.counter = counter;
    Object.values(this.components).forEach(c => c._setLoopCounter(counter));
  }
}
