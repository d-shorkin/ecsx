import {ChangeType, ElementsStateChanges} from "./ElementsStateChanges";
import {IElement, IElementsState} from "./contract";
import {BasicMatchHandler} from "./BasicMatchHandler";
import {MoveHandler} from "./MoveHandler";
import {CreationHandler} from "./CreationHandler";

export interface TurnResult {
  changes: ChangeType[][];
  result: IElement[]
}

const matchHandler = new BasicMatchHandler();

const moveHandler = new MoveHandler();
moveHandler.setNext(new CreationHandler());

export class Game {
  private state: ElementsStateChanges;

  constructor(state: IElementsState) {
    this.state = new ElementsStateChanges(state);
  }

  turn(id: number, x: number, y: number): TurnResult | null {
    const changes: ChangeType[][] = [];
    const guardCords = {x: x ? x / Math.abs(x) : 0, y: (x === 0 && y !== 0) ? y / Math.abs(y) : 0};
    const e1 = this.state.getById(id);
    if (!e1) {
      return null;
    }
    const e2 = this.state.getByCoordinates(e1.x + guardCords.x, e1.y + guardCords.y);
    if (!e2) {
      return null;
    }
    this.state.clearChanges();

    // swap
    this.state.swap(e1.id, e2.id);
    changes.push(this.state.getChanges());
    this.state.clearChanges();

    // match;
    matchHandler.handle(this.state);
    if (!this.state.getChanges().length) {
      this.state.swap(e1.id, e2.id);
      this.state.clearChanges();
      return null;
    }

    // Move and match again;
    do {
      changes.push(this.state.getChanges());
      this.state.clearChanges();
      moveHandler.handle(this.state);
      if (this.state.getChanges().length) {
        continue;
      }
      matchHandler.handle(this.state);
    } while (this.state.getChanges().length);

    return {
      changes,
      result: this.state.getAll()
    }
  }
}