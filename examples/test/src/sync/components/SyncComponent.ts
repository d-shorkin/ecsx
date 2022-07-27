import {ComponentConstructor, IComponent} from "@ecsx/core";


export class SyncComponent<T extends IComponent = IComponent> implements IComponent {
  component: ComponentConstructor<T>;

  stringify?: (component: T) => string;

  parse?: (str: string) => T
}
