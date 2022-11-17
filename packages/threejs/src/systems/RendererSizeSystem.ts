import {EntityUpdateEvent, IEngine, ISystem} from "@ecsx/core";
import {RendererComponent, RendererSizeComponent} from "../components";

export class RendererSizeSystem implements ISystem {
  attach(engine: IEngine): void {
    engine.react().onCreate(
      {
        type: RendererSizeComponent,
        filter: [RendererComponent]
      },
      this.changeSize
    )
    engine.react().onUpdate(
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
