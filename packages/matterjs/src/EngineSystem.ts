import {IEngine, ISystem} from "@ecsx/core";
import Matter from "matter-js";

export class EngineSystem implements ISystem {
  private matter: Matter.Engine;

  constructor(matter: Matter.Engine) {
    this.matter = matter;
  }

  onAttach(engine: IEngine): void {

  }

  execute(engine: IEngine, delta: number): void {
    this.entities.getEntities().forEach(e => {
      if (!e.hasComponent(RootEngine)) {
        e.addComponent(RootEngine).set('engine', e);
      }

      if (e.hasComponent(Container)) {
        this.setRootRecursive(e.getComponent(Container).children, e);
      }

      if (this.engineRepository.hasBy(e)) {
        const engine = this.engineRepository.getBy(e);

        this.bodiesRepository.getAll()
          .filter(({item}) => item.engine === engine)
          .forEach(({entity, item: {body}}) => {
            if (!entity.hasComponent(Transform)) {
              return;
            }

            const t = entity.getComponent(Transform);

            if (
              t.getWorld('positionX') !== (body.position.x / 100) ||
              t.getWorld('positionY') !== (body.position.y / 100)
            ) {
              const pos = Matter.Vector.create(t.getWorld('positionX'), t.getWorld('positionY'));
              Body.setPosition(body, pos);
            }
          });

        Engine.update(engine);

        this.bodiesRepository.getAll()
          .filter(({item}) => item.engine === engine)
          .forEach(({entity, item: {body}}) => {
            if (!entity.hasComponent(Transform)) {
              entity.addComponent(Transform);
            }

            const t = entity.getComponent(Transform);

            t.setWorld('positionX', body.position.x);
            t.setWorld('positionY', body.position.y);
            t.setWorld('rotationZ', body.angle);
          });
      }
    });
  }

  private setRootRecursive(children: IEntity[], engine: IEntity) {
    children.forEach(child => {
      if (!child.hasComponent(RootEngine)) {
        child.addComponent(RootEngine);
      }

      child.getComponent(RootEngine).set('engine', engine);

      if (child.hasComponent(Container)) {
        this.setRootRecursive(child.getComponent(Container).children, engine);
      }
    })
  }

}