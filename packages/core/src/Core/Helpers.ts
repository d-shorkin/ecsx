import {ComponentConstructor, IComponent, NotComponent} from "./Contract";

export function castComponent<T extends IComponent>(
  component: IComponent | undefined | null,
  componentClass: ComponentConstructor<T>
): component is T {
  return !!(component && component instanceof componentClass);
}

export function Not<T extends IComponent>(componentClass: ComponentConstructor<T>): NotComponent<T> {
  return {not: componentClass};
}

