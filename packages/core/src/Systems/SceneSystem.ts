import {IEngine, IEntity, IFamily, ISystem} from "../Contract/Core";
import {Container, RootScene, Scene} from "../Components";
import {Not, NullFamily} from "../Core/Helpers";

export class SceneSystem implements ISystem {
  private scenes: IFamily = NullFamily;
  private containers: IFamily = NullFamily;

  onAttach(engine: IEngine): void {
    this.scenes = engine.createFamily(Scene, Not(RootScene));
    this.containers = engine.createFamily(Container, RootScene);
  }

  execute(engine: IEngine, delta: number): void {
    this.containers.getEntities().forEach(e => {
      if (e.getComponent(Container).hasUpdate('children') && e.getComponent(RootScene).scene) {
        this.setRootRecursive(e.getComponent(Container).children, e.getComponent(RootScene).scene!);
      }
    });

    this.scenes.getEntities().forEach(e => {
      if (!e.hasComponent(RootScene)) {
        e.addComponent(RootScene).set('scene', e);
      }

      if (e.hasComponent(Container)) {
        this.setRootRecursive(e.getComponent(Container).children, e);
      }
    });
  }

  private setRootRecursive(children: IEntity[], scene: IEntity) {
    children.forEach(child => {
      if (!child.hasComponent(RootScene)) {
        child.addComponent(RootScene);
      }

      child.getComponent(RootScene).set('scene', scene);

      if (child.hasComponent(Container)) {
        this.setRootRecursive(child.getComponent(Container).children, scene);
      }
    })
  }
}