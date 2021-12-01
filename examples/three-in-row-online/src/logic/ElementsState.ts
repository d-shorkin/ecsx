import {ElementProp, IElement, IElementsState, ISize} from "./contract";

export class ElementsState implements IElementsState {
  private nextId: number = 1;
  private elements: IElement[] = [];
  private needsToUpdateLinks = true;
  private cordsLinks: { [p: string]: IElement } = {};
  private size: ISize;

  constructor(width: number, height: number) {
    this.size = {width, height};
  }

  getById(id: number): IElement | null {
    return this.elements.find(e => e.id === id) || null;
  }

  getAll(): IElement[] {
    return this.elements;
  }

  getByCoordinates(x: number, y: number): IElement | null {
    this.rebuildLinks();
    return this.cordsLinks[x + '-' + y] || null;
  }

  create(element: Omit<IElement, 'id'>): IElement {
    if (element.x < 0 || element.x >= this.size.width || element.y < 0 || element.y >= this.size.height) {
      throw new Error(`Wrong coordinates x:${element.x} y:${element.y}`);
    }

    if (this.getByCoordinates(element.x, element.y)) {
      throw new Error(`Coordinates ${element.x} ${element.y} already exists`);
    }

    const e = {...element, id: this.nextId++};
    this.elements.push(e);
    this.needsToUpdateLinks = true;

    return e;
  }

  getSize(): ISize {
    return this.size;
  }

  move(id: number, x: number, y: number): this {
    if (x < 0 || x >= this.size.width || y < 0 || y >= this.size.height) {
      throw new Error(`Wrong coordinates x:${x} y:${y}`);
    }

    let updated = false;
    this.elements = this.elements.map((e) => {
      if (e.id === id) {
        updated = true;
        return {...e, x, y}
      }
      return e;
    });

    if (!updated) {
      throw new Error(`Id ${id} not found for move`)
    }

    this.needsToUpdateLinks = true;
    return this;
  }

  updateProps(id: number, props: ElementProp[]): this {
    let updated = false;
    this.elements = this.elements.map((e) => {
      if (e.id === id) {
        updated = true;
        return {...e, props}
      }
      return e;
    });

    if (!updated) {
      throw new Error(`Id ${id} not found for update props`)
    }

    return this;
  }

  swap(id1: number, id2: number): this {
    const element1 = this.elements.find(e => e.id === id1);
    const element2 = this.elements.find(e => e.id === id2);

    if (!element1 || !element2) {
      throw new Error(`Id ${id1} or Id ${id2} not found for swap`)
    }

    const tmp = {x: element1.x, y: element1.y};
    element1.x = element2.x;
    element1.y = element2.y;
    element2.x = tmp.x;
    element2.y = tmp.y;

    this.needsToUpdateLinks = true;
    return this;
  }

  removeMatch(ids: number[]): this {
    ids.forEach(e => this.destroy(e));
    return this;
  }

  private rebuildLinks() {
    if (!this.needsToUpdateLinks) {
      return;
    }
    this.cordsLinks = this.elements.reduce((acc, e) => {
      acc[e.x + '-' + e.y] = e;
      return acc;
    }, {} as  { [p: string]: IElement });
    this.needsToUpdateLinks = false;
  }

  private destroy(id: number) {
    let removed = false;
    this.elements = this.elements.filter((e) => {
      if (e.id !== id) {
        return true;
      }
      removed = true;
      return false;
    });

    if (!removed) {
      throw new Error(`Id ${id} not found for delete`)
    }
    this.needsToUpdateLinks = true;

    return this;
  }

}