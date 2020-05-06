import {IEngine, IEntity, IFamily, ISystem} from "../Contract/Core";
import {Container} from "../Components";
import {NullFamily} from "../..";

export class AutoEngineAddSystem implements ISystem {
  private entities: IFamily = NullFamily;

  onAttach(engine: IEngine): void {
    this.entities = engine.createFamily(Container);
  }

  execute(engine: IEngine, delta: number): void {
    this.entities.getEntities().forEach(entity => {
      if (entity.getComponent(Container).hasUpdate("children")) {
        this.recursiveAddToEngine(entity.getComponent(Container).children, engine);
      }
    });
  }

  private recursiveAddToEngine(children: IEntity[], engine: IEngine) {
    children.forEach(child => {
      if (!child.getId()) {
        engine.addEntity(child);
      }

      if (child.hasComponent(Container)) {
        this.recursiveAddToEngine(child.getComponent(Container).children, engine);
      }
    })
  }

}