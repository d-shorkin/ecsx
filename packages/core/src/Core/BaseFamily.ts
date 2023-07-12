import {IEntity, IEntityCollection, IFamily} from "../Contract/Core";

export class BaseFamily implements IFamily{
  constructor(private entities: IEntityCollection) {
  }
  get(id: number): IEntity | null {
    return this.entities.get(id);
  }

  getAll(): IEntity[] {
    return this.entities.getAll();
  }

  each(cb: (entity: IEntity, index: number, entities: IEntity[]) => void) {
    this.entities.getAll().forEach(cb)
  }
}
