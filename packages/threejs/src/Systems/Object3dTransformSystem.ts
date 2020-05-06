import {
  Camera,
  CompositeFamily,
  IEngine,
  IFamily,
  IRepository,
  ISystem,
  NullFamily,
  Scene,
  Transform
} from "@ecsx/core";
import {Object3D} from "three";
import {Mesh} from "../Components";

export class Object3dTransformSystem implements ISystem {
  private repository: IRepository<Object3D>;
  private objects: IFamily = NullFamily;

  constructor(repository: IRepository<Object3D>) {
    this.repository = repository;
  }

  onAttach(engine: IEngine): void {
    this.objects = new CompositeFamily(
      engine.createFamily(Camera),
      engine.createFamily(Scene),
      engine.createFamily(Mesh)
    );
  }

  execute(engine: IEngine, delta: number): void {
    this.objects.getEntities().forEach(e => {
      if (!e.hasComponent(Transform) || !this.repository.hasBy(e)) {
        return;
      }

      const o = this.repository.getBy(e);
      const transform = e.getComponent(Transform);
      o.position.x = transform.getWorld("positionX");
      o.position.y = transform.getWorld("positionY");
      o.position.z = transform.getWorld("positionZ");
      o.rotation.x = transform.getWorld("rotationX");
      o.rotation.y = transform.getWorld("rotationY");
      o.rotation.z = transform.getWorld("rotationZ");
      o.scale.x = transform.getWorld("scaleX");
      o.scale.y = transform.getWorld("scaleY");
      o.scale.z = transform.getWorld("scaleZ");
    });
  }
}
