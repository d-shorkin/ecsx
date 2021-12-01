import {IEngine, IEntityCollection, IInitSystem} from "@ecsx/core";
import {RendererComponent, RendererSizeComponent} from "../components";

export class WindowRendererSizeSystem implements IInitSystem {
  private family: IEntityCollection;

  attach(engine: IEngine): void {
    this.family = engine.createFamily(RendererComponent, RendererSizeComponent)
  }

  init(): void {
    this.family.each((entity) => {
      entity.setComponent(RendererSizeComponent, {
        width: window.innerWidth,
        height: window.innerHeight
      })
    })
    window.addEventListener('resize', () => {
      this.family.each((entity) => {
        entity.setComponent(RendererSizeComponent, {
          width: window.innerWidth,
          height: window.innerHeight
        })
      })
    })
  }
}
