import {IEngine, IEntityCollection, ISystem} from "@ecsx/core";
import {Changes, Element, ElementPosition, ElementPositionAnimation, Selected} from "../components";
import {Raycast, Scene} from "@ecsx/threejs";
import {ElementType, IElementsState} from "../logic/contract";
import {Game} from "../logic/Game";
import {Changer} from "../Changer";
import {Animator} from "../animator/Animator";
import {ClipPlayer} from "../animations/animations";

export function getRandomType() {
  const items = [ElementType.Blue, ElementType.Green, ElementType.Red, ElementType.Yellow, ElementType.Purple];
  return items[Math.floor(Math.random() * items.length)];
}

const walls = [];

export class ServerSystem implements ISystem {
  private elements: IEntityCollection;
  private scene: IEntityCollection;
  private readonly state: IElementsState;
  private raycast: IEntityCollection;
  private selectedElement: IEntityCollection;
  private gameLogic: Game;

  constructor(state: IElementsState) {
    this.state = state;
    this.gameLogic = new Game(this.state);
    for (let x = 0; x < this.state.getSize().width; x++) {
      for (let y = 0; y < this.state.getSize().height; y++) {
        if(walls.some(([x1, y1]) => x === x1 && y === y1)){
          this.state.create({type: ElementType.None, x: x, y: y, props: []});
          continue;
        }

        this.state.create({type: getRandomType(), x: x, y: y, props: []});
      }
    }
  }

  onAttach(engine: IEngine): void {
    this.elements = engine.createFamily(Element);
    this.scene = engine.createFamily(Scene);
    this.raycast = engine.createFamily(Raycast);
    this.selectedElement = engine.createFamily(Element, Selected);
    this.state.getAll().forEach((e) => {
      const entity = engine.createNextEntity();
      entity.setComponent(Element, {id: e.id, type: e.type});
      entity.setComponent(ElementPosition, {x: e.x, y: e.y});
      engine.addEntity(entity);
    });
  }

  execute(engine: IEngine, delta: number): void {
    this.raycast.getEntities().forEach(r => {
      r.getComponent(Raycast).entities.forEach(e => {
        const entity = this.elements.getEntities().find(el => el === e);
        if (!entity || !entity.hasComponent(ElementPosition)) {
          return;
        }

        if (!this.selectedElement.getEntities().length) {
          entity.setComponent(Selected, {});
          return;
        }

        const selected = this.selectedElement.getEntities()[0];
        if (selected === entity) {
          return;
        }

        if (!selected.hasComponent(ElementPosition)) {
          selected.removeComponent(Selected);
          return;
        }

        const {x: x1, y: y1} = selected.getComponent(ElementPosition);
        const {x: x2, y: y2} = entity.getComponent(ElementPosition);

        const canBeSwap = Math.abs((x2 - x1) + (y2 - y1)) === 1;

        if (canBeSwap) {
          selected.removeComponent(Selected);
          const res = this.gameLogic.turn(selected.getComponent(Element).id, (x2 - x1), (y2 - y1));
          if (res) {
            const ent = engine.createNextEntity();
            ent.setComponent(Changes, {
              changes: new Changer(res.changes, res.changes.length * 300),
              duration: res.changes.length * 300, progress: 0
            });
            engine.addEntity(ent);
            console.log(res);
          }
        } else {
          selected.removeComponent(Selected);
          entity.setComponent(Selected, {});
        }
      });
      r.removeComponent(Raycast);
    });
  }
}