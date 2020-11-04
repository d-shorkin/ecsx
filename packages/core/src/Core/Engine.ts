import {
  ComponentConstructor,
  EngineEvents, EntityUpdateEvent, IComponent,
  IEngine,
  IEntity, IEntityCollection,
  ISystem, NotComponent
} from "../Contract/Core";
import {EventEmitter} from "../Events/EventEmitter";
import {Family} from "./Family";

type SystemWithLoopCounter = {
  loop: number,
  system: ISystem
};

type Families = { [p: string]: IEntityCollection };

export class Engine extends EventEmitter<EngineEvents> implements IEngine {
  private entities: IEntity[] = [];
  private systems: SystemWithLoopCounter[] = [];
  private families: Families = {};

  private currentLoop: number = 1;
  private lastLoop: number = 0;

  getEntities(): IEntity[] {
    return this.entities;
  }

  addEntity(entity: IEntity): void {
    if (entity.getId()) {
      throw new Error("Entity id must be 0 for add to engine")
    }
    this.entities.push(entity);
    this.emit("entityAdded", entity);
    entity.on("putComponent", this.onEntityUpdate);
    entity.on("removeComponent", this.onEntityUpdate);
  }

  removeEntity(entity: IEntity): void {
    entity.removeListener("putComponent", this.onEntityUpdate);
    entity.removeListener("removeComponent", this.onEntityUpdate);

    this.emit("entityRemoved", entity);

    entity.listComponentsWithTypes().forEach(({type}) => {
      entity.removeComponent(type);
    });

    this.entities = this.entities.filter(e => e !== entity);
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
    this.systems.forEach((s) => {
      this.lastLoop = s.loop;
      s.system.execute(this, delta);
      this.currentLoop++;
      s.loop = this.currentLoop;
    });
    this.emit("afterUpdate", this);
  }

  getCurrent(): number {
    return this.currentLoop;
  }

  getLast(): number {
    return this.lastLoop;
  }

  createFamily(...components: (ComponentConstructor<IComponent> | NotComponent<IComponent>)[]): IEntityCollection {
    let key = '';

    const include: ComponentConstructor<IComponent>[] = [];
    const exclude: ComponentConstructor<IComponent>[] = [];

    for (let c of components) {
      if (typeof c === "object") {
        exclude.push(c.not);
      } else {
        include.push(c);
      }
    }

    key += 'i:' + include.map(c => c.tag || c.name).join(',');
    key += 'e:' + exclude.map(c => c.tag || c.name).join(',');

    if (!this.families[key]) {
      this.families[key] = new Family(this, include, exclude);
    }

    return this.families[key];
  }

  private onEntityUpdate = (data: EntityUpdateEvent) => {
    this.emit("entityUpdated", data.entity);
  };
}
