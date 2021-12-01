import {EntityUpdateEvent, IEngine, IReactFactory, IReactSystem} from "@ecsx/core";
import {RendererComponent, RendererSizeComponent} from "../components";

export class RendererSizeSystem implements IReactSystem {
  attach(engine: IEngine): void {

  }

  react(factory: IReactFactory): void {
    factory.onCreate(
      {
        type: RendererSizeComponent,
        filter: [RendererComponent]
      },
      this.changeSize
    )
    factory.onUpdate(
      {
        type: RendererSizeComponent,
        filter: [RendererComponent]
      },
      this.changeSize
    )
  }

  private changeSize = (data: EntityUpdateEvent) => {
    const size = data.entity.getComponent(RendererSizeComponent)
    data.entity.getComponent(RendererComponent).renderer.setSize(size.width, size.height)
  }
}
