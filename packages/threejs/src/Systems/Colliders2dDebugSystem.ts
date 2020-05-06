import {Collider2d, IEngine, IFamily, IRepository, ISystem, Not, Transform} from "@ecsx/core";
import {Collider2dMesh} from "../Comparators/Collider2dComparator";

export class Colliders2dDebugSystem implements ISystem {
  private entities: IFamily;
  private repository: IRepository<Collider2dMesh>;
  private readonly z: number;

  constructor(repository: IRepository<Collider2dMesh>, z: number = 0) {
    this.repository = repository;
    this.z = z;
  }

  onAttach(engine: IEngine): void {
    this.entities = engine.createFamily(Collider2d);
  }

  execute(engine: IEngine, delta: number): void {
    this.entities.getEntities().forEach(e => {

      if (!this.repository.hasBy(e)) {
        return;
      }

      const group = this.repository.getBy(e).group;


      group.position.z = this.z;

      if (!e.hasComponent(Transform)) {
        return;
      }

      const transform = e.getComponent(Transform);
      group.position.x = transform.getWorld("positionX");
      group.position.y = transform.getWorld("positionY");
      group.rotation.z = transform.getWorld("rotationZ");
      group.scale.x = transform.getWorld("scaleX");
      group.scale.y = transform.getWorld("scaleY");
    });
  }

}