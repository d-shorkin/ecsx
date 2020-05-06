export interface IVector2 {
  x: number;
  y: number;
}

export interface IVector3 extends IVector2 {
  z: number;
}

export interface IVector4 extends IVector2 {
  width: number;
  height: number;
}

export type Arguments<T> = [T] extends [(...args: infer U) => any] ? U : [T] extends [void] ? [] : [T]

export interface IEventEmitter<Events extends object> {
  on<E extends keyof Events>(event: E, listener: Events[E]): this;

  addListener<E extends keyof Events>(event: E, listener: Events[E]): this;

  emit<E extends keyof Events>(event: E, ...args: Arguments<Events[E]>): boolean;

  off<E extends keyof Events>(event: E, listener: Events[E]): this;

  removeAllListeners<E extends keyof Events>(event?: E): this;

  removeListener<E extends keyof Events>(event: E, listener: Events[E]): this;

  hasListener<E extends keyof Events>(event: E, listener: Events[E]): boolean;
}
