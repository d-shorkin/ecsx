import {IEngine, IEntity, IEntityCollection, ISystem, Not} from "@ecsx/core";
import {Cannon, CannonBuild, CannonDestroy, CannonShot} from "../components";
import * as THREE from 'three';

export class CannonsShotSystem implements ISystem {
  private cannons: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.cannons = engine.createFamily(Cannon, CannonShot, Not(CannonBuild), Not(CannonDestroy));
  }

  execute(engine: IEngine, delta: number): void {
    this.cannons.getEntities().forEach((entity: IEntity) => {
      const progressTime = entity.getComponent(CannonShot).progressTime;
      const finishTime = entity.getComponent(CannonShot).finishTime;
      const isShotDone = progressTime + delta >= finishTime;
      const {mixer, actions} = entity.getComponent(Cannon).animation;
      if (isShotDone) {
        entity.removeComponent(CannonShot);
        mixer.stopAllAction();
        return;
      }
      if(!actions.shot.isRunning()){
        mixer.stopAllAction();
        actions.shot.setLoop(THREE.LoopOnce, 1).play();
      }
      actions.shot.time = progressTime / finishTime * actions.shot.getClip().duration;
      entity.setComponent(CannonShot, {progressTime: progressTime + delta, finishTime})
    });
  }
}