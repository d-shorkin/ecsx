import {
  Camera as CameraComponent,
  Comparator,
  ComponentConstructor,
  IComponent,
  IEntity,
  IRepository, IRepositoryItem
} from "@ecsx/core";
import {Camera, PerspectiveCamera, OrthographicCamera} from "three";

export class CameraWrapper {
  camera: Camera;
  perspectiveCamera?: PerspectiveCamera;
  orthographicCamera?: OrthographicCamera;
}

export class CameraComparator extends Comparator<CameraWrapper> {
  protected fuse: ComponentConstructor<IComponent>[] = [CameraComponent];

  protected create(entity: IEntity): CameraWrapper | null {
    return this.update(entity, new CameraWrapper());
  }

  protected update(entity: IEntity, obj: CameraWrapper): CameraWrapper | null {
    const component = entity.getComponent(CameraComponent);

    if (component!.perspective) {
      if (!obj.perspectiveCamera) {
        obj.perspectiveCamera = new PerspectiveCamera(component.fov, component.aspect, component.near, component.far);
      }

      obj.camera = obj.perspectiveCamera;
    } else if (!obj.orthographicCamera) {
      obj.orthographicCamera = new OrthographicCamera(
        component.fov * component.aspect / -2,
        component.fov * component.aspect / 2,
        component.fov / 2,
        component.fov / -2,
        component.near, component.far);
    } else {
      obj.camera = obj.orthographicCamera;
    }

    if (component.hasAnyUpdates('perspective', 'fov', 'near', 'aspect', 'far')) {
      if (component.perspective) {
        obj.perspectiveCamera!.fov = component.fov;
        obj.perspectiveCamera!.aspect = component.aspect;
        obj.perspectiveCamera!.near = component.near;
        obj.perspectiveCamera!.far = component.far;
        obj.perspectiveCamera!.updateProjectionMatrix();
      } else {
        obj.orthographicCamera!.left = component.fov * component.aspect / -2;
        obj.orthographicCamera!.right = component.fov * component.aspect / 2;
        obj.orthographicCamera!.top = component.fov / 2;
        obj.orthographicCamera!.bottom = component.fov / -2;
        obj.orthographicCamera!.near = component.near;
        obj.orthographicCamera!.far = component.far;
        obj.orthographicCamera!.updateProjectionMatrix();
      }
    }
    return obj;
  }

  protected destroy(entity: IEntity, obj: CameraWrapper): void {
    // do nothing ...
  }
}

export class CameraRepository implements IRepository<Camera> {
  private comparator: CameraComparator;

  constructor(comparator: CameraComparator){
    this.comparator = comparator;
  }

  getAll(): IRepositoryItem<Camera>[] {
    return this.comparator.getAll().map(({entity, item}) => ({entity, item: item.camera}));
  }

  getBy(entity: IEntity): Camera {
    return this.comparator.getBy(entity).camera;
  }

  hasBy(entity: IEntity): boolean {
    return this.comparator.hasBy(entity);
  }

}