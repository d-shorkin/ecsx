import {ChangeType as ServerChange, MoveChange as ServerMoveChange} from "./logic/ElementsStateChanges";
import {ElementProp, IElement, IVector} from "./logic/contract";

const times = {
  "swap": 300,
  "create": 250,
  "move": 250,
  "remove": 500,
  "update-props": 500,
};

export interface IChange<N extends string, T> {
  type: N,
  payload: T,
  time: number;
  duration: number;
}

export interface SwapChange extends IChange<'swap', { id1: number, id2: number }> {
}

export interface CreateChange extends IChange<'create', IElement> {
}

export interface MoveChange extends IChange<'move', { id: number, positions: IVector[] }> {
}

export interface RemoveChange extends IChange<'remove', number[]> {
}

export interface UpdatePropsChange extends IChange<'update-props', { id: number, props: ElementProp[] }> {
}

export type ChangeType = CreateChange | RemoveChange | SwapChange | MoveChange | UpdatePropsChange;

export class Changer {
  private changes: ChangeType[];
  readonly timeScale: number = 1;

  constructor(changes: ServerChange[][], duration: number) {
    this.changes = this.formatChanges(changes);
    this.timeScale = duration / this.getChangesDuration();
  }

  getChanges(): ChangeType[] {
    return this.changes.map(c => ({...c, duration: c.duration * this.timeScale, time: c.time * this.timeScale}));
  }

  private getChangesDuration(): number {
    return this.changes.reduce((acc, c) => c.time + c.duration > acc ? c.time + c.duration : acc, 0);
  }

  private formatChanges(changes: ServerChange[][]): ChangeType[] {
    const timing: number[] = changes
      .map((step) => step.reduce((acc, {type}) => times[type] && times[type] > acc ? times[type] : acc, 0) || 300)
      .reduce((acc, t, i) => acc.concat(acc[i] + t), [0] as number[]);

    const withoutMoves = changes.reduce((acc, c, i) => acc.concat(
      c.filter(c => c.type !== 'move').map((c) => {
        return {...c, time: timing[i], duration: timing[i + 1] - timing[i]} as ChangeType;
      })
    ), [] as ChangeType[]);

    const moves: MoveChange[] = [];
    changes.forEach((step, i) => {
      step.forEach((change) => {
        if (change.type !== 'move' && change.type !== 'create') {
          return;
        }

        const positions: IVector[] = [];

        if (change.type === 'move') {
          if (
            moves.some(({payload}) => (change.payload.id === payload.id ?
              payload.positions.some(({x, y}) => (change.payload.x === x && change.payload.y === y)) :
              false))
          ) {
            return;
          }

          positions.push({x: change.payload.x, y: change.payload.y});
        }

        if (change.type === 'create') {
          if (
            moves.some(({payload}) => (change.payload.id === payload.id ?
              payload.positions.some(({x, y}) => (change.payload.x === x && change.payload.y === y)) :
              false))
          ) {
            return;
          }

          positions.push({x: change.payload.x, y: change.payload.y});
        }

        if (!positions.length) {
          return;
        }

        for (let s = i + 1; s < changes.length; s++) {
          const c = changes[s].find((c) => c.type === 'move' && c.payload.id === change.payload.id) as ServerMoveChange | undefined;
          if (!c) {
            break;
          }
          positions.push({x: c.payload.x, y: c.payload.y});
        }

        moves.push({
          type: 'move',
          payload: {id: change.payload.id, positions},
          time: timing[i],
          duration: timing[i + 1] - timing[i]
        });
      });
    });

    return withoutMoves.concat(moves);
  }

}