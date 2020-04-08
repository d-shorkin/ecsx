import {IComponent, ILoopCounter} from "./Contract";

type UpdatesDates<T extends object> = {[K in keyof T]?: number}

export abstract class Component<T extends object> implements IComponent<T> {
  protected abstract data: T;
  private updates: UpdatesDates<T> = {};
  private createdAt: number;
  private counter: ILoopCounter;

  get<K extends keyof T>(key: K): T[K] {
    return this.data[key];
  }

  set<K extends keyof T>(key: K, data: T[K]): void {
    this.updates[key] = this.counter.getCurrent();
    this.data[key] = data;
  }

  hasUpdate<K extends keyof T>(key: K): boolean {
    if (this.createdAt >= this.counter.getLast()) {
      return true;
    }
    return !!this.updates[key] && this.updates[key] >= this.counter.getLast();
  }

  _setLoopCounter(counter: ILoopCounter): void {
    this.counter = counter;
    this.createdAt = counter.getCurrent();
  }
}

export abstract class TagComponent extends Component<{}> {
  protected data = {};
}