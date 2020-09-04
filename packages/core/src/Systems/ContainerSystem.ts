import {IEngine, IEntity, IFamily, ISystem} from "../Contract/Core";
import {Container, Transform, WorldTransform} from "../Components";
import {Matrix4} from "three/src/math/Matrix4";
import {NullFamily} from "../Core/Helpers";
import {IRepository} from "../Contract/Repository";
import {TransformData} from "../Comparators/TransformComparator";

const baseMatrix: Matrix4 = new Matrix4();

export class ContainerSystem implements ISystem {
  private containers: IFamily = NullFamily;
  private withWorldTransform: IFamily = NullFamily;
  private repository: IRepository<TransformData>;

  constructor(repository: IRepository<TransformData>){
    this.repository = repository;

  }

  onAttach(engine: IEngine): void {
    this.containers = engine.createFamily(Container, Transform);
    this.withWorldTransform = engine.createFamily(WorldTransform);
  }

  execute(engine: IEngine, delta: number): void {
    this.withWorldTransform.getEntities().forEach(e => {
      const transform = e.getComponent(WorldTransform);
      const hasTransformChange = transform.hasUpdate(
        "positionX", "positionY", "positionZ",
        "rotationX", "rotationY", "rotationZ",
        "scaleX", "scaleY", "scaleZ"
      );
      if(hasTransformChange){
        this.calcTransformFromWorld(e);
      }
    });

    this.containers.getEntities().forEach(e => {
      const transform = e.getComponent(Transform);
      const hasTransformChange = transform.hasUpdate(
        "positionX", "positionY", "positionZ",
        "rotationX", "rotationY", "rotationZ",
        "scaleX", "scaleY", "scaleZ"
      );
      if (e.getComponent(Container).hasUpdate("children") || hasTransformChange) {
        this.recursiveChangeTransform(e)
      }
    });
  }

  private calcTransformFromWorld(entity: IEntity) {
    // change Transfrorm from world transform
  }

  private recursiveChangeTransform(parent: IEntity) {
    if (!parent.hasComponent(Container)) {
      return;
    }
    parent.getComponent(Container).children.forEach(child => {
      if (!child.hasComponent(WorldTransform)) {
        child.addComponent(WorldTransform);
      }

      if (!child.hasComponent(Transform)) {
        child.addComponent(Transform);
      }


    });
  }
}