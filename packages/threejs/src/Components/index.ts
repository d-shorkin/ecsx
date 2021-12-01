import * as THREE from "three";
import {IComponent, IEntity} from "@ecsx/core";

export class Renderer implements IComponent {
  static tag = 'ThreeJs/Renderer';

  renderer: THREE.Renderer;
}

export class Scene implements IComponent {
  static tag = 'ThreeJs/Scene';

  scene: THREE.Scene;
}

export class Camera implements IComponent {
  static tag = 'ThreeJs/Camera';

  camera: THREE.Camera;
}

export class Object3D implements IComponent {
  static tag = 'ThreeJs/Object3D';

  object3D: THREE.Object3D;
}

export class ParentObject3D implements IComponent {
  static tag = 'ThreeJs/ParentObject3D';

  object3D: THREE.Object3D;
}

export class Raycast implements IComponent {
  static tag = 'ThreeJs/Raycast';

  entities: IEntity[];
}