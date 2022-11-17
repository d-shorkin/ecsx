import {
  ComponentConstructor,
  ComponentFilter,
  EngineEvents,
  EntityUpdateEvent,
  IComponent,
  IEngine,
  IEntity,
  IEntityCollection, IReactEngine, IReactFactory, ReactCreateEvent, ReactRemoveEvent, ReactUpdateEvent,
  SystemType
} from "../Contract/Core";
import {EventEmitter} from "../Events/EventEmitter";
import {Family} from "./Family";
import {Entity} from "./Entity";
import {ReactEngine} from "./ReactEngine";

type Families = { [p: string]: IEntityCollection };

export class Engine extends EventEmitter<EngineEvents> implements IEngine {
  private entities: { [id: number]: IEntity } = {};
  private entitiesArray: IEntity[] = [];
  private removingEntities: IEntity[] = [];
  private systems: SystemType[] = [];
  private families: Families = {};
  private nextEntityId: number = 1;
  private reactEngine: IReactEngine;

  constructor() {
    super();
    this.reactEngine = new ReactEngine(this);
  }

  getEntityById(id: number): IEntity | null {
    return this.entities[id] || null
  }

  getEntities(): IEntity[] {
    return this.entitiesArray;
  }

  each(cb: (entity: IEntity, index: number, entities: IEntity[]) => void): IEntityCollection {
    this.entitiesArray.forEach(cb);
    return this
  }

  createEntity(): IEntity {
    const entity = new Entity(this.nextEntityId++, this.reactEngine)
    this.emit("entityAdded", entity);
    entity.on("createComponent", this.onComponentCreate);
    entity.on("removeComponent", this.onComponentRemove);
    entity.on("updateComponent", this.onComponentUpdate);
    this.entities[entity.getId()] = entity
    this.entitiesArray.push(entity)
    return entity;
  }

  removeEntity(entity: IEntity): void {
    entity.listComponentsWithTypes().forEach(({type}) => {
      entity.removeComponent(type);
    });

    entity.removeListener("createComponent", this.onComponentCreate);
    entity.removeListener("removeComponent", this.onComponentRemove);
    entity.removeListener("updateComponent", this.onComponentUpdate);

    this.removingEntities.push(entity);
  }

  getSystems(): SystemType[] {
    return this.systems;
  }

  addSystem(system: SystemType): void {
    this.reactEngine.setCurrentSystem(system)

    system.attach(this)

    this.systems.push(system)
  }

  removeSystem(system: SystemType): void {
    const index = this.systems.indexOf(system)

    if(index === -1){
      return;
    }

    this.systems.splice(index, 1)

    if ('destroy' in system) {
      system.destroy()
    }
  }

  update(delta: number): void {
    this.emit("beforeUpdate", this);

    this.systems.forEach((system) => {
      this.reactEngine.setCurrentSystem(system)
      if ('run' in system) {
        system.run(delta)
      }
    })

    if (this.removingEntities.length) {
      this.removingEntities.forEach(e => delete this.entities[e.getId()])
      this.entities = Object.values(this.entities)
    }

    this.emit("afterUpdate", this);
  }

  createFamily(...components: ComponentFilter): IEntityCollection {
    if (!components.length) {
      return this
    }

    let key = '';

    const include: ComponentConstructor[] = [];
    const exclude: ComponentConstructor[] = [];

    for (let c of components) {
      if (typeof c === "object") {
        if ('not' in c) {
          exclude.push(c['not']);
        }
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

  react(): IReactFactory {
    return this.reactEngine;
  }

  private onComponentCreate = (data: ReactCreateEvent<IComponent>) => {
    this.emit("entityUpdated", data.entity);
    this.reactEngine.afterCreateComponent(data)
  };

  private onComponentUpdate = (data: ReactUpdateEvent<IComponent>) => {
    this.reactEngine.updateComponent(data)
  };

  private onComponentRemove = (data: ReactRemoveEvent<IComponent>) => {
    this.reactEngine.beforeRemoveComponent(data)
    this.emit("entityUpdated", data.entity);
  };
}
