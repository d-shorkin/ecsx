import {IEngine, IFamily, ISystem, NullFamily, Transform} from "@ecsx/core";
import {ContainerTag, GameObject} from "./Tags";

export class TestSystem implements ISystem{
  private objects: IFamily = NullFamily;
  private container: IFamily = NullFamily;

  onAttach(engine: IEngine): void {
    this.objects = engine.createFamily(GameObject);
    this.container = engine.createFamily(ContainerTag)
  }

  execute(engine: IEngine, delta: number): void {
    this.container.getEntities().forEach(e => {
      if(!e.hasComponent(Transform)){
        e.addComponent(Transform);
      }
      const t = e.getComponent(Transform);
      t.setWorld("positionX", t.getWorld('positionX') + .1)
    });

    this.objects.getEntities().forEach(e => {
      if(!e.hasComponent(Transform)){
        e.addComponent(Transform);
      }
      const t = e.getComponent(Transform);

      t.setWorld("positionX", 0)
    });
  }

}