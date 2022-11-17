import {
  ComponentConstructor,
  IComponent,
  IEngine,
  ISystem,
} from "@ecsx/core";

export enum SyncConsumerSystemItemMethod {
  CREATE = 'create',
  UPDATE = 'update',
  REMOVE = 'remove'
}

export interface SyncConsumerSystemItem<T extends IComponent = IComponent> {
  component: ComponentConstructor<T>
  methods: Array<SyncConsumerSystemItemMethod>
  stringify: (component: T) => string
}

export interface Client {
  prepareData(entityId: number, tag: string, data: string): void
}

export class SyncConsumerSystem implements ISystem {

  private config: SyncConsumerSystemItem[]
  private client: Client;

  constructor(client: Client,config: SyncConsumerSystemItem[]) {
    this.config = config;
    this.client = client
  }

  attach(engine: IEngine): void {
  }

/*  react(factory: IReactFactory): void {

    this.config.forEach(({component, methods, stringify}) => {
      if(methods.includes(SyncConsumerSystemItemMethod.CREATE)){
        factory.onCreate({
          type: component
        }, ({entity, tag, component}) => {
          entity.
          stringify(component)
        })
      }
    })

    factory.onCreate({
      type:
    }, ({entity}) => {
      entity.setComponent(SyncComponent)
    })

    factory.onUpdate()

    factory.onRemove()
  }*/
}
