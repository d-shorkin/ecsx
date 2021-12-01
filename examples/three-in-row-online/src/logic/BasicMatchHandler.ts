import {AbstractHandler} from "./AbstractHandler";
import {IElementsState} from "./contract";
import {ElementType, IElement} from "./contract";

class Matcher {
  private state: IElementsState;

  constructor(state: IElementsState){
    this.state = state;
  }

  matchAll(): IElement[][] {
    const elements = this.state.getAll();
    if (!elements.length) {
      return [];
    }
    const {width, height} = this.state.getSize();
    return this.matchColumnsAndRows(width, height);
  }

  private matchColumnsAndRows(width: number, height: number): IElement[][] {
    const vertical = this.matchColumns(width, height);
    const horisontal = this.matchRows(width, height);
    return horisontal.concat(vertical.filter(vMatch => {
      const contiguous = horisontal.find(hMatch => hMatch.some(e => vMatch.includes(e)));
      if (!contiguous) {
        return true;
      }

      vMatch.forEach(e => {
        if (!contiguous.includes(e)) {
          contiguous.push(e);
        }
      });

      return false;
    }));
  }

  private matchColumns(width: number, height: number): IElement[][] {
    let currentMatch: IElement[] = [];
    const result: IElement[][] = [];

    function clearMatch() {
      if (currentMatch.length >= 3) {
        result.push(currentMatch);
      }
      currentMatch = [];
    }

    for (let x = 0; x < width; x++) {
      clearMatch();
      for (let y = 0; y < height; y++) {
        const element = this.state.getByCoordinates(x, y);

        if (!element || element.type === ElementType.None) {
          clearMatch();
          continue;
        }

        if (!currentMatch.length) {
          currentMatch.push(element);
          continue;
        }

        if (element.type === currentMatch[0].type) {
          currentMatch.push(element);
        } else {
          clearMatch();
          currentMatch.push(element);
        }
      }
    }

    clearMatch();

    return result;
  }

  private matchRows(width: number, height: number): IElement[][] {
    let currentMatch: IElement[] = [];
    const result: IElement[][] = [];

    function clearMatch() {
      if (currentMatch.length >= 3) {
        result.push(currentMatch);
      }
      currentMatch = [];
    }

    for (let y = 0; y < height; y++) {
      clearMatch();
      for (let x = 0; x < width; x++) {
        const element = this.state.getByCoordinates(x, y);

        if (!element || element.type === ElementType.None) {
          clearMatch();
          continue;
        }

        if (!currentMatch.length) {
          currentMatch.push(element);
          continue;
        }

        if (element.type === currentMatch[0].type) {
          currentMatch.push(element);
        } else {
          clearMatch();
          currentMatch.push(element);
        }
      }
    }

    clearMatch();

    return result;
  }
}

export class BasicMatchHandler extends AbstractHandler {
  handle(state: IElementsState): IElementsState {
    const matcher = new Matcher(state);
    const matches = matcher.matchAll();
    matches.forEach(match => state.removeMatch(match.map(e => e.id)));
    return super.handle(state);
  }
}