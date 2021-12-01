import {IEngine, IEntity, IEntityCollection, ISystem} from "@ecsx/core";
import {BodyParams} from "@ecsx/matterjs";
import {MovementMaxAngularSpeed, MovementMaxSpeed} from "../components";
import * as Matter from "matter-js";

export class MovementLimitSystem implements ISystem {
  private maxSpeedBodies: IEntityCollection;
  private maxAngularSpeedBodies: IEntityCollection;
  private decelerationSpeed: number;

  constructor(decelerationSpeed: number = 20) {
    this.decelerationSpeed = decelerationSpeed;
  }

  onAttach(engine: IEngine): void {
    this.maxSpeedBodies = engine.createFamily(BodyParams, MovementMaxSpeed);
    this.maxAngularSpeedBodies = engine.createFamily(BodyParams, MovementMaxAngularSpeed);
  }

  execute(engine: IEngine, delta: number): void {
    this.maxSpeedBodies.getEntities().forEach((entity: IEntity) => {
      const {velocityX, velocityY} = entity.getComponent(BodyParams);
      const magnitude = Matter.Vector.magnitude({x: velocityX, y: velocityY});
      const maxMagnitude = entity.getComponent(MovementMaxSpeed).maxSpeed;
      if (magnitude > maxMagnitude) {
        let nextMagnitude = magnitude - this.decelerationSpeed * delta;
        if(nextMagnitude < maxMagnitude){
          nextMagnitude = maxMagnitude;
        }

        entity.updateComponent(BodyParams, {
          velocityX: velocityX * (nextMagnitude / magnitude),
          velocityY: velocityY * (nextMagnitude / magnitude),
        })
      }
    });

    this.maxAngularSpeedBodies.getEntities().forEach((entity: IEntity) => {
      const {angularVelocity} = entity.getComponent(BodyParams);
      const absAngularVelocity = Math.abs(angularVelocity);
      const maxAngularVelocity = entity.getComponent(MovementMaxAngularSpeed).maxAngularSpeed;
      if (absAngularVelocity > maxAngularVelocity) {
        let nextAngularVelocity = absAngularVelocity - this.decelerationSpeed * delta;
        if(nextAngularVelocity < maxAngularVelocity){
          nextAngularVelocity = maxAngularVelocity;
        }
        entity.updateComponent(BodyParams, {
          angularVelocity: angularVelocity * (nextAngularVelocity / absAngularVelocity)
        })
      }
    });
  }

}