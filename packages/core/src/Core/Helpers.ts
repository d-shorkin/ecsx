import {
  ComponentConstructor,
  IComponent, IEntity, IEntityCollection,
  NotComponent,
} from "../Contract/Core";

export function castComponent<T extends IComponent>(
  component: IComponent | undefined | null,
  componentClass: ComponentConstructor<T>
): component is T {
  return !!(component && component instanceof componentClass);
}

export class EntityCompositeCollection implements IEntityCollection {
  private collections: IEntityCollection[] = [];

  constructor(...collections: IEntityCollection[]) {
    this.collections = collections;
  }

  getEntities(): IEntity[] {
    return this.collections.reduce((acc, collection) => {
      collection.getEntities().forEach(e => {
        if(!acc.includes(e)){
          acc.push(e);
        }
      });
      return acc;
    }, [] as IEntity[]);
  }

  getEntityById(id: number): IEntity | null {
    return null;
  }

  each(cb: (entity: IEntity, index: number, entities: IEntity[]) => void): IEntityCollection {
    this.collections.forEach(collection => collection.each(cb))
    return this;
  }
}

export function composeCollections(...collections: IEntityCollection[]): IEntityCollection {
  return new EntityCompositeCollection(...collections);
}

export function Not<T extends IComponent>(componentClass: ComponentConstructor<T>): NotComponent<T> {
  return {not: componentClass};
}
