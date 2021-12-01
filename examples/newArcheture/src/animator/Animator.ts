import {IVector} from "../logic/contract";
import {easeOutBounce} from "./easingFunctions";
import {Clip, createClip, clipsChain, easing, wait, limit} from "../animations/animations";

function distance(v1: IVector, v2: IVector) {
  const a = v1.x - v2.x;
  const b = v1.y - v2.y;
  return Math.sqrt(a * a + b * b);
}

export const lerp = (to: number) => (from: number, v: number) => (
  (to - from) * v + from
);

export const lerpVector = (to: IVector) => {
  const getX = lerp(to.x);
  const getY = lerp(to.y);
  return (v: number, from: IVector) => {
    return ({
      x: getX(from.x, v),
      y: getY(from.y, v),
    });
  }
};

export class Animator {
  static createMovingAnimation(positions: IVector[]): Clip<IVector> {
    if (!positions.length) {
      return wait(0);
    }

    if (positions.length < 2) {
      return easing(createClip(lerpVector(positions[positions.length - 1]), 300), easeOutBounce);
    }

    const moving: Clip<IVector>[] = [];
    for (let i = 0; i < positions.length; i++) {
      moving.push(
        createClip(lerpVector(positions[i]), 300)
      );
    }

    return easing(clipsChain(...moving), easeOutBounce);
  }
}