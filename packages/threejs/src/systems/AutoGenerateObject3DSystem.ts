import {IEngine, IEntityCollection, IRunSystem} from "@ecsx/core";
import {MeshComponent, SceneComponent} from "../components";
import {setObject3d} from "../utils/setObject3d";

export class AutoGenerateObject3DSystem implements IRunSystem {
  private meshes: IEntityCollection;
  private scenes: IEntityCollection;

  attach(engine: IEngine): void {
    this.meshes = engine.createFamily(MeshComponent)
    this.scenes = engine.createFamily(SceneComponent);
  }

  run(delta: number): void {
    this.meshes.each((entity) => {
      setObject3d(entity, entity.getComponent(MeshComponent).mesh)
    })
    this.scenes.each((entity) => {
      setObject3d(entity, entity.getComponent(SceneComponent).scene)
    })
  }



}
