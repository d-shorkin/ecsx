import {
  Camera,
  Container,
  ContainerSystem,
  Engine,
  Entity,
  Renderer,
  Scene,
  Transform,
  SceneSystem,
  CameraAutoAspect, CameraAutoAspectSystem, Collider2d, CompareSystem, CompositeRepository,
  AutoEngineAddSystem
} from "@ecsx/core";
import {
  RendererSystem,
  Mesh,
  CameraComparator,
  RendererComparator,
  SceneComparator,
  MeshComparator,
  CameraRepository,
  Object3dTransformSystem,
  MeshRepository,
  Colliders2dDebugSystem,
  Collider2dComparator
} from "@ecsx/threejs";
import {BoxBufferGeometry, MeshBasicMaterial, MeshNormalMaterial, Object3D} from "three";

const ecs = new Engine();

const mesh = new Entity();
mesh.addComponent(Mesh).set('geometry', new BoxBufferGeometry(1, 1, 1));
mesh.getComponent(Mesh).set('material', new MeshNormalMaterial());
mesh.addComponent(Collider2d).set('vertices', [[{x: -1, y: -1}, {x: 1, y: -1}, {x: 1.2, y: 0}, {x: 1, y: 1}, {
  x: -1,
  y: 1
}, {x: -1.2, y: 0}, {x: -1, y: -1}]]);
mesh.addComponent(Transform);
mesh.getComponent(Transform).set("positionY", 1);

const floor = new Entity();
floor.addComponent(Mesh).set('geometry', new BoxBufferGeometry(1, 1, 1));
floor.getComponent(Mesh).set('material', new MeshBasicMaterial({color: 0xffaa00}));
floor.addComponent(Transform);
floor.getComponent(Transform).set("positionY", -2);
floor.getComponent(Transform).set("scaleX", 2);
floor.getComponent(Transform).set("scaleZ", 3);
floor.getComponent(Transform).set("scaleY", .3);

const container = new Entity();
container.addComponent(Container).set("children", [mesh]);
container.addComponent(Transform);

const camera = new Entity();
camera.addComponent(Camera).set('aspect', 3);
camera.addComponent(Transform).set("positionZ", 10);
camera.addComponent(CameraAutoAspect);

const scene = new Entity();
scene.addComponent(Scene);
scene.addComponent(Transform);
scene.addComponent(Container).set('children', [container, floor]);

const renderer = new Entity();
renderer.addComponent(Renderer).set('container', document.getElementById('content')!);
renderer.getComponent(Renderer).set('items', [{
  scene: scene,
  camera: camera
}]);

ecs.addEntity(renderer);
ecs.addEntity(camera);
ecs.addEntity(scene);

const threeRendererComparator = new RendererComparator();
const threeSceneComparator = new SceneComparator();
const threeCameraComparator = new CameraComparator();
const threeMeshComparator = new MeshComparator(threeSceneComparator);
const threeCollider2dComparator = new Collider2dComparator(threeSceneComparator);

const threeCameraRepository = new CameraRepository(threeCameraComparator);
const threeMeshRepository = new MeshRepository(threeMeshComparator);
const objects3dRepository = new CompositeRepository<Object3D>(threeCameraRepository, threeSceneComparator, threeMeshRepository);

ecs.addSystem(new CompareSystem(threeRendererComparator, Renderer));
ecs.addSystem(new CompareSystem(threeSceneComparator, Scene));
ecs.addSystem(new CompareSystem(threeCameraComparator, Camera));
ecs.addSystem(new CompareSystem(threeMeshComparator, Mesh));
ecs.addSystem(new CompareSystem(threeCollider2dComparator, Collider2d));
ecs.addSystem(new AutoEngineAddSystem());
ecs.addSystem(new ContainerSystem());
ecs.addSystem(new SceneSystem());
ecs.addSystem(new CameraAutoAspectSystem());
ecs.addSystem(new Colliders2dDebugSystem(threeCollider2dComparator, 0));
ecs.addSystem(new Object3dTransformSystem(objects3dRepository));
ecs.addSystem(new RendererSystem(threeRendererComparator, threeSceneComparator, threeCameraRepository));

(function animate() {
  requestAnimationFrame(animate);
  ecs.update(1);
})();