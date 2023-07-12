import {IComponent, IEntity} from "@ecsx/core";

export class EntityTreeComponent implements IComponent {
  static tag = 'ecsx/entity-tree'

  parent: IEntity | null
  children: IEntity[]
}


export class ChangeParentAction implements IComponent {
  static tag = 'ecsx/change-parent'

  current: IEntity | null
  prev: IEntity | null
}
