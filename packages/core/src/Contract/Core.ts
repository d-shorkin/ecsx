import {IEventEmitter} from "./Common";

export interface ComponentConstructor<T extends IComponent> {
  readonly name: string;
  readonly tag?: string;

  new(...args: any): T;
}

export interface EntityUpdateEvent<T extends IComponent = IComponent> {
  entity: IEntity;
  tag: string;
  componentClass: ComponentConstructor<T>
  component: T;
}

export type EntityEvents = {
  putComponent: (data: EntityUpdateEvent) => void;
  removeComponent: (data: EntityUpdateEvent) => void;
};

export type EngineEvents = {
  entityAdded: (entity: IEntity) => void;
  entityRemoved: (entity: IEntity) => void;
  entityUpdated: (entity: IEntity) => void;
  beforeUpdate: (engine: IEngine) => void;
  afterUpdate: (engine: IEngine) => void;
};

export interface NotComponent<T extends IComponent> {
  not: ComponentConstructor<T>
}

export interface IComponent extends ILoopCounterChild {
  getEntity(): IEntity;

  set<K extends keyof this>(key: K, data: this[K]): void;

  hasUpdate<K extends keyof this>(...keys: K[]): boolean;

  destroy(): void;

  _setEntity(entity: IEntity): void;
}

export interface IEntity<A extends IComponent = IComponent> extends IEventEmitter<EntityEvents>, ILoopCounterChild {
  getId(): number;

  listComponents(): IComponent[];

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor<IComponent> }[];

  listComponentsWithTags(): { tag: string, component: IComponent }[];

  hasComponent<T extends A>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void): boolean;

  getComponent<T extends A>(componentClass: ComponentConstructor<T>): Readonly<T>;

  addComponent<T extends A>(componentClass: ComponentConstructor<T>): Readonly<T>;

  removeComponent<T extends A>(componentClass: ComponentConstructor<T>): void;

  _setId(id: number): void;
}

export interface ILoopCounterChild {
  _setLoopCounter(counter: ILoopCounter): void;
}

export interface ILoopCounter {
  getCurrent(): number;

  getLast(): number;
}

export interface ISystem {
  onAttach(engine: IEngine): void;

  execute(engine: IEngine, delta: number): void;
}

export interface IEngine extends IEventEmitter<EngineEvents>, IEntityCollection, IFamilyFactory {
  addEntity(entity: IEntity): void;

  removeEntity(entity: IEntity): void;

  addSystem(system: ISystem): void;

  getSystems(): ISystem[];

  update(delta: number): void;
}

export interface IEntityCollection {
  getEntities(): IEntity[];
}

export interface IFamily extends IEntityCollection {
  getRemoved(): IEntity[];

  getNews(): IEntity[]
}

export interface IFamilyFactory {
  createFamily(...components: Array<ComponentConstructor<IComponent> | NotComponent<IComponent>>): IFamily;
}
