import {IEngine, IFamily, ISystem, RootScene, Transform} from "@ecsx/core";
import {Mesh as MeshComponent} from "../Components/Mesh";

export class MeshSystem implements ISystem {
  private meshes: IFamily;

  onAttach(engine: IEngine): void {
    this.meshes = engine.createFamily(MeshComponent, RootScene);
  }

  execute(engine: IEngine, delta: number): void {
    this.meshes.getEntities().forEach(e => {
      const mesh = e.getComponent(MeshComponent).getMesh();
      if(e.hasComponent(Transform)){
        const transform = e.getComponent(Transform);
        mesh.position.x = transform.getWorld("positionX");
        mesh.position.y = transform.getWorld("positionY");
        mesh.position.z = transform.getWorld("positionZ");
        mesh.rotation.x = transform.getWorld("rotationX");
        mesh.rotation.y = transform.getWorld("rotationY");
        mesh.rotation.z = transform.getWorld("rotationZ");
        mesh.scale.x = transform.getWorld("scaleX");
        mesh.scale.y = transform.getWorld("scaleY");
        mesh.scale.z = transform.getWorld("scaleZ");
      }
    })
  }
}