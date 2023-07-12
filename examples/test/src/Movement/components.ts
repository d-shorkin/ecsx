import {IComponent} from "@ecsx/core";

export class CircleMoveComponent implements IComponent{
  static tag = 'CircleMoveComponent'
  speed: number = 1
}

export class PivotComponent implements IComponent{
  x: number = 0
  y: number = 0
  z: number = 0
}

export class PositionComponent implements IComponent {
  x: number = 0
  y: number = 0
  z: number = 0
}
