import {IEngine, IFamily, IRepository, ISystem, NullFamily, IEntity, Container, Transform} from "@ecsx/core";
import Matter, {Body, Engine} from "matter-js";
import {Engine as EngineComponent} from "../Components/Engine";
import {RootEngine} from "../Components/RootEngine";
import {MatterBodyWrapper} from "../Comparators/BodyComparator";

export class EngineSystem implements ISystem {
  private engineRepository: IRepository<Engine>;
  private entities: IFamily = NullFamily;
  private containers: IFamily = NullFamily;
  private bodiesRepository: IRepository<MatterBodyWrapper>;

  constructor(engineRepository: IRepository<Engine>, bodiesRepository: IRepository<MatterBodyWrapper>) {
    this.engineRepository = engineRepository;
    this.bodiesRepository = bodiesRepository;
  }

  onAttach(engine: IEngine): void {
    this.entities = engine.createFamily(EngineComponent);
    this.containers = engine.createFamily(Container, RootEngine);
  }

  execute(engine: IEngine, delta: number): void {
    this.containers.getEntities().forEach(e => {
      if (e.getComponent(Container).hasUpdate('children') && e.getComponent(RootEngine).engine) {
        this.setRootRecursive(e.getComponent(Container).children, e.getComponent(RootEngine).engine!);
      }
    });

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