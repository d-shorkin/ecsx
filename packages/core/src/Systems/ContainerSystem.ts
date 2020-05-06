import {IEngine, IEntity, IFamily, ISystem} from "../Contract/Core";
import {Container, Transform} from "../Components";
import {Matrix4} from "three/src/math/Matrix4";
import {castComponent, NullFamily} from "../Core/Helpers";

const baseMatrix: Matrix4 = new Matrix4();

export class ContainerSystem implements ISystem {
  private withChildren: IFamily = NullFamily;

  onAttach(engine: IEngine): void {
    this.withChildren = engine.createFamily(Container, Transform);
    this.withChildren.getNews().forEach(e => e.on('removeComponent', this.onRemoveComponent))
  }

  execute(engine: IEngine, delta: number): void {
    this.withChildren.getNews().forEach(e => e.on('removeComponent', this.onRemoveComponent));
    this.withChildren.getRemoved().forEach(e => e.off('removeComponent', this.onRemoveComponent));

    this.withChildren.getEntities().forEach(e => {
      const transform = e.getComponent(Transform);
      if (e.getComponent(Container).hasUpdate("children") || transform._hasLocalUpdate()) {
        this.recursiveChangeTransform(e, transform)
      }
    });
  }

  private recursiveChangeTransform(e: IEntity, transform: Transform | Readonly<Transform>) {
    e.getComponent(Container).children.forEach(child => {
      if (!child.hasComponent(Transform)) {
        child.addComponent(Transform);
      }

      child.getComponent(Transform)._setWorldMatrix(transform._getMatrix());

      if (child.hasComponent(Container)) {
        this.recursiveChangeTransform(child, child.getComponent(Transform))
      }
    });
  }

  private onRemoveComponent = ({component}) => {
    if (!castComponent(component, Container)) {
      return;
    }

    component.children.forEach((e) => {
      if (e.hasComponent(Transform)) {
        e.getComponent(Transform)._setWorldMatrix(baseMatrix);
      }
    })
  }
}