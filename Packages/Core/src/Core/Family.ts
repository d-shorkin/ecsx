import {ComponentConstructor, IComponent, IEngine, IEntity, IEntityCollection} from "./Contract";

export class Family implements IEntityCollection {
  private engine: IEngine;
  private included: ComponentConstructor<IComponent>[] = [];
  private excluded: ComponentConstructor<IComponent>[] = [];
  private entities: IEntity[] = [];

  constructor(engine: IEngine, included: ComponentConstructor<IComponent>[], excluded: ComponentConstructor<IComponent>[]) {
    this.engine = engine;
    this.included = included;
    this.excluded = excluded;

    this.engine.on("entityAdded", (entity) => {
      if (this.isIncludedEntity(entity)) {
        this.entities.push(entity);
      }
    });

    this.engine.on("entityRemoved", (entity) => {
      const index = this.entities.findIndex((e) => entity === e);
      if (index === -1) {
        return;
      }

      this.entities.splice(index, 1);
    });

    this.engine.on("entityUpdated", (entity) => {
      const index = this.entities.findIndex((e) => entity === e);
      if (index !== -1) {
        if (!this.isIncludedEntity(entity)) {
          this.entities.splice(index, 1);
        }
      } else if (this.isIncludedEntity(entity)) {
        this.entities.push(entity);
      }

    });

    this.recalculateEntities();
  }

  getEntities(): IEntity[] {
    return this.entities;
  }

  private recalculateEntities() {
    this.entities = this.engine.getEntities().filter(this.isIncludedEntity.bind(this));
  }

  private isIncludedEntity(entity: IEntity): boolean {
    if (this.included.some((type) => (!entity.has(type)))) {
      return false;
    }

    return !this.excluded.some((type) => (entity.has(type)));
  }
}
