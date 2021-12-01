import {CreateElement, ElementProp, IElement, IElementsState, ISize} from "./contract";


export interface CreateChange {
  type: 'create',
  payload: IElement
}

export interface RemoveChange {
  type: 'remove',
  payload: number[]
}

export interface SwapChange {
  type: 'swap',
  payload: { id1: number, id2: number }
}

export interface MoveChange {
  type: 'move',
  payload: { id: number, x: number, y: number }
}

export interface UpdatePropsChange {
  type: 'update-props',
  payload: { id: number, props: ElementProp[] }
}

export type ChangeType = CreateChange | RemoveChange | SwapChange | MoveChange | UpdatePropsChange;

export class ElementsStateChanges implements IElementsState {
  private base: IElementsState;
  private changes: ChangeType[] = [];

  constructor(base: IElementsState) {
    this.base = base;
  }

  getById(id: number): IElement | null {
    return this.base.getById(id);
  }

  getAll(): IElement[] {
    return this.base.getAll();
  }

  getByCoordinates(x: number, y: number): IElement | null {
    return this.base.getByCoordinates(x, y);
  }

  getSize(): ISize {
    return this.base.getSize();
  }

  create(element: CreateElement): IElement {
    const e = this.base.create(element);
    this.changes.push({type: 'create', payload: e});
    return e;
  }

  move(id: number, x: number, y: number): this {
    this.base.move(id, x, y);
    this.changes.push({type: 'move', payload: {id, x, y}});
    return this;
  }

  removeMatch(ids: number[]): this {
    this.base.removeMatch(ids);
    this.changes.push({type: 'remove', payload: ids});
    return this;
  }

  swap(id1: number, id2: number): this {
    this.base.swap(id1, id2);
    this.changes.push({type: 'swap', payload: {id2, id1}});
    return this;
  }

  updateProps(id: number, props: ElementProp[]): this {
    this.base.updateProps(id, props);
    this.changes.push({type: 'update-props', payload: {id, props}});
    return this;
  }

  getChanges(): ChangeType[] {
    return this.changes;
  }

  clearChanges() {
    this.changes = [];
  }

}