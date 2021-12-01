import {
  ComponentConstructor, ComponentFilter,
  EngineEvents, EntityGlobalUpdateEvent, EntityUpdateEvent, IComponent,
  IEngine,
  IEntity, IEntityCollection, IEntityWithCommit,
  ISystem
} from "../Contract/Core";
import {EventEmitter} from "../Events/EventEmitter";
import {Family} from "./Family";
import {Entity} from "./Entity";

type SystemWithLoopCounter = {
  loop: number,
  system: ISystem
};

type Families = { [p: string]: IEntityCollection };

export class Engine extends EventEmitter<EngineEvents> implements IEngine {
  private entities: IEntityWithCommit[] = [];
  private removingEntities: IEntity[] = [];
  private systems: SystemWithLoopCounter[] = [];
  private families: Families = {};
  private nextEntityId: number = 1;

  getEntities(): IEntity[] {
    return this.entities;
  }

  addEntity(entity: IEntityWithCommit): void {
    this.entities.push(entity);
    this.emit("entityAdded", entity);
    entity.on("setComponent", this.onEntityUpdate);
    entity.on("removeComponent", this.onEntityUpdate);
    entity.on("updateComponents", this.onEntityUpdate);
    entity.on("setComponent", this.onEntitySetComponent);
    entity.on("setComponent", this.onEntityRemoveComponent);
  }

  removeEntity(entity: IEntity): void {
    entity.listComponentsWithTypes().forEach(({type}) => {
      entity.removeComponent(type);
    });

    entity.removeListener("setComponent", this.onEntityUpdate);
    entity.removeListener("removeComponent", this.onEntityUpdate);
    entity.removeListener("updateComponents", this.onEntityUpdate);
    entity.removeListener("setComponent", this.onEntitySetComponent);
    entity.removeListener("setComponent", this.onEntityRemoveComponent);

    this.removingEntities.push(entity);
  }

  addSystem(system: ISystem): void {
    system.onAttach(this);
    this.systems.push({loop: 0, system});
  }

  getSystems(): ISystem[] {
    return this.systems.map(s => s.system);
  }

  update(delta: number): void {
    this.emit("beforeUpdate", this);
    this.systems.forEach((s) => s.system.execute(this, delta));

    this.entities = this.entities.filter((entity) => {
      if (this.removingEntities.includes(entity)) {
        this.emit("entityRemoved", entity);
        return false;
      }
      entity.commit();
      return true;
    });

    this.emit("afterUpdate", this);
  }

  createFamily(...components: ComponentFilter): IEntityCollection {
    let key = '';

    const include: ComponentConstructor<IComponent>[] = [];
    const exclude: ComponentConstructor<IComponent>[] = [];
    const created: ComponentConstructor<IComponent>[] = [];
    const updated: ComponentConstructor<IComponent>[] = [];
    const removed: ComponentConstructor<IComponent>[] = [];

    for (let c of components) {
      if (typeof c === "object") {
        if (c.hasOwnProperty('not')) {
          exclude.push(c['not']);
        } else if (c.hasOwnProperty('created')) {
          created.push(c['created']);
        } else if (c.hasOwnProperty('updated')) {
          updated.push(c['updated']);
        } else if (c.hasOwnProperty('removed')) {
          removed.push(c['removed']);
        }
      } else {
        include.push(c);
      }
    }

    key += 'i:' + include.map(c => c.tag || c.name).join(',');
    key += 'e:' + exclude.map(c => c.tag || c.name).join(',');
    key += 'c:' + created.map(c => c.tag || c.name).join(',');
    key += 'u:' + updated.map(c => c.tag || c.name).join(',');
    key += 'r:' + removed.map(c => c.tag || c.name).join(',');

    if (!this.families[key]) {
      this.families[key] = new Family(this, include, exclude, created, updated, removed);
    }

    return this.families[key];
  }

  private onEntityUpdate = (data: EntityUpdateEvent | EntityGlobalUpdateEvent) => {
    this.emit("entityUpdated", data.entity);
  };

  private onEntitySetComponent = (e) => {
    this.emit("entitySetComponent", e);
  };

  private onEntityRemoveComponent = (e) => {
    this.emit("entityRemoveComponent", e);
  };

  createNextEntity(): IEntityWithCommit {
    return new Entity(this.nextEntityId++);
  }
}
