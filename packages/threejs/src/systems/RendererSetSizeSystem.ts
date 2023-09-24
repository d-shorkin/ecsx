import {IEngine, IEntityCollection, IRunSystem} from "@ecsx/core";
import {RendererComponent, RendererSetSizeComponent} from "../components";

export class RendererSizeSystem implements IRunSystem {
  private family: IEntityCollection;

  attach(engine: IEngine): void {
    this.family = engine.createFamily(RendererComponent, RendererSetSizeComponent)
  }

  run(delta: number): void {
    this.family.each((entity) => {
      const renderer = entity.getComponent(RendererComponent).renderer
      const size = entity.getComponent(RendererSetSizeComponent)
      renderer.setSize(size.width, size.height);
      entity.removeComponent(RendererSetSizeComponent)
    })
  }
}
