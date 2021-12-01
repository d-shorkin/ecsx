import {
  EntityCompositeCollection,
  Created,
  IEngine,
  IEntity,
  IEntityCollection,
  ISystem,
  Removed,
  Updated, Collection
} from "@ecsx/core";
import {Camera, Object3D, ParentObject3D, Renderer, Scene} from "../Components";


export class RendererSystem implements ISystem {
  private renderers: IEntityCollection;
  private removedObjects: IEntityCollection;
  private updatedObjects: IEntityCollection;
  private removedParent: IEntityCollection;

  onAttach(engine: IEngine): void {

    this.updatedObjects = new EntityCompositeCollection(
      new EntityCompositeCollection(
        engine.createFamily(Created(Object3D), ParentObject3D),
        engine.createFamily(Updated(Object3D), ParentObject3D),
      ),
      new EntityCompositeCollection(
        engine.createFamily(Object3D, Created(ParentObject3D)),
        engine.createFamily(Object3D, Updated(ParentObject3D))
      )
    );
    this.removedObjects = engine.createFamily(Removed(Object3D));
    this.removedParent = engine.createFamily(Removed(ParentObject3D), Object3D);

    this.renderers = engine.createFamily(Renderer, Scene, Camera);
  }

  execute(engine: IEngine, delta: number): void {
    this.updatedObjects.getEntities().forEach((entity: IEntity) => {
      const prevParent = entity.hasPrevComponent(ParentObject3D) ? entity.getPrevComponent(ParentObject3D) : entity.getComponent(ParentObject3D);
      const prevObject = entity.hasPrevComponent(Object3D) ? entity.getPrevComponent(Object3D) : entity.getComponent(Object3D);
      prevParent.object3D.remove(prevObject.object3D);
      entity.getComponent(ParentObject3D).object3D.add(entity.getComponent(Object3D).object3D);
    });

    this.removedObjects.getEntities().forEach((entity: IEntity) => {
      const parent = entity.getPrevComponent(Object3D).object3D.parent;
      if (parent) {
        parent.remove(entity.getPrevComponent(Object3D).object3D);
      }
    });

    this.removedParent.getEntities().forEach((entity: IEntity) => {
      entity.getPrevComponent(ParentObject3D).object3D.remove(entity.getComponent(Object3D).object3D);
    });

    this.renderers.getEntities().forEach((entity: IEntity) => {
      entity
        .getComponent(Renderer)
        .renderer
        .render(entity.getComponent(Scene).scene, entity.getComponent(Camera).camera);
    });
  }
}

