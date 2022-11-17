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

export type ReactCreateEvent<T extends IComponent> = EntityUpdateEvent & { component: T }
export type ReactRemoveEvent<T extends IComponent> = ReactCreateEvent<T>
export type ReactUpdateEvent<T extends IComponent> = EntityUpdateEvent & { component: T, prev: T }

export type EntityReactEvents = {
  createComponent: (data: ReactCreateEvent<IComponent>) => void;
  removeComponent: (data: ReactRemoveEvent<IComponent>) => void;
  updateComponent: (data: ReactUpdateEvent<IComponent>) => void;
};

export type EngineEvents = {
  entityAdded: (entity: IEntity) => void;
  entityRemoved: (entity: IEntity) => void;
  entityUpdated: (entity: IEntity) => void;
  beforeUpdate: (engine: IEngine) => void;
  afterUpdate: (engine: IEngine) => void;
  entitySetComponent: (event: EntityUpdateEvent) => void;
  entityRemoveComponent: (event: EntityUpdateEvent) => void;
};

export type ComponentFilter = Array<ComponentConstructor |
  NotComponent<IComponent>>;

export interface NotComponent<T extends IComponent> {
  not: ComponentConstructor<T>
}

export interface IEntity<A extends IComponent = IComponent> extends IEventEmitter<EntityReactEvents> {
  getId(): number;

  listComponents(): IComponent[];

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor<IComponent> }[];

  listComponentsWithTags(): { tag: string, component: IComponent }[];

  hasComponent<T extends A>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void): boolean;

  getComponent<T extends A>(componentClass: ComponentConstructor<T>): T;

  setComponent<T extends A>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): T;

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

export interface IEngine extends IEventEmitter<EngineEvents>, IEntityCollection, IFamilyFactory {
  createEntity(): IEntity

  removeEntity(entity: IEntity): void;

  addSystem(system: SystemType): void;

  getSystems(): SystemType[];

  removeSystem(system: SystemType): void;

  update(delta: number): void;

  react(): IReactFactory;
}

export interface IEntityCollection {
  getEntities(): IEntity[];

  getEntityById(id: number): IEntity | null;

  each(cb: (entity: IEntity, index: number, entities: IEntity[]) => void): IEntityCollection
}

export interface IFamilyFactory {
  createFamily(...components: ComponentFilter): IEntityCollection;
}

export interface IReactComponentsCollection {
  getReactComponents(): ComponentConstructor[],

  isReactComponent(componentClass: ComponentConstructor): boolean
}

export interface IReactFactoryOptions<T extends IComponent> {
  type: ComponentConstructor<T>
  filter?: ComponentFilter
}

export interface IReactFactory {
  onCreate<T extends IComponent>(options: IReactFactoryOptions<T>, callback: (data: ReactCreateEvent<T>) => void): this

  onRemove<T extends IComponent>(options: IReactFactoryOptions<T>, callback: (data: ReactRemoveEvent<T>) => void): this

  onUpdate<T extends IComponent>(options: IReactFactoryOptions<T>, callback: (data: ReactUpdateEvent<T>) => void): this
}


export interface IReactEngine extends IReactFactory, IReactComponentsCollection {
  setCurrentSystem(system: ISystem): void

  afterCreateComponent(data: EntityUpdateEvent & { component: IComponent }): void

  beforeRemoveComponent(data: EntityUpdateEvent & { component: IComponent }): void

  updateComponent(data: EntityUpdateEvent & { component: IComponent, prev: IComponent }): void
}



