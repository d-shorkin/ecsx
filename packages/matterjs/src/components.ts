import {IComponent, IEntity} from "@ecsx/core";
import * as Matter from "matter-js";

export class Engine implements IComponent {
  static tag = 'MatterJs/Engine';

  engine: Matter.Engine;
}

export class Body implements IComponent {
  static tag = 'MatterJs/Body';

  body: Matter.Body;
  engine?: IEntity;
}

export class BodyParams implements IComponent {
  static tag = 'MatterJs/BodyParams';
  positionX: number;
  positionY: number;
  angle: number;
  velocityX: number;
  velocityY: number;
  angularVelocity: number;
}