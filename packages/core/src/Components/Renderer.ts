import {Component} from "../Core/Component";
import {Scene} from "./Scene";
import {Camera} from "./Camera";

export interface RenderingItem {
  scene: Readonly<Scene>;
  camera: Readonly<Camera>;
}

export class Renderer extends Component {
  container?: HTMLElement;
  width: number = 800;
  height: number = 600;
  items: RenderingItem[] = [];
}