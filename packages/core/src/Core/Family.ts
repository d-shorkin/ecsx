import {ComponentConstructor, IComponent, IEngine, IEntity, IEntityCollection} from "../Contract/Core";

export class Family implements IEntityCollection {
  private engine: IEngine;
  private included: ComponentConstructor<IComponent>[];
  private excluded: ComponentConstructor<IComponent>[];

  private entities: {[p: number]: IEntity} = {};
  private entitiesArray: IEntity[] = [];

  // Optimisation
  private removedEntities: { [p: string]: IEntity } = {};
  private updatedEntities: { [p: string]: IEntity } = {};
  private hasRemovedEntities: boolean = false;
  private hasUpdatedEntities: boolean = false;

  constructor(
    engine: IEngine,
    included: ComponentConstructor<IComponent>[],
    excluded: ComponentConstructor<IComponent>[],
  ) {
    this.engine = engine;
    this.included = included;
    this.excluded = excluded;


    this.engine.on("entityAdded", (entity) => {
      if (this.isIncludedEntity(entity)) {
        this.entities[entity.getId()] = entity;
      }
    });

    this.engine.on("entityRemoved", (entity) => {
      this.removedEntities[entity.getId()] = entity;
      this.hasRemovedEntities = true;
    });

    this.engine.on("entityUpdated", (entity) => {
      this.updatedEntities[entity.getId()] = entity;
      this.hasUpdatedEntities = true;
    });

    this.entities = this.engine.getEntities().filter(this.isIncludedEntity.bind(this));
  }

  getEntityById(id: number): IEntity | null {
    this.updateEntities();
    return this.entities[id] || null
  }

  getEntities(): IEntity[] {
    this.updateEntities();
    return this.entitiesArray;
  }

  private updateEntities(){
    if (!this.hasRemovedEntities && !this.hasUpdatedEntities) {
      return
    }

    Object.keys(this.removedEntities).forEach((id) => delete this.entities[id])
    Object.keys(this.updatedEntities).forEach((id) => {
      const entity = this.entities[id];
      if(!entity && this.isIncludedEntity(this.updatedEntities[id])){
        this.entities[id] = this.updatedEntities[id]
      }

      if(entity && !this.isIncludedEntity(this.updatedEntities[id])){
        delete this.entities[id]
      }
    })

    this.entitiesArray = Object.values(this.entities)

    this.updatedEntities = {};
    this.removedEntities = {};
    this.hasRemovedEntities = false;
    this.hasUpdatedEntities = false;
  }

  private isIncludedEntity(entity: IEntity): boolean {
    if (this.included.some((type) => (!entity.hasComponent(type)))) {
      return false;
    }

    if (this.excluded.some((type) => (entity.hasComponent(type)))) {
      return false;
    }

    return true;
  }

  each(cb: (entity: IEntity, index: number, entities: IEntity[]) => void): IEntityCollection {
    this.entitiesArray.forEach(cb)
    return this;
  }
}
