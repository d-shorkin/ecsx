export interface Clip<T> {
  calculate: Calculate<T>;
  duration: number;
}

export type Calculate<T> = (time: number, from: T, prev: T) => T

export class ClipPlayer<T> implements Clip<T> {
  private data: T;
  private played: boolean = true;
  calculate: Calculate<T>;
  duration: number;
  currentTime: number = 0;
  private from: T;

  constructor(clip: Clip<T>, from: T) {
    this.from = from;
    this.data = from;
    this.calculate = clip.calculate;
    this.duration = clip.duration;
  }

  getData(): T {
    return this.data;
  }

  reset() {
    this.currentTime = 0;
  }

  isPaused() {
    return !this.played;
  }

  isFinished() {
    return this.currentTime >= this.duration
  }

  setCurrentTime(currentTime: number) {
    this.currentTime = currentTime;
  }

  update(delta): T {
    if (this.played) {
      this.currentTime += delta;
      this.data = this.calculate(
        this.currentTime > this.duration ? this.duration : this.currentTime,
        this.from,
        this.data,
      );
    }
    return this.data;
  }
}

export function createClip<T>(fn: Calculate<T>, duration: number): Clip<T> {
  return {
    calculate: (delta: number, ...args) => (
      fn(delta > duration ? 1 : delta / duration, ...args)
    ),
    duration,
  }
}

export interface ChainMappedClip<T> {
  startTime: number;
  clip: Clip<T>;
  from: T;
}

export function clipsChain<T>(...clips: Clip<T>[]): Clip<T> {
  if (!clips.length) {
    wait(0);
  }

  let mappedChain: ChainMappedClip<T>[] | null = null;

  return {
    calculate: (time, from, prev) => {
      if (!mappedChain) {
        mappedChain = clips.reduce((acc, clip, index) => {
          if (!index) {
            acc.push({
              from,
              clip,
              startTime: 0
            })
          } else {
            const prev = acc[index - 1];
            acc.push({
              from: prev.clip.calculate(prev.clip.duration, from, from),
              clip,
              startTime: prev.startTime + prev.clip.duration
            })
          }
          return acc;
        }, [] as ChainMappedClip<T>[]).reverse();
      }

      const clip = mappedChain.find(({startTime}) => startTime <= time);

      if (!clip) {
        return prev
      }

      return clip.clip.calculate(time - clip.startTime, clip.from, prev);
    },
    duration: clips.reduce((acc, clip) => acc + clip.duration, 0)
  }
}

export function timeScale<T>(clip: Clip<T>, scale: number): Clip<T> {
  return {
    calculate: (time, ...args) => (
      clip.calculate(time / scale, ...args)
    ),
    duration: clip.duration * scale
  }
}

export function setDuration<T>(clip: Clip<T>, duration: number): Clip<T> {
  return timeScale(clip, duration / clip.duration)
}

export function easing<T>(clip: Clip<T>, easing: (x: number) => number): Clip<T> {
  return {
    calculate: (time, ...args) => (
      clip.calculate(easing(time / clip.duration) * clip.duration, ...args)
    ),
    duration: clip.duration
  };
}

export function reverse<T>(clip: Clip<T>): Clip<T> {
  return {
    calculate: (time, from, prev) => clip.calculate(clip.duration - (time > clip.duration ? clip.duration : time), from, prev),
    duration: clip.duration
  }
}

export function cut<T>(clip: Clip<T>, duration: number): Clip<T> {
  return {
    calculate: clip.calculate,
    duration: clip.duration < duration ? clip.duration : duration
  };
}

export function wait<T>(duration: number): Clip<T> {
  return {
    calculate: (_, _1, prev) => prev,
    duration: duration
  };
}

export function limit<T>(clip: Clip<T>, ms: number): Clip<T> {
  return {
    calculate: (time, ...args) => clip.calculate(Math.round(time / ms) * ms, ...args),
    duration: clip.duration
  };
}