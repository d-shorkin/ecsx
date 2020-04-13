import {Component} from "../Core/Component";
import {IEntity} from "../Core/Contract";

export class Container extends Component<{ children: IEntity[] }> {
  static tag = 'core/container';

  protected data = {children: []};
}