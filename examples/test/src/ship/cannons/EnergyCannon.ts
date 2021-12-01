import * as THREE from "three";
import {Cannon3dData} from "../contract";
import {createBaseCannonAnimations} from "./createBaseCannonAnimations";

export function EnergyCannon(): Cannon3dData {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(.1, .03, .1),
    new THREE.MeshStandardMaterial({color: 0xff0000})
  );
  const barrel = new THREE.Mesh(
    new THREE.BoxGeometry(.07, .01, .1),
    new THREE.MeshStandardMaterial({color: 0xff0000})
  );

  body.add(barrel);
  barrel.position.z = -.1;
  body.position.y = .04;

  const root = new THREE.Object3D();
  root.add(body);
  return {...createBaseCannonAnimations(body), obj: root};
}