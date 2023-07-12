import {ComponentConstructor, IComponent, IEngine, IEntity, IRunSystem, IWatchFamily, WatchType} from "@ecsx/core";


export interface ConnectSystemOptions<T extends IComponent = IComponent> {
  componentClass: ComponentConstructor<T>,
  connect: (entity: IEntity) => void
  disconnect: (entity: IEntity) => void
}

export class ConnectSystem implements IRunSystem {
  private createFamily: IWatchFamily;
  private updateFamily: IWatchFamily;
  private removeFamily: IWatchFamily;

  constructor(private options: ConnectSystemOptions) {

  }

  attach(engine: IEngine): void {
    this.createFamily = engine.createWatchFamily([WatchType.CREATED], this.options.componentClass)
    this.updateFamily = engine.createWatchFamily([WatchType.UPDATED], this.options.componentClass)
    this.removeFamily = engine.createWatchFamily([WatchType.REMOVED], this.options.componentClass)
  }

  run(delta: number): void {

  }

}
