import {
  IEntityWithCommit,
  EntityEvents,
  EventEmitter,
  ComponentConstructor,
  ComponentData,
  ComponentStatus,
  IComponent
} from "@ecsx/core";

export class RevertableEntity extends EventEmitter<EntityEvents> implements IEntityWithCommit {
  private base: IEntityWithCommit;
  private revertableState: { [tag: string]: { component: IComponent; type: ComponentConstructor<IComponent> } } = {};

  constructor(base: IEntityWithCommit) {
    super();
    this.base = base;

    this.addListener('removeComponent', (...args) => this.emit('removeComponent', ...args));
    this.addListener('updateComponents', (...args) => this.emit('updateComponents', ...args));
    this.addListener('setComponent', (...args) => this.emit('setComponent', ...args));
  }

  getId(): number {
    return this.base.getId();
  }

  listComponents(): IComponent[] {
    return this.base.listComponents();
  }

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor<IComponent> }[] {
    return this.base.listComponentsWithTypes();
  }

  listComponentsWithTags(): { tag: string, component: IComponent }[] {
    return this.base.listComponentsWithTags();
  }

  hasComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void): boolean {
    return this.base.hasComponent(componentClass, existsCallback);
  }

  getComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): Readonly<T> {
    return this.base.getComponent(componentClass);
  }

  setComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): Readonly<T> {
    return this.base.setComponent(componentClass, data);
  }

  updateComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, data: Partial<ComponentData<T>>): Readonly<T> {
    return this.base.updateComponent(componentClass, data);
  }

  removeComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): void {
    return this.base.removeComponent(componentClass);
  }

  hasPrevComponent<T extends IComponent>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void): boolean {
    return this.base.hasPrevComponent(componentClass, existsCallback);
  }

  getPrevComponent<T extends IComponent>(componentClass: ComponentConstructor<T>): Readonly<T> {
    return this.base.getPrevComponent(componentClass);
  }

  getComponentStatus<T extends IComponent>(componentClass: ComponentConstructor<T>): ComponentStatus {
    return this.base.getComponentStatus(componentClass);
  }

  commit(): void {
    return this.base.commit();
  }

  revert() {
    this.listComponentsWithTypes().forEach(({type}) => {
      const tag = type.tag || type.name;
      if (!this.revertableState[tag]) {
        this.removeComponent(type);
      }
    });

    Object.values(this.revertableState).forEach(({component, type}) => (this.setComponent(type, component)));
  }

  saveRevertableState() {
    this.revertableState = this.listComponentsWithTypes().reduce((acc, {type, component}) => {
      const tag = type.tag || type.name;
      acc[tag] = {type, component: {...component}};
      return acc;
    }, {} as { [tag: string]: { component: IComponent; type: ComponentConstructor<IComponent> } });
  }
}