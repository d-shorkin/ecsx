import {IEngine, IEntityCollection, ISystem} from "@ecsx/core";
import {Changes, Element, ElementPosition, ElementPositionAnimation} from "../components";
import {Animator, lerpVector} from "../animator/Animator";
import {createClip, ClipPlayer, setDuration, limit} from "../animations/animations";


export class ChangesSystem implements ISystem {
  private changes: IEntityCollection;
  private elements: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.changes = engine.createFamily(Changes);
    this.elements = engine.createFamily(Element);
  }

  execute(engine: IEngine, delta: number): void {
    const d = delta * 1000;
    this.changes.getEntities().forEach(entity => {
      const {progress, duration, changes: changer} = entity.getComponent(Changes);
      const changes = changer.getChanges()
        .filter(c => c.time < progress + d && c.time >= progress)
        .sort((c1, c2) => Number(c2.type === 'create') - Number(c1.type === 'create'));

      if (progress + d > duration) {
        engine.removeEntity(entity);
      } else {
        entity.updateComponent(Changes, {progress: progress + d});
      }

      changes.forEach((c) => {
        switch (c.type) {
          case "swap":
            const e1 = this.elements.getEntities().find(e => e.getComponent(Element).id === c.payload.id1);
            const e2 = this.elements.getEntities().find(e => e.getComponent(Element).id === c.payload.id2);
            if (!e1 || !e2 || !e1.hasComponent(ElementPosition) || !e2.hasComponent(ElementPosition)) {
              break;
            }
            e1.setComponent(ElementPositionAnimation, {
              animation: new ClipPlayer(
                createClip(lerpVector(e2.getComponent(ElementPosition)), c.duration / 2),
                e1.getComponent(ElementPosition)
              )
            });
            e2.setComponent(ElementPositionAnimation, {
              animation: new ClipPlayer(
                createClip(lerpVector(e1.getComponent(ElementPosition)), c.duration / 2),
                e2.getComponent(ElementPosition)
              )
            });
            const {x: x1, y: y1} = e1.getComponent(ElementPosition);
            const {x: x2, y: y2} = e2.getComponent(ElementPosition);
            e1.setComponent(ElementPosition, {x: x2, y: y2});
            e2.setComponent(ElementPosition, {x: x1, y: y1});
            break;
          case "create":
            const entity = engine.createNextEntity();
            entity.setComponent(Element, {id: c.payload.id, type: c.payload.type});
            entity.setComponent(ElementPosition, {x: c.payload.x, y: c.payload.y - 1});
            engine.addEntity(entity);
            break;
          case "move":
            const e = this.elements.getEntities().find(e => e.getComponent(Element).id === c.payload.id);
            if (!e || !e.hasComponent(ElementPosition)) {
              break;
            }
            e.setComponent(ElementPositionAnimation, {
              animation: new ClipPlayer(
                setDuration(Animator.createMovingAnimation(c.payload.positions), c.duration + 100),
                {...e.getComponent(ElementPosition)}
              ),
            });
            e.setComponent(ElementPosition, c.payload.positions[c.payload.positions.length - 1]);
            break;
          case "remove":
            this.elements.getEntities().forEach(e => {
              if (c.payload.includes(e.getComponent(Element).id)) {
                engine.removeEntity(e);
              }
            });
            break;
        }
      });
    });
  }
}