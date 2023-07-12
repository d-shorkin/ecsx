import {IEngine, IFamily, IRunSystem, IWatchFamily, WatchType} from "@ecsx/core";
import {ContainerComponent, DisplayObjectComponent} from "../components";
import {ChangeParentAction, EntityTreeComponent} from "@ecsx/entities-tree";

export class TreeSystem implements IRunSystem {
  private displayObjectFamily: IWatchFamily<DisplayObjectComponent>;
  private containerFamily: IWatchFamily<ContainerComponent>;
  private changeParent: IFamily;

  attach(engine: IEngine): void {
    this.displayObjectFamily = engine.createWatchFamily([WatchType.CREATED, WatchType.UPDATED, WatchType.REMOVED], DisplayObjectComponent)
    this.containerFamily = engine.createWatchFamily([WatchType.CREATED, WatchType.UPDATED, WatchType.REMOVED], ContainerComponent)

    this.changeParent = engine.createFamily(DisplayObjectComponent, ChangeParentAction)
  }

  run(delta: number): void {
    this.displayObjectFamily.each(({entity, prev, component}) => {
      if (prev === component || !entity.hasComponent(EntityTreeComponent)) {
        return;
      }

      if (prev) {
        prev.displayObject.removeFromParent()
      }

      if (!component) {
        return;
      }

      const parentEntity = entity.getComponent(EntityTreeComponent).parent
      const parent = parentEntity && parentEntity.hasComponent(ContainerComponent) ?
        parentEntity.getComponent(ContainerComponent).container : null

      if (!parent) {
        return;
      }

      component.displayObject.setParent(parent)
    })

    this.containerFamily.each(({entity, prev, component}) => {
      if (prev === component || !entity.hasComponent(EntityTreeComponent)) {
        return;
      }

      if (prev) {
        prev.container.removeChildren()
      }

      if (!component) {
        return;
      }

      entity.getComponent(EntityTreeComponent).children.forEach((childEntity) => {
        const child = childEntity && childEntity.hasComponent(DisplayObjectComponent) ?
          childEntity.getComponent(ContainerComponent).container : null

        if (child) {
          child.setParent(component.container)
        }
      })
    })

    this.changeParent.each((entity => {
      const action = entity.getComponent(ChangeParentAction)

      if(action.current && action.current.hasComponent(ContainerComponent)){
        entity.getComponent(DisplayObjectComponent).displayObject
          .setParent(action.current.getComponent(ContainerComponent).container)
      } else {
        entity.getComponent(DisplayObjectComponent).displayObject
          .removeFromParent()
      }
    }))
  }

}
