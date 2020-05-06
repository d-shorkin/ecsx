import {
  Collider2d,
  Comparator,
  ComponentConstructor,
  IComponent,
  IEntity,
  IRepository,
  IRepositoryItem,
  RootScene
} from "@ecsx/core";
import {Scene, LineBasicMaterial, Group, Line, BufferGeometry, Vector2} from "three";

export interface Collider2dMesh {
  scene: Scene;
  group: Group;
}

export class Collider2dComparator extends Comparator<Collider2dMesh> {
  protected fuse: ComponentConstructor<IComponent>[] = [Collider2d, RootScene];
  private scenes: IRepository<Scene>;

  constructor(scenes: IRepository<Scene>) {
    super();
    this.scenes = scenes;
  }

  protected create(entity: IEntity): Collider2dMesh | null {
    if (!entity.getComponent(RootScene).scene || !this.scenes.hasBy(entity.getComponent(RootScene).scene!)) {
      return null;
    }

    const scene = this.scenes.getBy(entity.getComponent(RootScene).scene!);

    const items = entity.getComponent(Collider2d).vertices.map((item) => (new BufferGeometry()).setFromPoints(item.map(({x, y}) => new Vector2(x, y))));
    const group = new Group();
    items.forEach(item => group.add(new Line(item, new LineBasicMaterial({color: 0xffffff}))));
    scene.add(group);

    return {scene, group};
  }

  protected update(entity: IEntity, obj: Collider2dMesh): Collider2dMesh | null {
    if (!entity.getComponent(Collider2d).hasUpdate('vertices')) {
      return obj;
    }

    this.destroy(entity, obj);

    return this.create(entity);
  }

  protected destroy(entity: IEntity, obj: Collider2dMesh): void {
    obj.scene.remove(obj.group);
  }
}