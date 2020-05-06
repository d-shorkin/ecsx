import {Component} from "../Core/Component";
import {IEntity} from "../Contract/Core";

export class Container extends Component {
  static tag = 'core/container';

  children: IEntity[] = []
}