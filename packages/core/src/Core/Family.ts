import {
  ComponentConstructor,
  IEngine,
  IEntity,
  IFamily,
  IMutableEntityCollection
} from "../Contract/Core";
import {MutableEntityCollection} from "./MutableEntityCollection";

export class Family implements IFamily {
  private entities: IMutableEntityCollection = new MutableEntityCollection();

  // Optimisation
  private removedEntities: IEntity[] = [];
  private updatedEntities: IEntity[] = [];

  constructor(
    private engine: IEngine,
    private included: ComponentConstructor[],
    private excluded: ComponentConstructor[],
  ) {
    this.engine.on("entityAdded", (entity) => {
      if (this.isIncludedEntity(entity)) {
        this.entities.add(entity);
      }
    });

    this.engine.on("entityRemoved", (entity) => {
      this.removedEntities.push(entity);
    });

    this.engine.on("entityUpdated", (entity) => {
      this.updatedEntities.push(entity);
    });

    this.engine.getCommonFamily().each((entity) => {
      if (this.isIncludedEntity(entity)) {
        this.entities.add(entity)
      }
    });
  }

  get(id: number): IEntity | null {
    this.updateEntities();
    return this.entities.get(id)
  }

  getAll(): IEntity[] {
    this.updateEntities();
    return this.entities.getAll();
  }

  each(cb: (entity: IEntity, index: number, entities: IEntity[]) => void) {
    const entities = this.getAll();
    for (let i = 0; i < entities.length; i++) {
      cb(entities[i], i, entities)
    }
  }

  private updateEntities(){
    if (!this.updatedEntities.length && !this.removedEntities.length) {
      return
    }

    this.removedEntities.forEach((entity) => this.entities.remove(entity.getId()))
    this.updatedEntities.forEach((entity) => {
      if(this.isIncludedEntity(entity)) {
        this.entities.add(entity);
      }else {
        this.entities.remove(entity.getId());
      }
    })

    this.updatedEntities = [];
    this.removedEntities = [];
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
}
