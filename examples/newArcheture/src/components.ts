import {ElementType, IVector} from "./logic/contract";
import {Changer} from "./Changer";
import {ClipPlayer} from "./animations/animations";

export class ElementPosition {
  x: number;
  y: number;
}

export class ElementPositionAnimation {
  animation: ClipPlayer<IVector>;
}

export class Element {
  type: ElementType;
  id: number;
}

export class Selected {

}

export class Changes {
  duration: number;
  progress: number;
  changes: Changer;
}