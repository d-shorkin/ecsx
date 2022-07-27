import {
  ComponentConstructor,
  IEngine,
  IEntityCollection,
  IReactFactory,
  IReactSystem,
  IRunSystem,
  ISystem
} from "@ecsx/core";
import {SyncComponent} from "../components/SyncComponent";

export interface SyncConsumerConfig<T> {
  component: ComponentConstructor<T>,

  stringify: (component: T) => string
}

export class SyncConsumerSystem implements IReactSystem {

  attach(engine: IEngine): void {
  }

  react(factory: IReactFactory): void {
    factory.onCreate({
      type:
    }, ({entity}) => {
      entity.setComponent(SyncComponent)
    })

    factory.onUpdate()

    factory.onRemove()
  }
}
