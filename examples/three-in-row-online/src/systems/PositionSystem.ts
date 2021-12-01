import {IEngine, IEntityCollection, ISystem} from "@ecsx/core";
import {Element, ElementPosition} from "../components";
import {Object3D} from "@ecsx/threejs";
import {IElementsState} from "../logic/contract";

export class PositionSystem implements ISystem {
  private elements: IEntityCollection;
  private state: IElementsState;

  constructor(state: IElementsState) {
    this.state = state;
  }

  onAttach(engine: IEngine): void {
    this.elements = engine.createFamily(Element, Object3D, ElementPosition);
  }

  execute(engine: IEngine, delta: number): void {
    this.elements.getEntities().forEach((e) => {
      const {width, height} = this.state.getSize();
      const {x, y} = e.getComponent(ElementPosition);
      e.getComponent(Object3D).object3D.position.x = x - width / 2;
      e.getComponent(Object3D).object3D.position.y = - y + height / 2;
    });
  }
}