import {IEntity, IMutableEntityCollection} from "../Contract/Core";

export class MutableEntityCollection implements IMutableEntityCollection {
  private entities: { [id: number]: IEntity } = {};
  private entitiesArray: IEntity[] = [];

  get(id: number): IEntity | null {
    return this.entities[id] || null;
  }

  getAll(): IEntity[] {
    return this.entitiesArray;
  }

  add(entity: IEntity): IMutableEntityCollection {
    if(!!this.get(entity.getId())){
      return this;
    }
    this.entities[entity.getId()] = entity;
    this.entitiesArray.push(entity);
    return this;
  }

  remove(id: number): IMutableEntityCollection {
    const entity = this.get(id);
    if(!entity){
      return this;
    }

    delete this.entities[id];
    this.entitiesArray = this.entitiesArray.filter(e => e !== entity);
    return this;
  }

  clear(): IMutableEntityCollection {
    this.entities = {};
    this.entitiesArray = []
    return this;
  }

}
