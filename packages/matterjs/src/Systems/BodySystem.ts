import {composeCollections, Created, IEngine, IEntityCollection, ISystem, Removed, Updated} from "@ecsx/core";
import {Body, Engine} from "../components";
import * as Matter from "matter-js";
import {World} from "matter-js";

export class BodySystem implements ISystem {
  private removed: IEntityCollection;
  private updated: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.updated = composeCollections(
      engine.createFamily(Created(Body)),
      engine.createFamily(Updated(Body))
    );
    this.removed = engine.createFamily(Removed(Body));
  }

  execute(engine: IEngine, delta: number): void {
    this.updated.getEntities().forEach(e => {
      const prevBody: Body = e.hasPrevComponent(Body) ? e.getPrevComponent(Body) : e.getComponent(Body);
      const currentBody = e.getComponent(Body);

      if (prevBody.engine && prevBody.engine.hasComponent(Engine)) {
        Matter.Composite.remove(prevBody.engine.getComponent(Engine).engine.world, prevBody.body);
      }

      if (currentBody.engine && currentBody.engine.hasComponent(Engine)) {
        World.add(currentBody.engine.getComponent(Engine).engine.world, currentBody.body);
      }
    });
    this.removed.getEntities().forEach(e => {
      const {body, engine} = e.getPrevComponent(Body);
      if (!engine || !engine.hasComponent(Engine)) {
        return;
      }
      Matter.Composite.remove(engine.getComponent(Engine).engine.world, body);
    });
  }

}