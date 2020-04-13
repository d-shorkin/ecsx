import {ComponentConstructor, IComponent, IEngine, IEntity, IFamily} from "./Contract";

export class Family implements IFamily {
  private engine: IEngine;
  private included: ComponentConstructor<IComponent>[] = [];
  private excluded: ComponentConstructor<IComponent>[] = [];

  private entities: IEntity[] = [];
  private news: IEntity[] = [];
  private removed: IEntity[] = [];

  constructor(engine: IEngine, included: ComponentConstructor<IComponent>[], excluded: ComponentConstructor<IComponent>[]) {
    this.engine = engine;
    this.included = included;
    this.excluded = excluded;

    this.engine.on("entityAdded", (entity) => {
      if (this.isIncludedEntity(entity)) {
        this.entities.push(entity);
        this.news.push(entity);
      }
    });

    this.engine.on("entityRemoved", (entity) => {
      const index = this.entities.findIndex((e) => entity === e);
      if (index === -1) {
        return;
      }

      this.entities.splice(index, 1);
      this.removed.push(entity);
    });

    this.engine.on("entityUpdated", (entity) => {
      const index = this.entities.findIndex((e) => entity === e);
      if (index !== -1) {
        if (!this.isIncludedEntity(entity)) {
          this.entities.splice(index, 1);
          this.removed.push(entity);
        }
      } else if (this.isIncludedEntity(entity)) {
        this.entities.push(entity);
        this.news.push(entity);
      }
    });

    engine.on("beforeUpdate", () => {
      this.news = [];
      this.removed = [];
    });

    this.entities = this.engine.getEntities().filter(this.isIncludedEntity.bind(this));
    this.news = [...this.entities];
  }

  getEntities(): IEntity[] {
    return this.entities;
  }

  getNews(): IEntity[] {
    return this.news;
  }

  getRemoved(): IEntity[] {
    return this.removed;
  }

  private isIncludedEntity(entity: IEntity): boolean {
    if (this.included.some((type) => (!entity.hasComponent(type)))) {
      return false;
    }

    return !this.excluded.some((type) => (entity.hasComponent(type)));
  }
}
