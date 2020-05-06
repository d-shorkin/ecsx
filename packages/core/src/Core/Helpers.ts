import {ComponentConstructor, IComponent, IEntity, IFamily, NotComponent} from "../Contract/Core";
import {IRepository, IRepositoryItem} from "../..";

export function castComponent<T extends IComponent>(
  component: IComponent | undefined | null,
  componentClass: ComponentConstructor<T>
): component is T {
  return !!(component && component instanceof componentClass);
}

export function Not<T extends IComponent>(componentClass: ComponentConstructor<T>): NotComponent<T> {
  return {not: componentClass};
}

export class CompositeFamily implements IFamily {
  private families: IFamily[];

  constructor(...families: IFamily[]) {
    this.families = families;
  }

  getEntities(): IEntity[] {
    return this.families.reduce((acc, f) => acc.concat(f.getEntities()), [] as IEntity[]);
  }

  getNews(): IEntity[] {
    return this.families.reduce((acc, f) => acc.concat(f.getNews()), [] as IEntity[]);
  }

  getRemoved(): IEntity[] {
    return this.families.reduce((acc, f) => acc.concat(f.getRemoved()), [] as IEntity[]);
  }
}


export const NullFamily = new class implements IFamily {
  getEntities(): IEntity[] {
    return [];
  }

  getNews(): IEntity[] {
    return [];
  }

  getRemoved(): IEntity[] {
    return [];
  }
};

export class CompositeRepository<T> implements IRepository<T> {
  private repositories: IRepository<T>[];

  constructor(...repositories: IRepository<T>[]){
    this.repositories = repositories;
  }

  getAll(): IRepositoryItem<T>[] {
    return this.repositories.reduce((acc, item) => {
      return acc.concat(item.getAll());
    }, [] as IRepositoryItem<T>[]);
  }

  getBy(entity: IEntity): T {
    for (const r of this.repositories){
      if(r.hasBy(entity)){
        return r.getBy(entity);
      }
    }

    throw new Error(`Object for ${entity.getId()} not found`)
  }

  hasBy(entity: IEntity): boolean {
    return this.repositories.some(r => r.hasBy(entity));
  }

}
