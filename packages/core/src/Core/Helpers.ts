import {
  ComponentConstructor, ComponentFilter,
  IComponent,
  NotComponent,
} from "../Contract/Core";

export function castComponent<T extends IComponent>(
  component: IComponent | undefined | null,
  componentClass: ComponentConstructor<T>
): component is T {
  return !!(component && component instanceof componentClass);
}

export function Not<T extends IComponent>(componentClass: ComponentConstructor<T>): NotComponent<T> {
  return {not: componentClass};
}

export function parseFilter(filter?: ComponentFilter): {include: ComponentConstructor[], exclude: ComponentConstructor[]} {
  const include: ComponentConstructor[] = [];
  const exclude: ComponentConstructor[] = [];

  if(!filter){
    return {include, exclude}
  }

  for (let c of filter) {
    if (typeof c === "object") {
      if ('not' in c) {
        exclude.push(c['not']);
      }
    } else {
      include.push(c);
    }
  }

  return {include, exclude}
}
