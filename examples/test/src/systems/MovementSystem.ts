import {IEngine, IEntity, IEntityCollection, ISystem} from "@ecsx/core";
import {MovementAcceleration, MovementAngularAcceleration, MovementInputs, Player} from "../components";
import {BodyParams} from "@ecsx/matterjs";
import * as Matter from "matter-js";

export class MovementSystem implements ISystem {
  private movement: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.movement = engine.createFamily(Player, MovementInputs, BodyParams);
  }

  execute(engine: IEngine, delta: number): void {
    this.movement.getEntities().forEach((entity: IEntity) => {
      const {acceleration, deceleration, rotateRight, rotateLeft} = entity.getComponent(MovementInputs);
      const {angle} = entity.getComponent(BodyParams);

      if (acceleration) {
        const accelerationSpeed = entity.hasComponent(MovementAcceleration) ? entity.getComponent(MovementAcceleration).acceleration : 1;
        const accelerationVector = Matter.Vector.create(
          Math.cos(angle) * accelerationSpeed * delta,
          Math.sin(angle) * accelerationSpeed * delta
        );
        const {velocityX, velocityY} = entity.getComponent(BodyParams);
        entity.updateComponent(BodyParams, {
          velocityX: velocityX + accelerationVector.x,
          velocityY: velocityY + accelerationVector.y
        })
      } else if (deceleration) {
        const accelerationSpeed = entity.hasComponent(MovementAcceleration) ? entity.getComponent(MovementAcceleration).acceleration : 1;
        const {velocityX, velocityY} = entity.getComponent(BodyParams);

        const currentVelocity = Matter.Vector.create(velocityX, velocityY);
        const decelerationVector = Matter.Vector.mult(Matter.Vector.normalise(currentVelocity), -accelerationSpeed * delta);
        const resultVector = Matter.Vector.create(velocityX + decelerationVector.x, velocityY + decelerationVector.y);
        if (Matter.Vector.magnitude(currentVelocity) < Matter.Vector.magnitude(resultVector)) {
          entity.updateComponent(BodyParams, {velocityX: 0, velocityY: 0});
        } else {
          entity.updateComponent(BodyParams, {velocityX: resultVector.x, velocityY: resultVector.y});
        }
      }

      if (rotateRight || rotateLeft) {
        let accelerationSpeed = entity.hasComponent(MovementAngularAcceleration) ?
          entity.getComponent(MovementAngularAcceleration).angularAcceleration : .005;

        accelerationSpeed /= rotateLeft ? -1 : 1;

        const {angularVelocity} = entity.getComponent(BodyParams);

        entity.updateComponent(BodyParams, {
          angularVelocity: angularVelocity + accelerationSpeed * delta
        })
      }
    });
  }
}