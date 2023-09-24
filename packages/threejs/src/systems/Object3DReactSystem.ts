import {IComponent, IEngine, IEntity, ISystem, ReactCreateEvent, ReactRemoveEvent, ReactUpdateEvent} from "@ecsx/core";
import {Object3DChildrenComponent, Object3DComponent, Object3DParentComponent} from "../components";

export class Object3DSystem implements ISystem {
  private static createObject3D({entity}: ReactCreateEvent<Object3DComponent>) {
    if (entity.hasComponent(Object3DParentComponent)) {
      Object3DSystem.entityAddChild(entity.getComponent(Object3DParentComponent).parent, entity)
    }
  }

  private static createObject3DParent({entity, component}: ReactCreateEvent<Object3DParentComponent>) {
    Object3DSystem.entityAddChild(component.parent, entity)
  }

  private static updateObject3DParent({entity, component, prev}: ReactUpdateEvent<Object3DParentComponent>) {
    if (component.parent === prev.parent) {
      return
    }
    Object3DSystem.entityRemoveChild(prev.parent, entity)
    Object3DSystem.entityAddChild(component.parent, entity)
  }

  private static updateObject3D({entity}: ReactUpdateEvent<Object3DComponent>) {
    if (!entity.hasComponent(Object3DParentComponent)) {
      return
    }
    Object3DSystem.entityRemoveChild(entity.getComponent(Object3DParentComponent).parent, entity)
    Object3DSystem.entityAddChild(entity.getComponent(Object3DParentComponent).parent, entity)
  }

  private static removeObject3D({entity}: ReactRemoveEvent<Object3DComponent>) {
    if (!entity.hasComponent(Object3DParentComponent)) {
      return
    }
    Object3DSystem.entityRemoveChild(entity.getComponent(Object3DParentComponent).parent, entity)
  }

  private static removeObject3DParent({entity, component}: ReactRemoveEvent<Object3DParentComponent>) {
    Object3DSystem.entityRemoveChild(component.parent, entity)
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

  attach(engine: IEngine): void {
    engine.react().onCreate({type: Object3DComponent, filter: [Object3DParentComponent]}, Object3DSystem.createObject3D)
    engine.react().onCreate({type: Object3DParentComponent, filter: [Object3DComponent]}, Object3DSystem.createObject3DParent)

    engine.react().onUpdate({type: Object3DComponent}, Object3DSystem.updateObject3D)
    engine.react().onUpdate({type: Object3DParentComponent}, Object3DSystem.updateObject3DParent)

    engine.react().onRemove({type: Object3DComponent}, Object3DSystem.removeObject3D)
    engine.react().onRemove({type: Object3DParentComponent}, Object3DSystem.removeObject3DParent)

  }

}
