import {AbstractHandler} from "./AbstractHandler";
import {ElementType, IElementsState} from "./contract";

export function getRandomType() {
  const items = [ElementType.Blue, ElementType.Green, ElementType.Red, ElementType.Yellow, ElementType.Purple];
  return items[Math.floor(Math.random() * items.length)];
}

export class CreationHandler extends AbstractHandler {
  handle(state: IElementsState): IElementsState {
    const {width} = state.getSize();
    for (let x = 0; x < width; x++) {
      const e = state.getByCoordinates(x, 0);
      if (e) {
        continue;
      }

      state.create({
        x,
        y: 0,
        type: getRandomType(),
        props: []
      });
    }

    return super.handle(state);
  }
}