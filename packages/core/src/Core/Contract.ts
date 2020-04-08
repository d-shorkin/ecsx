import {IEventEmitter} from "../Events/IEventEmitter";

export interface ComponentConstructor<T extends IComponent<object>> {
  readonly name: string;
  readonly tag?: string;

  new(): T;
}

export interface EntityUpdateEvent<T extends IComponent<object> = IComponent<object>> {
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
};

export interface NotComponent<T extends IComponent> {
  not: ComponentConstructor<T>
}

export interface IComponent<T extends object = object> extends ILoopCounterChild {
  get<K extends keyof T>(key: K): T[K];

  set<K extends keyof T>(key: K, data: T[K]): void;

  hasUpdate<K extends keyof T>(key: K): boolean;
}

export interface IEntity extends IEventEmitter<EntityEvents> {
  getId(): number;

  listComponents(): IComponent[];

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor<IComponent> }[];

  listComponentsWithTags(): { tag: string, component: IComponent }[];

  has<T extends IComponent>(componentClass: ComponentConstructor<T>): boolean;

  get<T extends IComponent>(componentClass: ComponentConstructor<T>): T;

  put<T extends IComponent>(componentClass: ComponentConstructor<T>): T;

  remove<T extends IComponent>(componentClass: ComponentConstructor<T>): void;
}

export interface IInitEntity extends IEntity, ILoopCounterChild {
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
  addEntity(entity: IInitEntity): void;

  removeEntity(entity: IEntity): void;

  addSystem(system: ISystem): void;

  getSystems(): ISystem[];

  update(delta: number): void;
}

export interface IEntityCollection {
  getEntities(): IEntity[];
}

export interface IFamilyFactory {
  createFamily(components: Array<ComponentConstructor<IComponent> | NotComponent<IComponent>>): IEntityCollection;
}