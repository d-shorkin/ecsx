import {IEngine, IEntity, IEntityCollection, ISystem, Not} from "@ecsx/core";
import {Cannon, CannonBuild, CannonDestroy} from "../components";
import * as THREE from 'three';

export class CannonsIdleSystem implements ISystem {
  private cannons: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.cannons = engine.createFamily(Cannon, Not(CannonBuild), Not(CannonDestroy));
  }

  execute(engine: IEngine, delta: number): void {
    this.cannons.getEntities().forEach((entity: IEntity) => {
      entity.getComponent(Cannon).animation.actions.idle.play()
    });
  }
}