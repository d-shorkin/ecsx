import {
  IEngine,
  IFamily,
  IRunSystem
} from "@ecsx/core";
import {CameraComponent, Object3DComponent, RendererComponent, SceneComponent} from "../components";


export class RenderSystem implements IRunSystem {
  private family: IFamily;
  private scenes: IFamily;
  private cameras: IFamily;

  attach(engine: IEngine): void {
    this.family = engine.createFamily(RendererComponent)
    this.scenes = engine.createFamily(SceneComponent)
    this.cameras = engine.createFamily(CameraComponent)
  }

  run(delta: number): void {
    this.family.each((entity) => {
      const renderer = entity.getComponent(RendererComponent)
      if (!renderer.scene.hasComponent(SceneComponent) || !renderer.camera.hasComponent(CameraComponent)) {
        return;
      }

      const scene = renderer.scene.getComponent(SceneComponent).scene
      if (scene) {
        const camera = renderer.camera.getComponent(CameraComponent).camera
        entity.getComponent(RendererComponent).renderer.render(scene, camera)
      }
    })
  }
}
