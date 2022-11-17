import {IEngine, ISystem} from "@ecsx/core";
import {RendererComponent, RendererSizeComponent} from "../components";

export class WindowRendererSizeSystem implements ISystem {
  attach(engine: IEngine): void {
    const family = engine.createFamily(RendererComponent, RendererSizeComponent)
    family.each((entity) => {
      entity.setComponent(RendererSizeComponent, {
        width: window.innerWidth,
        height: window.innerHeight
      })
    })
    window.addEventListener('resize', () => {
      family.each((entity) => {
        entity.setComponent(RendererSizeComponent, {
          width: window.innerWidth,
          height: window.innerHeight
        })
      })
    })
  }
}
