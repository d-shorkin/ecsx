import {
  ComponentConstructor,
  CreatedComponent,
  IComponent, IEntity, IEntityCollection,
  NotComponent,
  RemovedComponent,
  UpdatedComponent
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
}

export function composeCollections(...collections: IEntityCollection[]): IEntityCollection {
  return new EntityCompositeCollection(...collections);
}

export function Not<T extends IComponent>(componentClass: ComponentConstructor<T>): NotComponent<T> {
  return {not: componentClass};
}

export function Created<T extends IComponent>(componentClass: ComponentConstructor<T>): CreatedComponent<T> {
  return {created: componentClass};
}

export function Updated<T extends IComponent>(componentClass: ComponentConstructor<T>): UpdatedComponent<T> {
  return {updated: componentClass};
}

export function Removed<T extends IComponent>(componentClass: ComponentConstructor<T>): RemovedComponent<T> {
  return {removed: componentClass};
}
