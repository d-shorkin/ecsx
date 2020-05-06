import {Component} from "../Core/Component";
import {IEntity} from "../..";

export interface RenderingItem {
  scene: IEntity;
  camera: IEntity;
}

export class Renderer extends Component {
  container?: HTMLElement;
  width: number = 800;
  height: number = 600;
  items: RenderingItem[] = [];
}