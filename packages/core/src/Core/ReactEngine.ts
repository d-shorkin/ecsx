import {
  ComponentConstructor,
  EntityUpdateEvent, IComponent, IEntityCollection, IFamilyFactory,
  IReactEngine,
  IReactFactoryOptions
} from "../Contract/Core";

export interface ReactEngineObserver<T extends IComponent, F extends (...args: any) => void> {
  collection: IEntityCollection,
  componentClass: ComponentConstructor,
  tag: string,
  callback: F
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

  constructor(familyFactory: IFamilyFactory) {
    this.familyFactory = familyFactory;
  }

  onCreate<T>(options: IReactFactoryOptions<T>, callback: (data: (EntityUpdateEvent & { component: T })) => void): this {
    const tag = options.type.tag || options.type.name;
    if (!this.observers.create[tag]) {
      this.observers.create[tag] = []
    }
    this.observers.create[tag].push({
      componentClass: options.type,
      collection: this.familyFactory.createFamily(...[...(options.filter || []), options.type]),
      callback: oneTimeAction(callback),
      tag
    })
    return this;
  }

  onRemove<T>(options: IReactFactoryOptions<T>, callback: (data: (EntityUpdateEvent & { component: T })) => void): this {
    const tag = options.type.tag || options.type.name;
    if (!this.observers.remove[tag]) {
      this.observers.remove[tag] = []
    }
    this.observers.remove[tag].push({
      componentClass: options.type,
      collection: this.familyFactory.createFamily(...[...(options.filter || []), options.type]),
      callback: oneTimeAction(callback),
      tag
    })
    return this;
  }

  onUpdate<T>(options: IReactFactoryOptions<T>, callback: (data: (EntityUpdateEvent & { component: T; prev: T })) => void): this {
    if (!this.reactComponents.includes(options.type)) {
      this.reactComponents = [...this.reactComponents, options.type];
    }
    const tag = options.type.tag || options.type.name;
    if (!this.observers.update[tag]) {
      this.observers.update[tag] = []
    }
    this.observers.update[tag].push({
      componentClass: options.type,
      collection: this.familyFactory.createFamily(...[...(options.filter || []), options.type]),
      callback: oneTimeAction(callback),
      tag
    })
    return this;
  }

  getImmutableReactComponents(): ComponentConstructor[] {
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
    observers.forEach(({collection, callback}) => {
      if (!collection.getEntityById(data.entity.getId())) {
        return
      }
      callback(data)
    })
  }

  beforeRemoveComponent(data: EntityUpdateEvent & { component: IComponent }) {
    const observers = this.observers.remove[data.tag]
    if (!observers) {
      return;
    }
    observers.forEach(({collection, callback}) => {
      if (!collection.getEntityById(data.entity.getId())) {
        return
      }
      callback(data)
    })
  }

  updateComponent(data: EntityUpdateEvent & { component: IComponent, prev: IComponent }) {
    const observers = this.observers.update[data.tag]
    if (!observers) {
      return;
    }
    observers.forEach(({collection, callback}) => {
      if (!collection.getEntityById(data.entity.getId())) {
        return
      }
      callback(data)
    })
  }
}
