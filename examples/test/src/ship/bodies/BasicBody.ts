import {ICannonHook, IShipBody} from "../contract";
import * as THREE from "three";

export class BasicBody implements IShipBody {
  private body: THREE.Mesh;
  private cannons: ICannonHook[] = [];

  constructor() {
    const geometry = new THREE.BoxGeometry(.5, .3, 1);
    const material = new THREE.MeshStandardMaterial({color: 0x00ff00});
    this.body = new THREE.Mesh(geometry, material);

    for (let i = 0; i < 2; i++) {
      const geometry = new THREE.BoxGeometry(.05, .05, .05);
      const material = new THREE.MeshBasicMaterial({color: 0x0000ff});
      const cannon = new THREE.Mesh(geometry, material);
      const x = .15;
      cannon.position.x = x + (i % 2 * (-x * 2));
      cannon.position.y = .15;
      cannon.position.z = .3;
      this.body.add(cannon);
      this.cannons.push({name: `cannon-${i}`, object3D: cannon});
    }
  }

  getCannonHooks(): ICannonHook[] {
    return this.cannons;
  }

  getObject(): THREE.Object3D {
    return this.body;
  }

}