import {IEngine, IEntity, IFamily, IRunSystem} from "@ecsx/core";
import {ContainerComponent, DisplayObjectComponent} from "../components";
import {DisplayObject} from "@pixi/display";

export class DisplayObjectSystem implements IRunSystem {
  private containers: IFamily;

  attach(engine: IEngine): void {
    this.containers = engine.createFamily(ContainerComponent)
  }

  run(delta: number): void {
    this.containers.each((entity) => {
      this.setDisplayObject(entity, entity.getComponent(ContainerComponent).container)
    })
  }

  private setDisplayObject(entity: IEntity, displayObject: DisplayObject) {
    if (!entity.hasComponent(DisplayObjectComponent)) {
      entity.setComponent(DisplayObjectComponent, {displayObject})
      return;
    }

    const obj = entity.getComponent(DisplayObjectComponent)
    if (obj.displayObject !== displayObject) {
      obj.displayObject = displayObject
    }
  }

}
