import {IEngine, IFamily, IRunSystem} from "@ecsx/core";
import {CameraComponent, MeshComponent, SceneComponent} from "../components";
import {setObject3d} from "../utils/setObject3d";

export class AutoGenerateObject3DSystem implements IRunSystem {
  private meshes: IFamily;
  private scenes: IFamily;
  private cameras: IFamily;

  attach(engine: IEngine): void {
    this.meshes = engine.createFamily(MeshComponent)
    this.scenes = engine.createFamily(SceneComponent)
    this.cameras = engine.createFamily(CameraComponent)
  }

  run(delta: number): void {
    this.meshes.each((entity) => {
      setObject3d(entity, entity.getComponent(MeshComponent).mesh)
    })
    this.scenes.each((entity) => {
      setObject3d(entity, entity.getComponent(SceneComponent).scene)
    })
    this.cameras.each((entity) => {
      setObject3d(entity, entity.getComponent(CameraComponent).camera)
    })
  }



}
