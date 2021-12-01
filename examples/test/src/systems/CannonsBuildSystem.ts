import {IEngine, IEntity, IEntityCollection, ISystem, Not} from "@ecsx/core";
import {Cannon, CannonBuild, CannonDestroy} from "../components";
import * as THREE from 'three';

export class CannonsBuildSystem implements ISystem {
  private cannons: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.cannons = engine.createFamily(Cannon, CannonBuild, Not(CannonDestroy));
  }

  execute(engine: IEngine, delta: number): void {
    this.cannons.getEntities().forEach((entity: IEntity) => {
      const progressTime = entity.getComponent(CannonBuild).progressTime;
      const finishTime = entity.getComponent(CannonBuild).finishTime;
      const isBuildDone = progressTime + delta >= finishTime;
      const {mixer, actions} = entity.getComponent(Cannon).animation;
      if (isBuildDone) {
        entity.removeComponent(CannonBuild);
        mixer.stopAllAction();
        return;
      }
      if(!actions.build.isRunning()){
        mixer.stopAllAction();
        actions.build.setLoop(THREE.LoopOnce, 1).play();
      }
      actions.build.time = progressTime / finishTime * actions.build.getClip().duration;
      entity.setComponent(CannonBuild, {progressTime: progressTime + delta, finishTime})
    });
  }
}