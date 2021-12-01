import * as THREE from 'three';
import {Object3D} from "three";

export interface ICannonHook {
  name: string;
  object3D: Object3D;
}

export interface IShipBody {
  getCannonHooks(): ICannonHook[];

  getObject(): THREE.Object3D;
}

export interface Cannon3dData {
  obj: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  actions: {
    idle: THREE.AnimationAction,
    build: THREE.AnimationAction,
    destroy: THREE.AnimationAction,
    shot: THREE.AnimationAction,
  }
}

export type CannonType = () => Cannon3dData;
