import {IEngine, IFamily, ISystem} from "../Core/Contract";
import {Container, RootScene, Scene} from "../Components";
import {Not} from "../Core/Helpers";

export class SceneSystem implements ISystem {
  private scenes: IFamily;
  private containers: IFamily;

  onAttach(engine: IEngine): void {
    this.scenes = engine.createFamily(Scene, Not(RootScene));
    this.containers = engine.createFamily(Container, RootScene);
  }

  execute(engine: IEngine, delta: number): void {
    this.scenes.getEntities().forEach(e => {
      if (!e.hasComponent(RootScene)) {
        e.addComponent(RootScene).set('scene', e.getComponent(Scene));
      }
    });

    this.containers.getEntities().forEach(e => {
      e.getComponent(Container).children.forEach(child => {
        const root = e.getComponent(RootScene).scene;
        if(!root){
          return;
        }
        if (!child.hasComponent(RootScene)) {
          child.addComponent(RootScene).set('scene', root);
          return;
        }

        if (child.getComponent(RootScene).scene !== root) {
          child.getComponent(RootScene).set('scene', root);
        }
      })
    })
  }
}