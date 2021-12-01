import {IEventEmitter} from "./Common";
import {Partial} from "rollup-plugin-typescript2/dist/partial";

export interface ComponentConstructor<T extends IComponent> {
  readonly name: string;
  readonly tag?: string;

  new(...args: any): T;
}

export type ComponentData<T> = {
  [K in keyof T]: T[K]
};

export interface EntityUpdateEvent<T extends IComponent = IComponent> {
  entity: IEntity;
  tag: string;
  componentClass: ComponentConstructor<T>
  component: T;
}

export interface EntityGlobalUpdateEvent {
  entity: IEntity;
}

export type EntityEvents = {
  setComponent: (data: EntityUpdateEvent) => void;
  removeComponent: (data: EntityUpdateEvent) => void;
  updateComponents: (data: EntityGlobalUpdateEvent) => void;
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

export type ComponentFilter = Array<
  ComponentConstructor<IComponent> |
  NotComponent<IComponent> |
  CreatedComponent<IComponent> |
  UpdatedComponent<IComponent> |
  RemovedComponent<IComponent>
  >;

export interface NotComponent<T extends IComponent> {
  not: ComponentConstructor<T>
}

export interface CreatedComponent<T> {
  created: ComponentConstructor<T>,
}

export interface UpdatedComponent<T> {
  updated: ComponentConstructor<T>,
}

export interface RemovedComponent<T> {
  removed: ComponentConstructor<T>,
}

export interface IComponent {
}

export enum ComponentStatus {
  NoChanges,
  Created,
  Updated,
  Removed,
  NotFound
}

export interface IEntity<A extends IComponent = IComponent> extends IEventEmitter<EntityEvents> {
  getId(): number;

  listComponents(): IComponent[];

  listComponentsWithTypes(): { component: IComponent; type: ComponentConstructor<IComponent> }[];

  listComponentsWithTags(): { tag: string, component: IComponent }[];

  hasComponent<T extends A>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void): boolean;

  getComponent<T extends A>(componentClass: ComponentConstructor<T>): Readonly<T>;

  setComponent<T extends A>(componentClass: ComponentConstructor<T>, data: ComponentData<T>): Readonly<T>;

  updateComponent<T extends A>(componentClass: ComponentConstructor<T>, data: Partial<ComponentData<T>>): Readonly<T>

  removeComponent<T extends A>(componentClass: ComponentConstructor<T>): void;

  hasPrevComponent<T extends A>(componentClass: ComponentConstructor<T>, existsCallback?: (component: T) => void): boolean;

  getPrevComponent<T extends A>(componentClass: ComponentConstructor<T>): Readonly<T>;

  getComponentStatus<T extends A>(componentClass: ComponentConstructor<T>): ComponentStatus;
}

export interface IEntityWithCommit<A extends IComponent = IComponent> extends IEntity<A>{
  commit(): void;
}

export interface ISystem {
  onAttach(engine: IEngine): void;

  execute(engine: IEngine, delta: number): void;
}

export interface IEngine extends IEventEmitter<EngineEvents>, IEntityCollection, IFamilyFactory {
  addEntity(entity: IEntityWithCommit): void;

  removeEntity(entity: IEntity): void;

  addSystem(system: ISystem): void;

  getSystems(): ISystem[];

  update(delta: number): void;

  createNextEntity(): IEntityWithCommit;
}

export interface IEntityCollection {
  getEntities(): IEntity[];
}

export interface IFamilyFactory {
  createFamily(...components: ComponentFilter): IEntityCollection;
}
