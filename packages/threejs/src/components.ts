import {Camera, Mesh, Object3D, Renderer, Scene} from "three"
import {IComponent, IEntity} from "@ecsx/core";

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

export class Object3DComponent implements IComponent {
  static tag = 'three/object-3d'
  object: Object3D
}

export class Object3DParentComponent implements IComponent {
  static tag = 'three/object-3d-parent'
  parent: IEntity
}

export class Object3DChildrenComponent implements IComponent {
  static tag = 'three/object-3d-children'
  children: IEntity[]
}

export class MeshComponent implements IComponent {
  static tag = 'three/mesh'
  mesh: Mesh
}


