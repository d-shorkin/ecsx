import {IEngine, IEntity, IEntityCollection, ISystem} from "@ecsx/core";
import * as Matter from "matter-js";
import {Body, BodyParams, Engine} from "../components";


export class EngineSystem implements ISystem {
  private engines: IEntityCollection;
  private bodies: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.engines = engine.createFamily(Engine);
    this.bodies = engine.createFamily(Body);
  }

  execute(engine: IEngine, delta: number): void {
    this.bodies.getEntities().forEach((entity: IEntity) => {
      if (entity.hasComponent(BodyParams)) {
        const {positionY, positionX, angle, velocityX, velocityY, angularVelocity} = entity.getComponent(BodyParams);
        if (entity.getComponent(Body).body.position.x !== positionX || entity.getComponent(Body).body.position.y !== positionY) {
          Matter.Body.setPosition(entity.getComponent(Body).body, {x: positionX, y: positionY});
        }
        if (entity.getComponent(Body).body.velocity.x !== velocityX || entity.getComponent(Body).body.velocity.y !== velocityY) {
          Matter.Body.setVelocity(entity.getComponent(Body).body, {x: velocityX, y: velocityY});
        }
        if (entity.getComponent(Body).body.angle !== angle) {
          Matter.Body.setAngle(entity.getComponent(Body).body, angle);
        }
        if (entity.getComponent(Body).body.angularVelocity !== angularVelocity) {
          Matter.Body.setAngularVelocity(entity.getComponent(Body).body, angularVelocity);
        }
      }
    });
    this.engines.getEntities().forEach((entity: IEntity) => {
      Matter.Engine.update(entity.getComponent(Engine).engine, delta / (1000 / 16 / 1000), 1);
    });
    this.bodies.getEntities().forEach((entity: IEntity) => {
      entity.setComponent(BodyParams, {
        angularVelocity: entity.getComponent(Body).body.angularVelocity,
        angle: entity.getComponent(Body).body.angle,
        positionX: entity.getComponent(Body).body.position.x,
        positionY: entity.getComponent(Body).body.position.y,
        velocityX: entity.getComponent(Body).body.velocity.x,
        velocityY: entity.getComponent(Body).body.velocity.y,
      });
    })
  }
}