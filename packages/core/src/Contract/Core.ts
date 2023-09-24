import {IEventEmitter} from "./Common";

export interface IComponent {
}

export type ComponentData<T extends IComponent> = {
  [P in keyof T]: T[P]
}

export interface ComponentConstructor<T extends IComponent = IComponent> {
  readonly name: string;
  readonly tag?: string;

  new(...args: any): T;
}

export interface EntityUpdateEvent<T extends IComponent = IComponent> {
  entity: IEntity;
  tag: string;
  componentClass: ComponentConstructor<T>
}

export interface EntityUpdateEvent<T extends IComponent = IComponent> {
  entity: IEntity;
  tag: string;
  componentClass: ComponentConstructor<T>
}

export type ReactCreateEvent<T extends IComponent> = EntityUpdateEvent<T> & { component: T }
export type ReactRemoveEvent<T extends IComponent> = ReactCreateEvent<T>
export type ReactUpdateEvent<T extends IComponent> = EntityUpdateEvent<T> & { component: T, prev: T }

export type EntityReactEvents = {
  createComponent: (data: ReactCreateEvent<IComponent>) => void;
  removeComponent: (data: ReactRemoveEvent<IComponent>) => void;
  updateComponent: (data: ReactUpdateEvent<IComponent>) => void;
  createAction: (data: ReactCreateEvent<IComponent>) => void;
};

export type EngineEvents = {
  entityAdded: (entity: IEntity) => void;
  entityRemoved: (entity: IEntity) => void;
  entityUpdated: (entity: IEntity) => void;
  beforeUpdate: (engine: IEngine) => void;
  afterUpdate: (engine: IEngine) => void;
};

export type ComponentFilter = Array<ComponentConstructor |
  NotComponent<IComponent>>;

export interface NotComponent<T extends IComponent> {
  not: ComponentConstructor<T>
}

export interface IEntity<A extends IComponent = IComponent> extends IEventEmitter<EntityReactEvents> {
  getId(): number;

  listComponents(): IComponent[];

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor }[];

  listComponentsWithTags(): { tag: string, component: IComponent }[];

  hasComponent<T extends A>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void): boolean;

  getComponent<T extends A>(componentClass: ComponentConstructor<T>): T;

  setComponent<T extends A>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): T;

  setAction<T extends A>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): T;

  removeComponent<T extends A>(componentClass: ComponentConstructor<T>): void;
}

export interface ISystem {
  attach(engine: IEngine): void;
}

export interface IRunSystem extends ISystem {
  run(delta: number): void
}

export interface IDestroySystem extends ISystem {
  destroy(): void
}

export type SystemType = ISystem | (IRunSystem | IDestroySystem);

export interface IEngine extends IEventEmitter<EngineEvents>, IFamilyFactory, IWatchFamilyFactory {
  createEntity(): IEntity

  removeEntity(entity: IEntity): void;

  getCommonFamily(): IFamily;

  addSystem(system: SystemType): void;

  getSystems(): SystemType[];

  removeSystem(system: SystemType): void;

  update(delta: number): void;
}

export interface IEntityCollection {
  getAll(): IEntity[];

  get(id: number): IEntity | null;
}

export interface IMutableEntityCollection extends IEntityCollection{
  add(entity: IEntity): IMutableEntityCollection;

  remove(id: number): IMutableEntityCollection;

  clear(): IMutableEntityCollection;
}

export interface IEntitiesHelper {
  each(cb: (entity: IEntity, index: number, entities: IEntity[]) => void): void
}

export interface IFamily extends IEntityCollection, IEntitiesHelper {
}

export interface IFamilyFactory {
  createFamily(...components: ComponentFilter): IFamily;
}

export interface IWatchComponentsCollection {
  getWatchComponents(): ComponentConstructor[],

  isWatchComponent(componentClass: ComponentConstructor): boolean
}

export interface IWatchEntry<T extends IComponent> {
  entity: IEntity<T | IComponent>
  componentClass: ComponentConstructor<T>
  component: T | null
  prev: T | null
}

export interface IWatchFamily<T extends IComponent = IComponent> {
  getEntries(): Array<IWatchEntry<T>>;

  each(cb: (entry: IWatchEntry<T>, index: number, entries: Array<IWatchEntry<T>>) => void)

  clearEntries(): void
}

export enum WatchType {
  CREATED,
  UPDATED,
  REMOVED
}

export interface IWatchFamilyFactory {
  createWatchFamily<T extends IComponent>(type: WatchType[], watch: ComponentConstructor<T>, filter?: ComponentFilter, autoClear?: boolean): IWatchFamily<T>;
}


