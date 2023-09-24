import {Camera, Mesh, Object3D, Renderer, Scene} from "three"
import {IComponent, IEntity} from "@ecsx/core";

// Tags
export class IsMainRendererTag implements IComponent {
  static tag = 'three/is-main-renderer'
}

// Objects
export class RendererComponent implements IComponent {
  static tag = 'three/renderer'
  renderer: Renderer
  camera: IEntity
  scene: IEntity
}

export class Object3DComponent implements IComponent {
  static tag = 'three/object-3d'
  object: Object3D
}

export class CameraComponent implements IComponent {
  static tag = 'three/camera'
  camera: Camera
}

export class SceneComponent implements IComponent {
  static tag = 'three/scene'
  scene: Scene
}

export class MeshComponent implements IComponent {
  static tag = 'three/mesh'
  mesh: Mesh
}

// Actions
export class RendererSetSizeAction implements IComponent {
  static tag = 'three/renderer-set-size'
  width: number
  height: number
}

export class Object3DSetParentAction implements IComponent {
  static tag = 'three/object-3d-set-parent'
  parent: Object3D
}

export class Object3DSetParentEntityAction implements IComponent {
  static tag = 'three/object-3d-set-parent-entity'
  parent: IEntity
}


// Helpers
export class Object3DParentComponent implements IComponent {
  static tag = 'three/object-3d-parent'
  parent: IEntity
}

export class Object3DChildrenComponent implements IComponent {
  static tag = 'three/object-3d-children'
  children: IEntity[]
}


