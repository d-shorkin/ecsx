import {
  Camera,
  castComponent, CompositeFamily,
  EntityUpdateEvent,
  IEngine,
  IEntity,
  IFamily,
  ISystem, Not,
  Renderer as CoreRenderer, Scene, Transform
} from "@ecsx/core";
import {WebGLRendererParameters, Vector2} from "three";
import {ThreeRenderer} from "../Components/ThreeRenderer";
import {ThreeScene} from "../Components/ThreeScene";
import {ThreeCamera} from "../Components/ThreeCamera";

const tmpVector2 = new Vector2();

export class RendererSystem implements ISystem {
  private options: WebGLRendererParameters;

  private renderers: IFamily;
  private cameras: IFamily;
  private newObjects: IFamily;

  constructor(options?: WebGLRendererParameters) {
    this.options = {
      antialias: true,
      ...options
    }
  }

  onAttach(engine: IEngine): void {
    this.newObjects = new CompositeFamily(
      engine.createFamily(CoreRenderer, Not(ThreeRenderer)),
      engine.createFamily(Scene, Not(ThreeScene)),
      engine.createFamily(Camera, Not(ThreeCamera))
    );

    this.renderers = engine.createFamily(CoreRenderer, ThreeRenderer);
    this.cameras = engine.createFamily(Camera, ThreeCamera);
  }

  execute(engine: IEngine, delta: number): void {
    this.newObjects.getEntities().forEach(e => {
      if(e.hasComponent(CoreRenderer)){
        e.addComponent(ThreeRenderer);
      }

      if(e.hasComponent(Scene)){
        e.addComponent(ThreeScene);
      }

      if(e.hasComponent(Camera)){
        e.addComponent(ThreeCamera);
      }
    });
    this.cameras.getEntities().forEach(e => {
      const cam = e.getComponent(ThreeCamera).getCamera();
      if (cam && e.hasComponent(Transform)) {
        cam.position.x = e.getComponent(Transform).positionX;
        cam.position.y = e.getComponent(Transform).positionY;
        cam.position.z = e.getComponent(Transform).positionZ;
        cam.rotation.x = e.getComponent(Transform).rotationX;
        cam.rotation.y = e.getComponent(Transform).rotationY;
        cam.rotation.z = e.getComponent(Transform).rotationZ;
        cam.scale.x = e.getComponent(Transform).scaleX;
        cam.scale.y = e.getComponent(Transform).scaleY;
        cam.scale.z = e.getComponent(Transform).scaleZ;
      }
    });
    this.renderers.getEntities().forEach((entity: IEntity) => {
      const renderer = entity.getComponent(ThreeRenderer).getRenderer();
      if (!renderer) {
        return;
      }
      entity.getComponent(CoreRenderer).items.forEach(({camera, scene}) => {
        if (!scene.getEntity().hasComponent(ThreeScene) || !camera.getEntity().hasComponent(ThreeCamera)) {
          return;
        }

        const threeScene = scene.getEntity().getComponent(ThreeScene).getScene();
        const threeCamera = camera.getEntity().getComponent(ThreeCamera).getCamera();

        if(threeScene && threeCamera){
          renderer.render(threeScene, threeCamera);
        }
      });
    });
  }
}

