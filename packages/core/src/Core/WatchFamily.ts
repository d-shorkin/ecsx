import {
  ComponentConstructor,
  IComponent,
  IEntity,
  IWatchEntry,
  IWatchFamily,
  ReactCreateEvent,
  ReactRemoveEvent,
  ReactUpdateEvent,
  WatchType
} from "../Contract/Core";

export class WatchFamily<T extends IComponent> implements IWatchFamily<T> {

  private entries: IWatchEntry<T>[] = []

  constructor(
    private type: WatchType[],
    private watch: ComponentConstructor,
    private included: ComponentConstructor[],
    private excluded: ComponentConstructor[]
  ) {

  }

  each(cb: (entry: IWatchEntry<T>, index: number, entries: Array<IWatchEntry<T>>) => void) {
    this.entries.forEach(cb)
  }

  getEntries(): Array<IWatchEntry<T>> {
    return this.entries;
  }

  clearEntries() {
    this.entries.length = 0;
  }

  onComponentCreate({entity, component, componentClass}: ReactCreateEvent<T>): void {
    if(componentClass !== this.watch){
      return;
    }

    if(!this.type.includes(WatchType.CREATED)){
      return;
    }

    if(!this.isIncludedEntity(entity)){
      return;
    }

    this.entries.push({
      entity,
      componentClass,
      component,
      prev: null
    })
  }

  onComponentUpdate({entity, componentClass, component, prev}: ReactUpdateEvent<T>): void {
    if(componentClass !== this.watch){
      return;
    }

    if(!this.type.includes(WatchType.UPDATED)){
      return;
    }

    if(!this.isIncludedEntity(entity)){
      return;
    }

    this.entries.push({
      entity,
      componentClass,
      component,
      prev
    })
  }

  onComponentRemove({entity, component, componentClass}: ReactRemoveEvent<T>): void {
    if(componentClass !== this.watch){
      return;
    }

    if(!this.type.includes(WatchType.REMOVED)){
      return;
    }

    if(!this.isIncludedEntity(entity)){
      return;
    }

    this.entries.push({
      entity,
      componentClass,
      component: null,
      prev: component
    })
  }

  private isIncludedEntity(entity: IEntity): boolean {
    if (this.included.some((type) => (!entity.hasComponent(type)))) {
      return false;
    }

    if (this.excluded.some((type) => (entity.hasComponent(type)))) {
      return false;
    }

    return true;
  }

}
