import {IComponent, IEntity} from "@ecsx/core";
import {IShipBody} from "./ship/contract";
import * as THREE from 'three';

export class Ship implements IComponent {
  body: IShipBody;
}

export class ActiveCannons implements IComponent {
  activeCannonsHooks: string[];
}

export class CannonsList implements IComponent {
  cannons: { [p: string]: IEntity };
}

export class Cannon implements IComponent {
  ship: IEntity;
  hook: string;
  animation: {
    mixer: THREE.AnimationMixer;
    actions: {
      idle: THREE.AnimationAction;
      build: THREE.AnimationAction;
      destroy: THREE.AnimationAction;
      shot: THREE.AnimationAction;
    }
  }
}

export class CannonBuild {
  progressTime: number;
  finishTime: number;
}

export class CannonDestroy {
  progressTime: number;
  finishTime: number;
}

export class CannonShot {
  progressTime: number;
  finishTime: number;
}

export class Player implements IComponent {
}

export class PlayerCamera implements IComponent {
  zoom: number;
  lerp: number;
}

export class MovementInputs {
  acceleration: boolean;
  deceleration: boolean;
  rotateLeft: boolean;
  rotateRight: boolean;
}

export class MovementMaxSpeed {
  maxSpeed: number;
}

export class MovementAcceleration {
  acceleration: number;
}

export class MovementMaxAngularSpeed {
  maxAngularSpeed: number;
}

export class MovementAngularAcceleration {
  angularAcceleration: number;
}