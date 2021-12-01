import {IEngine, IEntity, IEntityCollection, ISystem} from "@ecsx/core";
import {Object3D, Scene} from "@ecsx/threejs";
import {ActiveCannons, Ship} from "../components";
import {Created, EntityCompositeCollection, Removed, Updated} from "../../../../packages/core";

export class ShipRendererSystem implements ISystem {
  private ships: IEntityCollection;
  private scenes: IEntityCollection;
  private updatedActiveCannonsShips: EntityCompositeCollection;

  onAttach(engine: IEngine): void {
    this.ships = engine.createFamily(Ship);
    this.scenes = engine.createFamily(Scene);

    this.updatedActiveCannonsShips = new EntityCompositeCollection(
      engine.createFamily(Updated(Ship)),
      engine.createFamily(Created(ActiveCannons)),
      engine.createFamily(Updated(ActiveCannons)),
      engine.createFamily(Removed(ActiveCannons)),
    );
  }

  execute(engine: IEngine, delta: number): void {
    this.ships.getEntities().forEach((ship: IEntity) => {
      const renderer = ship.getComponent(Ship).body;
      if (!ship.hasComponent(Object3D) || renderer.getObject() !== ship.getComponent(Object3D).object3D) {
        ship.setComponent(Object3D, {object3D: renderer.getObject()})
      }
    });

    this.updatedActiveCannonsShips.getEntities().forEach(entity => {
      if (!entity.hasComponent(Ship)) {
        return;
      }
      if (!entity.hasComponent(ActiveCannons)) {
        entity.getComponent(Ship).body.getCannonHooks().forEach(({object3D: hook}) => hook.visible = false);
        return;
      }
      const active = entity.getComponent(ActiveCannons).activeCannonsHooks;
      entity.getComponent(Ship).body.getCannonHooks().forEach(({object3D: hook, name}) => {
        hook.visible = active.includes(name);
      });
    });
  }
}