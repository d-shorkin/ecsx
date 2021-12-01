import {IEngine, IEntity, IEntityCollection, ISystem} from "@ecsx/core";
import {Pinput} from '../vendor/pinput'
import {MovementInputs, Player} from "../components";
import {Body} from "@ecsx/matterjs";

export class MovementInputSystem implements ISystem {
  private pinput: any;
  private player: IEntityCollection;

  constructor() {
    this.pinput = new Pinput();
  }

  onAttach(engine: IEngine): void {
    this.player = engine.createFamily(Player, Body);
  }

  execute(engine: IEngine, delta: number): void {
    this.pinput.update();
    this.player.getEntities().forEach((entity: IEntity) => {
      const movement = {
        acceleration: false,
        deceleration: false,
        rotateLeft: false,
        rotateRight: false
      };

      if (this.pinput.isDown('w') || this.pinput.isDown('arrowup')) {
        movement.acceleration = true;
      } else if (this.pinput.isDown('s') || this.pinput.isDown('arrowdown')) {
        movement.deceleration = true;
      }

      if (this.pinput.isDown('a') || this.pinput.isDown('arrowleft')) {
        movement.rotateLeft = true;
      } else if (this.pinput.isDown('d') || this.pinput.isDown('arrowright')) {
        movement.rotateRight = true;
      }

      if(!movement.acceleration && !movement.deceleration && !movement.rotateLeft && !movement.rotateRight){
        entity.removeComponent(MovementInputs);
      }

      entity.setComponent(MovementInputs, movement);
    });
  }
}