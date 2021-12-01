import {ComponentConstructor, ComponentStatus, IComponent, IEngine, IEntity, IEntityCollection} from "../Contract/Core";

export class Family implements IEntityCollection {
  private engine: IEngine;
  private included: ComponentConstructor<IComponent>[];
  private excluded: ComponentConstructor<IComponent>[];
  private created: ComponentConstructor<IComponent>[];
  private updated: ComponentConstructor<IComponent>[];
  private removed: ComponentConstructor<IComponent>[];

  private entities: IEntity[] = [];

  // Optimisation
  private removedEntities: { [p: string]: IEntity } = {};
  private updatedEntities: { [p: string]: IEntity } = {};
  private hasRemovedEntities: boolean = false;
  private hasUpdatedEntities: boolean = false;

  constructor(
    engine: IEngine,
    included: ComponentConstructor<IComponent>[],
    excluded: ComponentConstructor<IComponent>[],
    created: ComponentConstructor<IComponent>[],
    updated: ComponentConstructor<IComponent>[],
    removed: ComponentConstructor<IComponent>[]
  ) {
    this.engine = engine;
    this.included = included;
    this.excluded = excluded;
    this.created = created;
    this.updated = updated;
    this.removed = removed;


    this.engine.on("entityAdded", (entity) => {
      if (this.isIncludedEntity(entity)) {
        this.entities.push(entity);
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

  getEntities(): IEntity[] {
    if (this.hasRemovedEntities || this.hasUpdatedEntities) {
      this.entities = this.entities.reduce((acc, e) => {
        if (this.hasRemovedEntities && this.removedEntities[e.getId()]) {
          return acc;
        }
        if (this.updatedEntities[e.getId()]) {
          if (!this.isIncludedEntity(e)) {
            return acc;
          }

          delete this.updatedEntities[e.getId()];
        }
        acc.push(e);
        return acc;
      }, [] as IEntity[]);

      if(this.hasUpdatedEntities){
        Object.values(this.updatedEntities).forEach((entity) => {
          if (this.isIncludedEntity(entity)) {
            this.entities.push(entity);
          }
        });
      }

      this.updatedEntities = {};
      this.removedEntities = {};
      this.hasRemovedEntities = false;
      this.hasUpdatedEntities = false;
    }
    return this.entities;
  }

  private isIncludedEntity(entity: IEntity): boolean {
    if (this.included.some((type) => (!entity.hasComponent(type)))) {
      return false;
    }

    if (this.excluded.some((type) => (entity.hasComponent(type)))) {
      return false;
    }

    if (this.created.some((type) => (entity.getComponentStatus(type) !== ComponentStatus.Created))) {
      return false;
    }

    if (this.updated.some((type) => (entity.getComponentStatus(type) !== ComponentStatus.Updated))) {
      return false;
    }

    if (this.removed.some((type) => (entity.getComponentStatus(type) !== ComponentStatus.Removed))) {
      return false;
    }

    return true;
  }
}
