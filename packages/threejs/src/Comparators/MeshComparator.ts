import {
  Comparator,
  ComponentConstructor,
  IComponent,
  IEntity,
  IRepository,
  IRepositoryItem,
  RootScene
} from "@ecsx/core";
import {Mesh as MeshComponent} from "../Components";
import {Mesh, Scene} from "three";

export interface MeshWrapper {
  scene: Scene,
  mesh: Mesh
}

export class MeshComparator extends Comparator<MeshWrapper> {
  protected fuse: ComponentConstructor<IComponent>[] = [MeshComponent, RootScene];
  private scenes: IRepository<Scene>;

  constructor(scenes: IRepository<Scene>) {
    super();
    this.scenes = scenes;
  }

  protected create(entity: IEntity): MeshWrapper | null {
    if (!entity.getComponent(RootScene).scene || !this.scenes.hasBy(entity.getComponent(RootScene).scene!)) {
      return null;
    }

    const component = entity.getComponent(MeshComponent);

    const mesh = new Mesh(component.geometry, component.material);

    const scene = this.scenes.getBy(entity.getComponent(RootScene).scene!);
    scene.add(mesh);

    return {
      mesh, scene
    };
  }

  protected update(entity: IEntity, obj: MeshWrapper): MeshWrapper | null {
    if (!entity.getComponent(RootScene).scene || !this.scenes.hasBy(entity.getComponent(RootScene).scene!)) {
      return null;
    }

    const component = entity.getComponent(MeshComponent);

    if ((obj.mesh.geometry !== component.geometry || obj.mesh.material !== component.material)) {
      this.destroy(entity, obj);
      return this.create(entity);
    }

    const scene = this.scenes.getBy(entity.getComponent(RootScene).scene!);

    if (obj.scene !== scene) {
      obj.scene.remove(obj.mesh);
      scene.add(obj.mesh);
      obj.scene = scene;
    }

    return obj;
  }

  protected destroy(entity: IEntity, obj: MeshWrapper): void {
    obj.scene.remove(obj.mesh);
  }
}

export class MeshRepository implements IRepository<Mesh> {
  private comparator: MeshComparator;

  constructor(comparator: MeshComparator) {
    this.comparator = comparator;
  }

  getAll(): IRepositoryItem<Mesh>[] {
    return this.comparator.getAll().map(({item, entity}) => ({entity, item: item.mesh}));
  }

  getBy(entity: IEntity): Mesh {
    return this.comparator.getBy(entity).mesh;
  }

  hasBy(entity: IEntity): boolean {
    return this.comparator.hasBy(entity);
  }

}