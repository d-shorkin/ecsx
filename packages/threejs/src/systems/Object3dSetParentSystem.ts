import {IEngine, IFamily, IRunSystem} from "@ecsx/core";
import {Object3DComponent, Object3DSetParentAction, Object3DSetParentEntityAction} from "../components";

/**
 * @deprecated The method should not be used
 */
export class Object3dSetParentSystem implements IRunSystem {
  private familyEntities: IFamily;
  private familyObjects: IFamily;

  attach(engine: IEngine): void {
    this.familyEntities = engine.createFamily(Object3DComponent, Object3DSetParentEntityAction)
    this.familyObjects = engine.createFamily(Object3DComponent, Object3DSetParentAction)
  }

  run(delta: number): void {
    this.familyEntities.each((entity) => {
      const parent = entity.getComponent(Object3DSetParentEntityAction).parent
      if (parent.hasComponent(Object3DComponent)) {
        entity.setAction(Object3DSetParentAction, {parent: parent.getComponent(Object3DComponent).object})
      }
    })

    this.familyObjects.each((entity) => {
      const parent = entity.getComponent(Object3DSetParentAction).parent
      parent.add(entity.getComponent(Object3DComponent).object)
    })
  }

}
