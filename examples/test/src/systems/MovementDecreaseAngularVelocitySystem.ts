import {IEngine, IEntityCollection, ISystem} from "@ecsx/core";
import {BodyParams} from "@ecsx/matterjs";
import {MovementAngularAcceleration, MovementInputs} from "../components";

export class MovementDecreaseAngularVelocitySystem implements ISystem {
  private bodies: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.bodies = engine.createFamily(BodyParams);
  }

  execute(engine: IEngine, delta: number): void {
    this.bodies.getEntities().forEach((entity) => {
      if (entity.hasComponent(MovementInputs) && (entity.getComponent(MovementInputs).rotateRight || entity.getComponent(MovementInputs).rotateLeft)) {
        return;
      }

      const accelerationSpeed = ((entity.hasComponent(MovementAngularAcceleration) ?
        entity.getComponent(MovementAngularAcceleration).angularAcceleration : .005)) * .25;

      const {angularVelocity} = entity.getComponent(BodyParams);

      if((Math.abs(angularVelocity) - accelerationSpeed * delta) < 0){
        entity.updateComponent(BodyParams, {angularVelocity: 0});
        return;
      }

      entity.updateComponent(BodyParams, {
        angularVelocity: angularVelocity - accelerationSpeed * delta * (angularVelocity < 0 ? -1 : 1)
      });
    });
  }

}