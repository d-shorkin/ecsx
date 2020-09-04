import {
  Collider2d,
  Comparator,
  ComponentConstructor,
  IComponent,
  IEntity,
  IRepository,
  IRepositoryItem,
  RigidBody
} from "@ecsx/core";
import {Body, Engine, Vector, World} from "matter-js";
import {RootEngine} from "../Components/RootEngine";
import {MatterPolygonFactory} from "../Helpers/MatterPolygonFactory";

export interface MatterBodyWrapper {
  engine: Engine;
  body: Body;
}

export class BodyComparator extends Comparator<MatterBodyWrapper> {
  private helper: MatterPolygonFactory = new MatterPolygonFactory();
  protected fuse: ComponentConstructor<IComponent>[] = [Collider2d, RigidBody, RootEngine];
  private engines: IRepository<Engine>;

  constructor(engines: IRepository<Engine>) {
    super();
    this.engines = engines;
  }

  protected create(entity: IEntity): MatterBodyWrapper | null {
    if (!entity.getComponent(RootEngine).engine || !this.engines.hasBy(entity.getComponent(RootEngine).engine!)) {
      return null;
    }
    const component = entity.getComponent(Collider2d);
    const matterVerticesSet = component.getWorld()
      .map(part => this.helper.decompVerticles(part.map(v => (Vector.create(v.x, v.y)))))
      .reduce((acc, item) => acc.concat(item), [] as Vector[][]);

    const body = this.helper.createFromVerticesSet(matterVerticesSet);

    const engine = this.engines.getBy(entity.getComponent(RootEngine).engine!);

    World.addBody(engine.world, body);

    this.updateRigidBody(body, entity.getComponent(RigidBody));

    return {
      body,
      engine
    };
  }

  protected update(entity: IEntity, obj: MatterBodyWrapper): MatterBodyWrapper | null {
    if (!entity.getComponent(RootEngine).engine || !this.engines.hasBy(entity.getComponent(RootEngine).engine!)) {
      return null;
    }

    if (entity.getComponent(Collider2d).hasUpdate('vertices')) {
      this.destroy(entity, obj);
      return this.create(entity);
    }

    const engine = this.engines.getBy(entity.getComponent(RootEngine).engine!);
    if (engine !== obj.engine) {
      World.remove(obj.engine.world, obj.body);
      obj.engine = engine;
      World.addBody(obj.engine.world, obj.body);
    }

    this.updateRigidBody(obj.body, entity.getComponent(RigidBody));

    return obj;
  }

  protected destroy(entity: IEntity, obj: MatterBodyWrapper): void {
    World.remove(obj.engine.world, obj.body);
  }

  private updateRigidBody(body: Body, component: RigidBody | Readonly<RigidBody>) {
    if(body.isStatic !== component.isStatic){
      Body.setStatic(body, component.isStatic);
    }
  }
}

export class BodyRepository implements IRepository<Body> {
  private base: IRepository<MatterBodyWrapper>;

  constructor(base: IRepository<MatterBodyWrapper>) {
    this.base = base;
  }

  getAll(): IRepositoryItem<Body>[] {
    return this.base.getAll().map(({item: {body}, entity}) => ({entity, item: body}));
  }

  getBy(entity: IEntity): Body {
    return this.base.getBy(entity).body;
  }

  hasBy(entity: IEntity): boolean {
    return this.base.hasBy(entity);
  }

}