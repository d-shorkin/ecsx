import {ComponentConstructor, IComponent, IEntity, IFamily, NotComponent} from "./Contract";

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
  constructor(...families: IFamily[]){
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
