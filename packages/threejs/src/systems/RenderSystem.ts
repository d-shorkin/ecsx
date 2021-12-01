import {IEngine, IEntityCollection, IRunSystem} from "@ecsx/core";
import {CameraComponent, RendererComponent, SceneComponent} from "../components";

export class RenderSystem implements IRunSystem {
  private family: IEntityCollection;

  attach(engine: IEngine): void {
    this.family = engine.createFamily(RendererComponent, CameraComponent, SceneComponent)
  }

  run(delta: number): void {
    this.family.each((entity) => {
      const scene = entity.getComponent(SceneComponent).scene
      const camera = entity.getComponent(CameraComponent).camera
      entity.getComponent(RendererComponent).renderer.render(scene, camera)
    })
  }

}
