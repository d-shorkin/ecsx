import {IEntity} from "./Core";

export interface IRepository<T> {
  getBy(entity: IEntity): T;

  hasBy(entity: IEntity): boolean;

  getAll(): IRepositoryItem<T>[];
}

export interface IRepositoryItem<T> {
  entity: IEntity;
  item: T;
}

export interface IComparator<T> extends IRepository<T> {
  compare(entity: IEntity): void;

  clear(): void;
}