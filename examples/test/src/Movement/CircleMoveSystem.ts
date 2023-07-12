import {IEngine, IFamily, IRunSystem} from "@ecsx/core";
import {CircleMoveComponent, PivotComponent, PositionComponent} from "./components";

export class CircleMoveSystem implements IRunSystem {
  private family: IFamily;

  attach(engine: IEngine): void {
    this.family = engine.createFamily(CircleMoveComponent, PositionComponent)
  }

  run(delta: number): void {
    this.family.each((entity) => {
      let pivot: PivotComponent = entity.hasComponent(PivotComponent) ? entity.getComponent(PivotComponent) : new PivotComponent()
      const speed = entity.getComponent(CircleMoveComponent).speed
      const basePosition = entity.getComponent(PositionComponent);

      const position: PositionComponent = {
        x: basePosition.x - pivot.x,
        y: basePosition.y - pivot.y,
        z: basePosition.z - pivot.z
      }

      const cs = Math.cos(speed * delta);
      const sn = Math.sin(speed * delta);

      position.x = position.x * cs - position.y * sn;
      position.y = position.x * sn + position.y * cs;

      entity.setComponent(PositionComponent, {
        x: position.x + pivot.x,
        y: position.y + pivot.y,
        z: position.z + pivot.z
      })
    })
  }

}
