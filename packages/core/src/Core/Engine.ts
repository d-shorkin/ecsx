import {
  ComponentConstructor,
  ComponentFilter,
  EngineEvents,
  IComponent,
  IEngine,
  IEntity,
  IFamily,
  IMutableEntityCollection,
  IWatchFamily,
  ReactCreateEvent,
  ReactRemoveEvent,
  ReactUpdateEvent,
  SystemType, WatchType
} from "../Contract/Core";
import {EventEmitter} from "../Events/EventEmitter";
import {Entity} from "./Entity";
import {FamilyFactory} from "./FamilyFactory";
import {MutableEntityCollection} from "./MutableEntityCollection";
import {BaseFamily} from "./BaseFamily";
import {WatchFamilyFactory} from "./WatchFamilyFactory";
import {MapEntity} from "./MapEntity";

export class Engine extends EventEmitter<EngineEvents> implements IEngine {
  private entities: IMutableEntityCollection = new MutableEntityCollection();
  private removingEntities: IEntity[] = [];
  private systems: SystemType[] = [];
  private nextEntityId: number = 1;
  private familyFactory: FamilyFactory;
  private tickActions: ReactCreateEvent<IComponent>[] = [];
  private readonly watchFamilyFactory: WatchFamilyFactory;
  private readonly baseFamily: IFamily;

  constructor() {
    super();
    this.familyFactory = new FamilyFactory(this);
    this.watchFamilyFactory = new WatchFamilyFactory()
    this.baseFamily = new BaseFamily(this.entities);
  }

  createEntity(): IEntity {
    const entity = new MapEntity(this.nextEntityId++, this.watchFamilyFactory)
    this.emit("entityAdded", entity);
    entity.on("createComponent", this.onComponentCreate);
    entity.on("removeComponent", this.onComponentRemove);
    entity.on("updateComponent", this.onComponentUpdate);
    entity.on("createAction", this.onCreateAction);
    this.entities.add(entity);
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
      if ('run' in system) {
        system.run(delta)
      }
    })

    if (this.removingEntities.length) {
      this.removingEntities.forEach(e => this.entities.remove(e.getId()))
      this.removingEntities = [];
    }

    this.tickActions.map(({entity, componentClass}) => {
      entity.removeComponent(componentClass)
    })

    this.watchFamilyFactory.clear(false)

    this.emit("afterUpdate", this);
  }

  createFamily(...components: ComponentFilter): IFamily {
    return this.familyFactory.createFamily(...components)
  }

  createWatchFamily<T extends IComponent>(type: WatchType[], watch: ComponentConstructor<T>, filter?: ComponentFilter, autoClear?: boolean): IWatchFamily<T> {
    return this.watchFamilyFactory.createWatchFamily(type, watch, filter, autoClear);
  }

  getCommonFamily(): IFamily {
    return this.baseFamily;
  }

  private onComponentCreate = (data: ReactCreateEvent<IComponent>) => {
    this.emit("entityUpdated", data.entity);
    this.watchFamilyFactory.onComponentCreate(data)
  };

  private onComponentUpdate = (data: ReactUpdateEvent<IComponent>) => {
    this.watchFamilyFactory.onComponentUpdate(data)
  };

  private onComponentRemove = (data: ReactRemoveEvent<IComponent>) => {
    this.watchFamilyFactory.onComponentRemove(data)
    this.emit("entityUpdated", data.entity);
  };

  private onCreateAction = (data: ReactCreateEvent<IComponent>) => {
    this.tickActions.push(data)
  };
}
