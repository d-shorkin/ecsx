import {Camera, Renderer, Scene} from "three"
import {IComponent} from "@ecsx/core";

export class RendererComponent implements IComponent {
  static tag = 'three/renderer'
  renderer: Renderer
}

export class RendererSizeComponent implements IComponent {
  static tag = 'three/renderer-size'
  width: number
  height: number
}

export class CameraComponent implements IComponent {
  static tag = 'three/camera'
  camera: Camera
}

export class SceneComponent implements IComponent {
  static tag = 'three/scene'
  scene: Scene
}
