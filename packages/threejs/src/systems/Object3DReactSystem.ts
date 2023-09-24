import {
  IComponent,
  IEngine,
  IEntity,
  IRunSystem,
  ISystem, IWatchFamily,
  ReactCreateEvent,
  ReactRemoveEvent,
  ReactUpdateEvent,
  WatchType
} from "@ecsx/core";
import {Object3DChildrenComponent, Object3DComponent, Object3DParentComponent} from "../components";

export class Object3DReactSystem implements ISystem, IRunSystem {
  private createObjectFamily: IWatchFamily<Object3DComponent>;
  private createParentFamily: IWatchFamily<Object3DParentComponent>;
  private updateObjectFamily: IWatchFamily<Object3DComponent>;
  private updateParentFamily: IWatchFamily<Object3DParentComponent>;
  private removeObjectFamily: IWatchFamily<Object3DComponent>;
  private removeParentFamily: IWatchFamily<Object3DParentComponent>;

  attach(engine: IEngine): void {
    this.createObjectFamily = engine.createWatchFamily([WatchType.CREATED], Object3DComponent, [Object3DParentComponent])
    this.createParentFamily = engine.createWatchFamily([WatchType.CREATED], Object3DParentComponent, [Object3DComponent])

    this.updateObjectFamily = engine.createWatchFamily([WatchType.UPDATED], Object3DComponent)
    this.updateParentFamily = engine.createWatchFamily([WatchType.UPDATED], Object3DParentComponent)

    this.removeObjectFamily = engine.createWatchFamily([WatchType.REMOVED], Object3DComponent)
    this.removeParentFamily = engine.createWatchFamily([WatchType.REMOVED], Object3DParentComponent)
  }

  run(delta: number) {
    this.createObjectFamily.each(({entity}) => {
      if (entity.hasComponent(Object3DParentComponent)) {
        Object3DReactSystem.entityAddChild(entity.getComponent(Object3DParentComponent).parent, entity)
      }
    })

    this.createParentFamily.each(({entity}) => {
      Object3DReactSystem.entityAddChild(entity.getComponent(Object3DParentComponent).parent, entity)
    })

    this.updateObjectFamily.each(({entity}) => {
      if (!entity.hasComponent(Object3DParentComponent)) {
        return
      }
      Object3DReactSystem.entityRemoveChild(entity.getComponent(Object3DParentComponent).parent, entity)
      Object3DReactSystem.entityAddChild(entity.getComponent(Object3DParentComponent).parent, entity)
    })

    this.updateParentFamily.each(({entity, component, prev}) => {
      if (!prev || !component || component.parent === prev.parent) {
        return
      }
      Object3DReactSystem.entityRemoveChild(prev.parent, entity)
      Object3DReactSystem.entityAddChild(component.parent, entity)
    })

    this.removeObjectFamily.each(({entity}) => {
      if (!entity.hasComponent(Object3DParentComponent)) {
        return
      }
      Object3DReactSystem.entityRemoveChild(entity.getComponent(Object3DParentComponent).parent, entity)
    })

    this.removeParentFamily.each(({entity, prev}) => {
      if (!prev) {
        return;
      }
      Object3DReactSystem.entityRemoveChild(prev.parent, entity)
    })
  }

  private static entityAddChild(entity: IEntity, childEntity: IEntity) {
    childEntity.setComponent(Object3DParentComponent, {parent: entity})

    if (entity.hasComponent(Object3DChildrenComponent)) {
      entity.getComponent(Object3DChildrenComponent).children = [...entity.getComponent(Object3DChildrenComponent).children, childEntity]
    } else {
      entity.setComponent(Object3DChildrenComponent, {children: [childEntity]})
    }

    if (childEntity.hasComponent(Object3DComponent) && entity.hasComponent(Object3DComponent)) {
      entity.getComponent(Object3DComponent).object.add(childEntity.getComponent(Object3DComponent).object)
    }
  }

  private static entityRemoveChild(entity: IEntity, childEntity: IEntity) {
    if (childEntity.hasComponent(Object3DParentComponent)) {
      childEntity.removeComponent(Object3DParentComponent)
    }

    if (entity.hasComponent(Object3DChildrenComponent)) {
      const children = entity.getComponent(Object3DChildrenComponent)
      children.children = children.children.filter(e => e !== entity);
    }

    if (childEntity.hasComponent(Object3DComponent) && entity.hasComponent(Object3DComponent)) {
      entity.getComponent(Object3DComponent).object.remove(childEntity.getComponent(Object3DComponent).object)
    }
  }

}
