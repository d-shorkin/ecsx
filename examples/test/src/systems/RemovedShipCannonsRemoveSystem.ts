import {IEngine, IEntity, IEntityCollection, ISystem, Removed} from "@ecsx/core";
import {Cannon, Ship} from "../components";

export class RemovedShipCannonsRemoveSystem implements ISystem{
  private removedShips: IEntityCollection;
  private cannons: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.removedShips = engine.createFamily(Removed(Ship));
    this.cannons = engine.createFamily(Cannon);
  }

  execute(engine: IEngine, delta: number): void {
    this.removedShips.getEntities().forEach((entity: IEntity) => {
      this.cannons
        .getEntities()
        .filter((cannon) => {
          return cannon.getComponent(Cannon).ship === entity;
        })
        .forEach(engine.removeEntity);
    });
  }

}