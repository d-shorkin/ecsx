import {IEngine, IEntityCollection, IFamily, IRunSystem} from "@ecsx/core";
import {RendererComponent, RendererSetSizeAction} from "../components";

export class RendererSetSizeSystem implements IRunSystem {
  private family: IFamily;

  attach(engine: IEngine): void {
    this.family = engine.createFamily(RendererComponent, RendererSetSizeAction)
  }

  run(delta: number): void {
    this.family.each((entity) => {
      const renderer = entity.getComponent(RendererComponent).renderer
      const size = entity.getComponent(RendererSetSizeAction)
      renderer.setSize(size.width, size.height)
    })
  }
}
