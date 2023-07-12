import {IEngine, IRunSystem, IWatchFamily, WatchType} from "@ecsx/core";
import {EntityTreeComponent, ChangeParentAction} from "./components";

export class EntityTreeSystem implements IRunSystem {
  private family: IWatchFamily<EntityTreeComponent>;

  attach(engine: IEngine): void {
    this.family = engine.createWatchFamily([WatchType.CREATED, WatchType.UPDATED, WatchType.REMOVED], EntityTreeComponent)
  }

  run(delta: number): void {
    this.family.each(({entity, prev, component}) => {
      const prevParent = prev?.parent || null
      const currParent = component?.parent || null

      if (prevParent !== currParent) {
        if (prevParent && prevParent.hasComponent(EntityTreeComponent)) {
          const prevParentComponent = prevParent.getComponent(EntityTreeComponent)
          prevParentComponent.children = prevParentComponent.children.filter(e => e != entity)
        }

        if (currParent && currParent.hasComponent(EntityTreeComponent)) {
          const currParentComponent = currParent.getComponent(EntityTreeComponent)
          currParentComponent.children = [...currParentComponent.children, entity]
        }

        entity.setAction(ChangeParentAction, {current: currParent, prev: prevParent})
      }

      const prevChildren = prev?.children || []
      const currChildren = component?.children || []

      prevChildren
        .filter(e => !currChildren.includes(e))
        .forEach(e => {
          const c = e.hasComponent(EntityTreeComponent) ?
            e.getComponent(EntityTreeComponent) :
            e.setComponent(EntityTreeComponent, {children: [], parent: null})
          e.setAction(ChangeParentAction, {prev: c.parent, current: null})
          c.parent = null
        })

      currChildren
        .filter(e => !prevChildren.includes(e))
        .forEach(e => {
          const c = e.hasComponent(EntityTreeComponent) ?
            e.getComponent(EntityTreeComponent) :
            e.setComponent(EntityTreeComponent, {children: [], parent: entity})
          e.setAction(ChangeParentAction, {prev: c.parent, current: entity})
          c.parent = entity
        })

    })
  }
}
