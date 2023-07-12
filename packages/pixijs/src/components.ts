import {IComponent} from "@ecsx/core";
import {Container, DisplayObject} from "@pixi/display";

export class ContainerComponent implements IComponent {
  static tag = 'pixijs/container'

  container: Container
}

export class DisplayObjectComponent implements IComponent {
  static tag = 'pixijs/display-object'

  displayObject: DisplayObject
}
