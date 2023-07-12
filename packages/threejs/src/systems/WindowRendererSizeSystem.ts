import {IEngine, ISystem} from "@ecsx/core";
import {IsMainRendererTag, RendererComponent, RendererSetSizeAction} from "../components";

export class WindowRendererSizeSystem implements ISystem {
  attach(engine: IEngine): void {
    const family = engine.createFamily(RendererComponent, IsMainRendererTag)
    family.each((entity) => {
      entity.setAction(RendererSetSizeAction, {
        width: window.innerWidth,
        height: window.innerHeight
      })
    })
    window.addEventListener('resize', () => {
      family.each((entity) => {
        entity.setAction(RendererSetSizeAction, {
          width: window.innerWidth,
          height: window.innerHeight
        })
      })
    })
  }
}
