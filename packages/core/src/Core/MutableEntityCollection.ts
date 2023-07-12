import {IEntity, IMutableEntityCollection} from "../Contract/Core";

export class MutableEntityCollection implements IMutableEntityCollection {
  private entities: Map<number, IEntity> = new Map();
  private entitiesArray: IEntity[] = [];

  get(id: number): IEntity | null {
    return this.entities.get(id) || null;
  }

  getAll(): IEntity[] {
    return this.entitiesArray;
  }

  add(entity: IEntity): IMutableEntityCollection {
    if(!!this.get(entity.getId())){
      return this;
    }
    this.entities.set(entity.getId(), entity);
    this.entitiesArray.push(entity);
    return this;
  }

  remove(id: number): IMutableEntityCollection {
    const entity = this.get(id);
    if(!entity){
      return this;
    }

    this.entities.delete(id);
    this.entitiesArray = this.entitiesArray.filter(e => e !== entity);
    return this;
  }

  clear(): IMutableEntityCollection {
    this.entities.clear();
    this.entitiesArray.length = 0
    return this;
  }
}
