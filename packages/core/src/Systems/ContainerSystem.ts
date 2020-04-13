import {IEngine, IFamily, ISystem} from "../Core/Contract";
import {Container, Transform} from "../Components";
import {Matrix4} from "three/src/math/Matrix4";
import {castComponent} from "../Core/Helpers";

const baseMatrix: Matrix4 = new Matrix4();

export class ContainerSystem implements ISystem {
  private withChildren: IFamily;

  onAttach(engine: IEngine): void {
    this.withChildren = engine.createFamily([Container, Transform]);
    this.withChildren.getNews().forEach(e => e.on('removeComponent', this.onRemoveComponent))
  }

  execute(engine: IEngine, delta: number): void {
    this.withChildren.getNews().forEach(e => e.on('removeComponent', this.onRemoveComponent));
    this.withChildren.getRemoved().forEach(e => e.off('removeComponent', this.onRemoveComponent));

    this.withChildren.getEntities().forEach(e => {
      const transform = e.getComponent(Transform);
      if (
        e.getComponent(Container).hasUpdate("children") ||
        transform.hasUpdate("positionX") ||
        transform.hasUpdate("positionY") ||
        transform.hasUpdate("positionZ") ||
        transform.hasUpdate("rotationX") ||
        transform.hasUpdate("rotationY") ||
        transform.hasUpdate("rotationZ") ||
        transform.hasUpdate("scaleX") ||
        transform.hasUpdate("scaleY") ||
        transform.hasUpdate("scaleZ") ||
        transform._matrixHasUpdates()
      ) {
        e.getComponent(Container).get('children').forEach(child => {
          if (!child.hasComponent(Transform)) {
            child.addComponent(Transform);
          }

          child.getComponent(Transform)._setWorldMatrix(transform._getMatrix());
        });
      }
    });
  }

  private onRemoveComponent = ({component}) => {
    if (!castComponent(component, Container)) {
      return;
    }

    component.get('children').forEach((e) => {
      if (!e.hasComponent(Transform)) {
        return;
      }

      e.getComponent(Transform)._setWorldMatrix(baseMatrix);
    })
  }

}