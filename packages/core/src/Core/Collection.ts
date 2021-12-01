import {IEntity} from "../Contract/Core";

export class Collection<T> {
  private collection: { [p: string]: T } = {};

  set(entity: IEntity, value: T): void {
    this.collection[entity.getId().toString()] = value;
  };

  get(entity: IEntity): T | undefined {
    return this.collection[entity.getId().toString()];
  }
}