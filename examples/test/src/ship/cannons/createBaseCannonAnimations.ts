import {Cannon3dData} from "../contract";
import * as THREE from "three";

export function createBaseCannonAnimations(obj: THREE.Object3D, baseHeight: number = .1): Cannon3dData {
  const mixer = new THREE.AnimationMixer(obj);

  const finishPos = obj.position.clone();

  const idleClip = new THREE.AnimationClip('cannon-idle', undefined, [
    new THREE.VectorKeyframeTrack('.position', [0, 1.3, 3], [
      ...finishPos.toArray(),
      finishPos.x, finishPos.y - 0.01, finishPos.z,
      ...finishPos.toArray()]),
  ]);

  const xAxis = new THREE.Vector3(1, 0, 0);
  const qI = new THREE.Quaternion().setFromAxisAngle(xAxis, 0);
  const qF = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI * -0.25);
  const qShot = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.PI * 0.1);

  const buildClip = new THREE.AnimationClip('cannon-build', undefined, [
    new THREE.VectorKeyframeTrack('.position', [0, 30, 30.17, 30.24], [
      finishPos.x, -baseHeight, finishPos.z + .02,
      finishPos.x, finishPos.y, finishPos.z + .02,
      finishPos.x, finishPos.y, finishPos.z - .005,
      ...finishPos.toArray()]),
    new THREE.QuaternionKeyframeTrack('.quaternion', [0, 30], qF.toArray().concat(qI.toArray())),
  ]);

  const destroyClip = new THREE.AnimationClip('cannon-destroy', undefined, [
    new THREE.VectorKeyframeTrack('.position', [0, 1], [
      ...finishPos.toArray(),
      finishPos.x, -baseHeight, finishPos.z]),
    new THREE.QuaternionKeyframeTrack('.quaternion', [0, .7], qI.toArray().concat(qF.toArray())),
  ]);

  const shotClip = new THREE.AnimationClip('cannon-shot', undefined, [
    new THREE.VectorKeyframeTrack('.position', [0, .01, .05], [
      ...finishPos.toArray(),
      finishPos.x, finishPos.y, finishPos.z + .1,
      ...finishPos.toArray()]),
    new THREE.QuaternionKeyframeTrack('.quaternion', [0, .01, .03], qI.toArray().concat(qShot.toArray()).concat(qI.toArray())),
  ]);

  const idle = mixer.clipAction(idleClip);
  const build = mixer.clipAction(buildClip);
  const destroy = mixer.clipAction(destroyClip);
  const shot = mixer.clipAction(shotClip);

  return {
    obj,
    mixer,
    actions: {
      idle,
      build,
      destroy,
      shot,
    }
  };
}