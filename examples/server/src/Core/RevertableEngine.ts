import {
  ComponentFilter,
  EngineEvents, Entity,
  EventEmitter,
  IEngine,
  IEntity,
  IEntityCollection,
  IEntityWithCommit,
  ISystem
} from "@ecsx/core";
import {RevertableEntity} from "./RevertableEntity";

export interface ActionPair {
  time: number;
  action: (engine: IEngine) => void;
}

export class RevertableEngine extends EventEmitter<EngineEvents> implements IEngine {
  private actions: ActionPair[] = [];
  private base: IEngine;
  private nextEntityId: number = 1;
  private revertableState: RevertableEntity[] = [];
  private revertableNextEntityId: number = 1;
  private deltas: number[] = [];
  private revertTime: number = .5;


  constructor(base: IEngine) {
    super();
    this.base = base;
    this.base.addListener('entityAdded', (...args) => this.emit('entityAdded', ...args));
    this.base.addListener('entityUpdated', (...args) => this.emit('entityUpdated', ...args));
    this.base.addListener('entityRemoved', (...args) => this.emit('entityRemoved', ...args));
    this.base.addListener('beforeUpdate', (...args) => this.emit('beforeUpdate', ...args));
    this.base.addListener('afterUpdate', (...args) => this.emit('afterUpdate', ...args));
  }

  addEntity(entity: IEntityWithCommit): void {
    return this.base.addEntity(new RevertableEntity(entity));
  }

  addSystem(system: ISystem): void {
    this.base.addSystem(system);
  }

  getSystems(): ISystem[] {
    return this.base.getSystems();
  }

  removeEntity(entity: IEntity): void {
    return this.base.removeEntity(entity);
  }

  update(delta: number): void {
    this.revert();
    this.deltas.push(delta);
    let deltasTime = this.deltas.reduce((acc, t) => acc + t, 0);
    const newDeltas = [];
    this.deltas.reduce(() => {

    }, deltasTime);
  }

  getEntities(): IEntity[] {
    return this.base.getEntities();
  }

  createFamily(...components: ComponentFilter): IEntityCollection {
    return this.base.createFamily();
  }

  createNextEntity(): IEntityWithCommit {
    return new Entity(this.nextEntityId++);
  }

  private revert() {
    this.base.getEntities().forEach(entity => {
      if (!this.revertableState.includes(entity as RevertableEntity)) {
        this.base.removeEntity(entity);
      }
    });

    const currentEntities: RevertableEntity[] = this.base.getEntities() as RevertableEntity[];

    this.revertableState.forEach(entity => {
      entity.revert();
      if (!currentEntities.includes(entity)) {
        this.base.addEntity(entity);
      }
    });

    this.nextEntityId = this.revertableNextEntityId;
  }

  saveRevertableState() {
    this.revertableNextEntityId = this.nextEntityId;
    this.revertableState = [...this.base.getEntities() as RevertableEntity[]];
    this.revertableState.forEach((entity) => entity.saveRevertableState());
  }
}