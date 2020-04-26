import {Component} from "../Core/Component";
import {IEntity} from "../Core/Contract";

export class Container extends Component {
  static tag = 'core/container';

  children: IEntity[] = []
}