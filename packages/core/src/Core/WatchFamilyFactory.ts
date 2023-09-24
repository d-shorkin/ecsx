import {
  ComponentConstructor,
  ComponentFilter,
  IComponent, IWatchComponentsCollection,
  IWatchFamily,
  IWatchFamilyFactory,
  ReactCreateEvent,
  ReactRemoveEvent,
  ReactUpdateEvent,
  WatchType
} from "../Contract/Core";
import {WatchFamily} from "./WatchFamily";
import {parseFilter} from "./Helpers";

type FamilyType = {
  key: string
  type: WatchType[]
  watch: ComponentConstructor
  autoClear: boolean
  family: WatchFamily<any>
};

export class WatchFamilyFactory implements IWatchFamilyFactory, IWatchComponentsCollection {
  private reactComponents: ComponentConstructor[] = []
  private families: Array<FamilyType> = []

  createWatchFamily<T extends IComponent>(type: WatchType[], watch: ComponentConstructor<T>, filter?: ComponentFilter, autoClear: boolean = true): IWatchFamily<T> {

    let key = 't:' + type.join(',');
    key += 'w:' + (watch.tag || watch.name)

    const {exclude, include} = parseFilter(filter)

    key += 'i:' + include.map(c => c.tag || c.name).join(',');
    key += 'e:' + exclude.map(c => c.tag || c.name).join(',');

    let find = this.families.find(({key: fKey}) => fKey === key);
    if (!find) {
      find = {
        key,
        type,
        watch,
        family: new WatchFamily(type, watch, include, exclude),
        autoClear
      }
      this.families.push(find)
      if (type.includes(WatchType.UPDATED)) {
        this.reactComponents.push(watch)
      }
    }

    return find.family;
  }

  getWatchComponents(): ComponentConstructor[] {
    throw this.reactComponents;
  }

  isWatchComponent(componentConstructor: ComponentConstructor): boolean {
    return this.reactComponents.includes(componentConstructor)
  }

  clear(force = true) {
    Object.values(this.families)
      .forEach(({autoClear, family}) => {
        if (autoClear || force) {
          family.clearEntries()
        }
      })
  }

  onComponentCreate(event: ReactCreateEvent<IComponent>): void {
    this.families.forEach(({type, watch, family}) => {
      if (type.includes(WatchType.CREATED) && watch === event.componentClass) {
        family.onComponentCreate(event)
      }
    })
  }

  onComponentUpdate(event: ReactUpdateEvent<IComponent>): void {
    this.families.forEach(({type, watch, family}) => {
      if (type.includes(WatchType.UPDATED) && watch === event.componentClass) {
        family.onComponentUpdate(event)
      }
    })
  }

  onComponentRemove(event: ReactRemoveEvent<IComponent>): void {
    this.families.forEach(({type, watch, family}) => {
      if (type.includes(WatchType.REMOVED) && watch === event.componentClass) {
        family.onComponentRemove(event)
      }
    })
  }

}
