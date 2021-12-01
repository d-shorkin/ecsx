import {IEngine, IEntityCollection, ISystem} from "@ecsx/core";
import {BodyParams} from "@ecsx/matterjs";
import {MovementAcceleration, MovementAngularAcceleration, MovementInputs} from "../components";
import * as Matter from "matter-js";

export class MovementDecreaseVelocitySystem implements ISystem {
  private bodies: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.bodies = engine.createFamily(BodyParams);
  }

  execute(engine: IEngine, delta: number): void {
    this.bodies.getEntities().forEach((entity) => {
      if (entity.hasComponent(MovementInputs) && (entity.getComponent(MovementInputs).acceleration || entity.getComponent(MovementInputs).deceleration)) {
        return;
      }

      const {velocityX, velocityY} = entity.getComponent(BodyParams);

      const accelerationSpeed = ((entity.hasComponent(MovementAcceleration) ?
        entity.getComponent(MovementAcceleration).acceleration : 1)) * .25;

      const currentVelocity = Matter.Vector.create(velocityX, velocityY);
      const decelerationVector = Matter.Vector.mult(Matter.Vector.normalise(currentVelocity), -accelerationSpeed * delta);
      const resultVector = Matter.Vector.create(velocityX + decelerationVector.x, velocityY + decelerationVector.y);
      if (Matter.Vector.magnitude(currentVelocity) < Matter.Vector.magnitude(resultVector)) {
        entity.updateComponent(BodyParams, {velocityX: 0, velocityY: 0});
      } else {
        entity.updateComponent(BodyParams, {velocityX: resultVector.x, velocityY: resultVector.y});
      }
    });
  }

}