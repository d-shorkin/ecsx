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
  CameraAutoAspect, CameraAutoAspectSystem
} from "@ecsx/core";
import {RendererSystem, MeshSystem, Mesh} from "@ecsx/threejs";
import {BoxBufferGeometry, MeshBasicMaterial, MeshNormalMaterial} from "three";

const ecs = new Engine();

const mesh = new Entity();
mesh.addComponent(Mesh).set('geometry', new BoxBufferGeometry( 1, 1, 1 ));
mesh.getComponent(Mesh).set('material', new MeshNormalMaterial(  ));
mesh.addComponent(Transform);
mesh.getComponent(Transform).set("positionY", 1);

const floor = new Entity();
floor.addComponent(Mesh).set('geometry', new BoxBufferGeometry( 1, 1, 1 ));
floor.getComponent(Mesh).set('material', new MeshBasicMaterial( { color: 0xffaa00 } ));
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
scene.addComponent(Container).set('children', [container, floor]);

const renderer = new Entity();
renderer.addComponent(Renderer).set('container', document.getElementById('content')!);
renderer.getComponent(Renderer).set('items', [{
  scene: scene.getComponent(Scene),
  camera: camera.getComponent(Camera)
}]);

ecs.addEntity(renderer);
ecs.addEntity(camera);
ecs.addEntity(scene);
ecs.addEntity(container);
ecs.addEntity(floor);
ecs.addEntity(mesh);

ecs.addSystem(new ContainerSystem());
ecs.addSystem(new SceneSystem());
ecs.addSystem(new CameraAutoAspectSystem());
ecs.addSystem(new RendererSystem());
ecs.addSystem(new MeshSystem());

let i = 0;

const animate = function () {
  requestAnimationFrame(animate);

  i += .01;

  //container.getComponent(Transform).set("scaleZ", Math.sin(i));
  container.getComponent(Transform).set("rotationZ", Math.sin(i * 5) * .2);
  container.getComponent(Transform).set("rotationY", i * 3);
  //mesh.getComponent(Transform).set("rotationX", mesh.getComponent(Transform).get("rotationX") + .01);
  mesh.getComponent(Transform).set("rotationY", mesh.getComponent(Transform).rotationY + .03);
  //container.getComponent(Transform).set("rotationY", container.getComponent(Transform).get("rotationY") + .01);

  ecs.update(1);
};

animate();