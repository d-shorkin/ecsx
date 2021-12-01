import {Engine} from "@ecsx/core";
import * as THREE from 'three';
import {RendererSystem, Camera, Renderer, Scene, Object3D, ParentObject3D, MouseRaycastSystem} from "@ecsx/threejs";
import {ServerSystem} from "./systems/ServerSystem";
import {RenderSystem as RenderSystemLocal} from "./systems/RenderSystem";
import {ElementsState} from "./logic/ElementsState";
import {ChangesSystem} from "./systems/ChangesSystem";

const engine = new Engine();

const aspect = window.innerWidth / window.innerHeight;

const rendererEntity = engine.createNextEntity();
rendererEntity.setComponent(Renderer, {renderer: new THREE.WebGLRenderer()});
const scene = new THREE.Scene();
rendererEntity.setComponent(Scene, {scene: scene});
rendererEntity.setComponent(Camera, {camera: new THREE.OrthographicCamera(-5 * aspect, 5 * aspect, 5, -5, .1, 100)});
rendererEntity.getComponent(Renderer).renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('content')!.appendChild(rendererEntity.getComponent(Renderer).renderer.domElement);

rendererEntity.getComponent(Camera).camera.position.z = 10;

engine.addEntity(rendererEntity);

// Grid
const gridEntity = engine.createNextEntity();
gridEntity.setComponent(Object3D, {object3D: new THREE.GridHelper(30, 30)});
gridEntity.setComponent(ParentObject3D, {object3D: scene});
engine.addEntity(gridEntity);

gridEntity.getComponent(Object3D).object3D.rotation.x = .5 * Math.PI;

// Systems

const state = new ElementsState(11, 7);

engine.addSystem(new ServerSystem(state));
engine.addSystem(new ChangesSystem());
engine.addSystem(new RenderSystemLocal(state));
engine.addSystem(new RendererSystem());
engine.addSystem(new MouseRaycastSystem());

const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  engine.update(clock.getDelta());
})();