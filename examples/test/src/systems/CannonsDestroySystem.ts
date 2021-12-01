import {Created, IEngine, IEntity, IEntityCollection, ISystem} from "@ecsx/core";
import {Cannon, CannonDestroy} from "../components";
import * as THREE from "three";

export class CannonsDestroySystem implements ISystem {
  private cannons: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.cannons = engine.createFamily(Cannon, CannonDestroy);
  }

  execute(engine: IEngine, delta: number): void {
    this.cannons.getEntities().forEach((entity: IEntity) => {
      const progressTime = entity.getComponent(CannonDestroy).progressTime;
      const finishTime = entity.getComponent(CannonDestroy).finishTime;
      const isDestroyComplete = progressTime + delta >= finishTime;
      const {mixer, actions} = entity.getComponent(Cannon).animation;
      if (isDestroyComplete) {
        engine.removeEntity(entity);
        mixer.stopAllAction();
        return;
      }
      if(!actions.destroy.isRunning()){
        mixer.stopAllAction();
        actions.destroy.setLoop(THREE.LoopOnce, 1).play();
      }
      actions.destroy.time = progressTime / finishTime * actions.build.getClip().duration;
      entity.setComponent(CannonDestroy, {progressTime: progressTime + delta, finishTime})
    });
  }
}