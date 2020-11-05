export interface IComponent{
}

export type ComponentProps<T extends IComponent> = {
  [K in keyof T]: T[K];
}

export interface ComponentConstructor<T extends IComponent> {
  readonly name: string;
  readonly tag?: string;

  new(): T;
}

export interface IDataPool {
  setComponent<T extends IComponent>(component: ComponentConstructor<T>, props: ComponentProps<T>): void;

  removeComponent<T extends IComponent>(component: ComponentConstructor<T>): void;

  getComponent<T extends IComponent>(component: ComponentConstructor<T>): Readonly<T>;

  hasComponent<T extends IComponent>(component: ComponentConstructor<T>): boolean;

  getComponentChanges(): IComponentChanges<any>;

  hasComponentChanges(): boolean;
}

export interface IComponentChanges<T> {
  isChanged(): boolean;

  isRemoved(): boolean;

  from(): T | null;

  to(): T | null;
}

/*class Test implements IDataPool{
  getComponent() {
  }

  getComponentChanges(): IComponentChanges<any> {
    return undefined;
  }

  hasComponentChanges(): boolean {
    return false;
  }

  removeComponent() {
  }

  setComponent<T extends IComponent>(component: ComponentConstructor<T>, props: ComponentProps<T>) {
  }
}

class TestComponent {
  test: string
}


const c = new Test();

c.setComponent(TestComponent, {test: 's'});*/
