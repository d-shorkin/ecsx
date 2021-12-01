import {IEngine, IEntity, IEntityCollection, ISystem} from "@ecsx/core";
import {Object3D} from "@ecsx/threejs";
import {Body} from "@ecsx/matterjs";

export class Object3dMatterPhysicsSystem implements ISystem{
  private objects: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.objects = engine.createFamily(Object3D, Body)
  }

  execute(engine: IEngine, delta: number): void {
    this.objects.getEntities().forEach((entity: IEntity) => {
      const body = entity.getComponent(Body).body;
      const obj = entity.getComponent(Object3D).object3D;
      obj.position.z = body.position.y / 100;
      obj.position.x = body.position.x / 100;
      obj.rotation.y = -body.angle - Math.PI * .5;
    })
  }

}