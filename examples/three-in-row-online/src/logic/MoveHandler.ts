import {AbstractHandler} from "./AbstractHandler";
import {ElementType, IElementsState} from "./contract";

export class MoveHandler extends AbstractHandler {
  handle(state: IElementsState): IElementsState {
    const {width, height} = state.getSize();
    for (let y = height - 2; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const e = state.getByCoordinates(x, y);
        if (!e) {
          continue;
        }

        let tmpEl = state.getByCoordinates(x - 1, y);
        if (tmpEl && tmpEl.type === ElementType.None) {
          tmpEl = state.getByCoordinates(x - 1, y + 1);
          if (!tmpEl) {
            state.move(e.id, x - 1, y + 1);
            continue;
          }
        }

        tmpEl = state.getByCoordinates(x + 1, y);
        if (tmpEl && tmpEl.type === ElementType.None) {
          tmpEl = state.getByCoordinates(x + 1, y + 1);
          if (!tmpEl) {
            state.move(e.id, x + 1, y + 1);
            continue;
          }
        }

        tmpEl = state.getByCoordinates(x, y + 1);
        if (!tmpEl) {
          state.move(e.id, x, y + 1);
        }
      }
    }
    return super.handle(state);
  }
}