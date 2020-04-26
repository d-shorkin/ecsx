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