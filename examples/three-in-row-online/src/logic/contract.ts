export enum ElementType {
  None = 'none',
  Red = 'red',
  Green = 'green',
  Blue = 'blue',
  Yellow = 'yellow',
  Purple = 'purple'
}

export enum ElementProp {
}

export interface IElement {
  id: number;
  x: number;
  y: number;
  type: ElementType;
  props: ElementProp[];
}

export interface ISize {
  width: number;
  height: number;
}

export interface IVector {
  x: number,
  y: number,
}

export type CreateElement = Omit<IElement, 'id'>;

export interface IElementsState {
  getSize(): ISize;

  getById(id: number): IElement | null;

  getAll(): IElement[];

  getByCoordinates(x: number, y: number): IElement | null;

  removeMatch(ids: number[]): this;

  move(id: number, x: number, y: number): this;

  swap(id1: number, id2: number): this;

  create(element: CreateElement): IElement;

  updateProps(id: number, props: ElementProp[]): this;
}

export interface IHandler {
  setNext(handler: IHandler): IHandler;

  handle(state: IElementsState): IElementsState;
}