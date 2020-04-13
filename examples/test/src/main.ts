import * as THREE from 'three';
import {Container, ContainerSystem, Engine, Entity, Transform} from "@ecsx/core";
import {ThreeJsObject, ThreeJsRenderingSystem} from "@ecsx/threejs";

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.querySelector('#content')!.appendChild(renderer.domElement);

camera.position.z = 10;

const ecs = new Engine();

const mesh = new Entity();
mesh.addComponent(ThreeJsObject);
mesh.addComponent(Transform);

const floor = new Entity();
floor.addComponent(ThreeJsObject);
floor.addComponent(Transform);
floor.getComponent(Transform).set("positionY", -3);
floor.getComponent(Transform).set("scaleX", 2);
floor.getComponent(Transform).set("scaleZ", 3);
floor.getComponent(Transform).set("scaleY", .3);

const container = new Entity();
container.addComponent(Container).set("children", [mesh]);
container.addComponent(Transform);

ecs.addEntity(container);
ecs.addEntity(floor);
ecs.addEntity(mesh);

ecs.addSystem(new ContainerSystem());
ecs.addSystem(new ThreeJsRenderingSystem(scene));
mesh.getComponent(Transform).set("positionY", 1);

container.getComponent(Transform).set("positionY", -1);

let i = 0;

const animate = function () {
  requestAnimationFrame(animate);

  i += .01;

  //container.getComponent(Transform).set("scaleZ", Math.sin(i));
  container.getComponent(Transform).set("rotationZ", Math.sin(i * 5) * .3);
  container.getComponent(Transform).set("rotationY", i * 3);
  //mesh.getComponent(Transform).set("rotationX", mesh.getComponent(Transform).get("rotationX") + .01);
  mesh.getComponent(Transform).set("rotationY", mesh.getComponent(Transform).get("rotationY") + .05);
  //container.getComponent(Transform).set("rotationY", container.getComponent(Transform).get("rotationY") + .01);

  ecs.update(1);

  renderer.render(scene, camera);
};

animate();