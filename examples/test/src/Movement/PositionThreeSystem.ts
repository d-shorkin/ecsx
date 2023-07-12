import {IEngine, IFamily, IRunSystem} from "@ecsx/core";
import {Object3DComponent} from "@ecsx/threejs";
import {PositionComponent} from "./components";

export class PositionThreeSystem implements IRunSystem {
  private family: IFamily;

  attach(engine: IEngine): void {
    this.family = engine.createFamily(Object3DComponent, PositionComponent)
  }

  run(delta: number): void {
    this.family.each((entity) => {
      const pos = entity.getComponent(PositionComponent);
      const obj = entity.getComponent(Object3DComponent);
      obj.object.position.set(pos.x, pos.y, pos.z);
    })
  }

}
