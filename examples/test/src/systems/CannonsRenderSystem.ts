import {
  IEngine,
  IEntityCollection,
  ISystem,
  IEntity, composeCollections, Created, Updated
} from "@ecsx/core";
import {Cannon, Ship} from "../components";
import {ParentObject3D} from "@ecsx/threejs";

export class CannonsRenderSystem implements ISystem {
  private changedCannons: IEntityCollection;
  private cannons: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.changedCannons = composeCollections(
      engine.createFamily(Created(Cannon)),
      engine.createFamily(Updated(Cannon))
    );

    this.cannons = engine.createFamily(Cannon);
  }

  execute(engine: IEngine, delta: number): void {
    this.changedCannons.getEntities().forEach((entity: IEntity) => {
      const prevShip = entity.hasPrevComponent(Cannon) ? entity.getPrevComponent(Cannon).ship : null;
      const prevHook = entity.hasPrevComponent(Cannon) ? entity.getPrevComponent(Cannon).hook : null;
      if (prevShip === entity.getComponent(Cannon).ship && prevHook === entity.getComponent(Cannon).hook) {
        return;
      }

      const currentHook = entity.getComponent(Cannon).hook;

      if (!entity.getComponent(Cannon).ship.hasComponent(Ship)) {
        entity.removeComponent(ParentObject3D);
        return;
      }

      const ship = entity.getComponent(Cannon).ship.getComponent(Ship).body;
      const newHook = ship.getCannonHooks().find(({name}) => name === currentHook);
      if (!newHook) {
        entity.removeComponent(ParentObject3D);
        return;
      }

      if (entity.hasComponent(ParentObject3D) && entity.getComponent(ParentObject3D).object3D === newHook.object3D) {
        return;
      }

      entity.setComponent(ParentObject3D, {object3D: newHook.object3D});
    });

    this.cannons.getEntities().forEach((entity: IEntity) => {
      entity.getComponent(Cannon).animation.mixer.update(delta);
    })
  }

}