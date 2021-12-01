import {IEngine, ISystem} from "@ecsx/core";
import {Object3D} from "@ecsx/threejs";
import {IEntityCollection} from "../../../../packages/core";
import {ElementType, IElementsState} from "../logic/contract";
import {Element, ElementPosition, ElementPositionAnimation} from "../components";
import {ParentObject3D, Scene} from "../../../../packages/threejs";
import * as THREE from "three";

export class RenderSystem implements ISystem {
  private elements: IEntityCollection;
  private state: IElementsState;
  private scene: IEntityCollection;

  constructor(state: IElementsState) {
    this.state = state;
  }

  onAttach(engine: IEngine): void {
    this.elements = engine.createFamily(Element, ElementPosition);
    this.scene = engine.createFamily(Scene);
  }

  execute(engine: IEngine, delta: number): void {
    const d = delta * 1000;
    this.elements.getEntities().forEach((e) => {
      const type = e.getComponent(Element).type;
      if (!e.hasComponent(Object3D)) {
        if (this.scene.getEntities().length) {
          e.setComponent(ParentObject3D, {object3D: this.scene.getEntities()[0].getComponent(Scene).scene});
        }
        const object3D = new THREE.Mesh(
          new THREE.BoxGeometry(.8, .8, 0),
          new THREE.MeshBasicMaterial({color: this.getColor(type)})
        );
        e.setComponent(Object3D, {object3D});
      }
      const {width, height} = this.state.getSize();

      if (e.hasComponent(ElementPositionAnimation)) {
        const {animation} = e.getComponent(ElementPositionAnimation);
        const {x, y} = animation.update(d);
        e.getComponent(Object3D).object3D.position.x = x - width / 2;
        e.getComponent(Object3D).object3D.position.y = -y + height / 2;
        if (animation.isFinished()) {
          e.removeComponent(ElementPositionAnimation);
        }
      }

      if(!e.hasComponent(ElementPositionAnimation)){
        const {x, y} = e.getComponent(ElementPosition);
        e.getComponent(Object3D).object3D.position.x = x - width / 2;
        e.getComponent(Object3D).object3D.position.y = -y + height / 2;
      }

    });
  }

  private getColor(type: ElementType): number {
    switch (type) {
      case ElementType.Red:
        return 0xff0000;
      case ElementType.Green:
        return 0x45ba2b;
      case ElementType.Yellow:
        return 0xffff00;
      case ElementType.Purple:
        return 0xff00ff;
      case ElementType.Blue:
        return 0x0000ff;
      default:
        return 0xffffff;
    }
  }

}