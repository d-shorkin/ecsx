import {IComponent, IEntity, ILoopCounter} from "../Contract/Core";

type UpdatesDates<T extends object> = {[K in keyof T]?: number}

export abstract class Component implements IComponent {
  private updates: UpdatesDates<this> = {};
  private createdAt: number;
  private counter: ILoopCounter | null = null;
  private entity: IEntity;

  hasUpdate<K extends keyof this>(...keys: K[]): boolean {
    return keys.some(key => {
      if (!this.counter || this.createdAt >= this.counter.getLast()) {
        return true;
      }
      return !!this.updates[key] && this.updates[key] >= this.counter.getLast();
    });
  }

  getEntity(): IEntity {
    return this.entity;
  }

  _setLoopCounter(counter: ILoopCounter): void {
    this.counter = counter;
    this.createdAt = counter.getCurrent();
  }

  _setEntity(entity: IEntity): void {
    this.entity = entity;
  }

  set<K extends keyof this>(key: K, data: this[K]): void {
    if (this[key] !== data) {
      this[key] = data;
      if (this.counter) {
        this.updates[key] = this.counter.getCurrent();
      }
    }
  }

  destroy(): void {
    // may be overwrite by extends class
  }
}