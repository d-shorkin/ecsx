import {IComparator, IRepositoryItem} from "../Contract/Repository";
import {ComponentConstructor, IComponent, IEntity} from "../Contract/Core";

export abstract class Comparator<T> implements IComparator<T> {
  private objects: { [p: string]: IRepositoryItem<T> & { using: boolean } } = {};

  protected abstract fuse: ComponentConstructor<IComponent>[] = [];

  compare(entity: IEntity): void {
    const id = entity.getId().toString();
    if (!this.objects[id]) {
      const created = this.useFuse(entity) && this.create(entity);
      if (created) {
        this.objects[id] = {item: created, entity, using: true};
      }
    } else {
      const updated = this.useFuse(entity) && this.update(entity, this.objects[id].item);
      if (updated) {
        this.objects[id].item = updated;
        this.objects[id].using = true;
      }
    }
  }

  clear(): void {
    for (const id in this.objects) {
      if (this.objects[id].using) {
        this.objects[id].using = false;
        continue;
      }

      this.destroy(this.objects[id].entity, this.objects[id].item);
      delete this.objects[id];
    }
  }

  getAll(): IRepositoryItem<T>[] {
    return Object.values(this.objects);
  }

  getBy(entity: IEntity): T {
    const id = entity.getId().toString();
    if (!this.objects[id]) {
      throw new Error(`Object for ${id} not found`)
    }
    return this.objects[id].item;
  }

  hasBy(entity: IEntity): boolean {
    return !!this.objects[entity.getId().toString()];
  }

  private useFuse(entity: IEntity): boolean {
    return this.fuse.every(c => entity.hasComponent(c));
  }

  protected abstract create(entity: IEntity): T | null;

  protected abstract update(entity: IEntity, obj: T): T | null;

  protected abstract destroy(entity: IEntity, obj: T): void;
}