import {
  ComponentConstructor, ReactCreateEvent, ReactRemoveEvent, ReactUpdateEvent,
  EntityUpdateEvent, IComponent, IEntityCollection, IFamilyFactory,
  IReactEngine,
  IReactFactoryOptions,
  ISystem
} from "../Contract/Core";

export interface ReactEngineObserver<T extends IComponent, F extends (...args: any) => void> {
  collection: IEntityCollection,
  componentClass: ComponentConstructor,
  tag: string,
  callback: F,
  system: ISystem
}

export interface ReactEngineObservers {
  create: { [tag: string]: Array<ReactEngineObserver<IComponent, ((data: (EntityUpdateEvent & { component: IComponent })) => void)>> }
  remove: { [tag: string]: Array<ReactEngineObserver<IComponent, ((data: (EntityUpdateEvent & { component: IComponent })) => void)>> }
  update: { [tag: string]: Array<ReactEngineObserver<IComponent, ((data: (EntityUpdateEvent & { component: IComponent; prev: IComponent })) => void)>> }
}

export function oneTimeAction<R, T extends any[]>(callback: (...args: T) => R): (...args: T) => R | void {
  let isCalled = false
  return (...args) => {
    if (isCalled) {
      return
    }

    isCalled = true
    const r = callback(...args)
    isCalled = false
    return r;
  }
}

export class ReactEngine implements IReactEngine {
  private reactComponents: ComponentConstructor[] = [];
  private familyFactory: IFamilyFactory;
  private observers: ReactEngineObservers = {create: {}, remove: {}, update: {}}
  private currentSystem: ISystem;
  private events: Map<ISystem, Array<() => void>> = new Map();

  constructor(familyFactory: IFamilyFactory) {
    this.familyFactory = familyFactory;
  }

  setCurrentSystem(system: ISystem): void {
    if(this.events.has(system)){
      this.events.get(system)!.forEach((cb) => cb())
      this.events.delete(system)
    }

    this.currentSystem = system
  }

  onCreate<T extends IComponent>(options: IReactFactoryOptions<T>, callback: (data: ReactCreateEvent<T>) => void): this {
    const tag = options.type.tag || options.type.name;
    if (!this.observers.create[tag]) {
      this.observers.create[tag] = []
    }
    const family = this.familyFactory.createFamily(...[...(options.filter || []), options.type]);
    const wrapped = oneTimeAction(callback);
    this.observers.create[tag].push({
      componentClass: options.type,
      collection: family,
      callback: wrapped,
      tag,
      system: this.currentSystem,
    })
    family.each(entity => wrapped({
      entity,
      componentClass: options.type,
      tag: options.type.tag || options.type.name,
      component: entity.getComponent(options.type),
    }))
    return this;
  }

  onRemove<T extends IComponent>(options: IReactFactoryOptions<T>, callback: (data: ReactRemoveEvent<T>) => void): this {
    const tag = options.type.tag || options.type.name;
    if (!this.observers.remove[tag]) {
      this.observers.remove[tag] = []
    }
    this.observers.remove[tag].push({
      componentClass: options.type,
      collection: this.familyFactory.createFamily(...[...(options.filter || []), options.type]),
      callback: oneTimeAction(callback),
      tag,
      system: this.currentSystem
    })
    return this;
  }

  onUpdate<T extends IComponent>(options: IReactFactoryOptions<T>, callback: (data: ReactUpdateEvent<T>) => void): this {
    if (!this.reactComponents.includes(options.type)) {
      this.reactComponents.push(options.type)
    }
    const tag = options.type.tag || options.type.name;
    if (!this.observers.update[tag]) {
      this.observers.update[tag] = []
    }
    this.observers.update[tag].push({
      componentClass: options.type,
      collection: this.familyFactory.createFamily(...[...(options.filter || []), options.type]),
      callback: oneTimeAction(callback),
      tag,
      system: this.currentSystem
    })
    return this;
  }

  getReactComponents(): ComponentConstructor[] {
    return this.reactComponents;
  }

  isReactComponent(componentClass: ComponentConstructor): boolean {
    return this.reactComponents.includes(componentClass);
  }

  afterCreateComponent(data: EntityUpdateEvent & { component: IComponent }) {
    const observers = this.observers.create[data.tag]
    if (!observers) {
      return;
    }
    observers.forEach(({collection, callback, system}) => {
      if (!collection.getEntityById(data.entity.getId())) {
        return
      }
      if (this.currentSystem == system) {
        return callback(data);
      }
      this.holdEvent(system,() => callback(data))
    })
  }

  beforeRemoveComponent(data: EntityUpdateEvent & { component: IComponent }) {
    const observers = this.observers.remove[data.tag]
    if (!observers) {
      return;
    }
    observers.forEach(({collection, callback, system}) => {
      if (!collection.getEntityById(data.entity.getId())) {
        return
      }
      if (this.currentSystem == system) {
        callback(data)
        return ;
      }
      this.holdEvent(system,() => callback(data))
    })
  }

  updateComponent(data: EntityUpdateEvent & { component: IComponent, prev: IComponent }) {
    const observers = this.observers.update[data.tag]
    if (!observers) {
      return;
    }
    observers.forEach(({collection, callback, system}) => {
      if (!collection.getEntityById(data.entity.getId())) {
        return
      }
      if (this.currentSystem == system) {
        return callback(data);
      }
      this.holdEvent(system,() => callback(data))
    })
  }

  private holdEvent(system: ISystem, event: () => void) {
    if (!this.events.has(system)) {
      this.events.set(system, [event])
    } else {
      this.events.get(system)!.push(event)
    }
  }
}
