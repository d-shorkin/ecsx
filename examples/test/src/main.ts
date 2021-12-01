import {Engine} from "@ecsx/core";
import * as THREE from 'three';
import {Camera, Object3D, ParentObject3D, Renderer, RendererSystem, Scene} from "@ecsx/threejs";
import {ShipRendererSystem} from "./systems/ShipRendererSystem";
import {
  ActiveCannons,
  MovementAcceleration, MovementAngularAcceleration,
  MovementMaxAngularSpeed,
  MovementMaxSpeed,
  Player,
  PlayerCamera,
  Ship
} from "./components";
import {BasicBody} from "./ship/bodies/BasicBody";
import {CannonsRenderSystem} from "./systems/CannonsRenderSystem";
import {RemovedShipCannonsRemoveSystem} from "./systems/RemovedShipCannonsRemoveSystem";
import {CannonsDestroySystem} from "./systems/CannonsDestroySystem";
import {CannonsBuildSystem} from "./systems/CannonsBuildSystem";
import {CannonsIdleSystem} from "./systems/CannonsIdleSystem";
import {CannonsShotSystem} from "./systems/CannonsShotSystem";
import * as ECSMATTER from "@ecsx/matterjs"
import * as Matter from "matter-js";
import {Object3dMatterPhysicsSystem} from "./systems/Object3dMatterPhysicsSystem";
import {PlayerCameraViewSystem} from "./systems/PlayerCameraViewSystem";
import {MovementInputSystem} from "./systems/MovementInputSystem";
import {MovementSystem} from "./systems/MovementSystem";
import {MovementDecreaseAngularVelocitySystem} from "./systems/MovementDecreaseAngularVelocitySystem";
import {MovementLimitSystem} from "./systems/MovementLimitSystem";
import {MovementDecreaseVelocitySystem} from "./systems/MovementDecreaseVelocitySystem";

const engine = new Engine();

const rendererEntity = engine.createNextEntity();
rendererEntity.setComponent(Renderer, {renderer: new THREE.WebGLRenderer()});
const scene = new THREE.Scene();
rendererEntity.setComponent(Scene, {scene: scene});
rendererEntity.setComponent(Camera, {camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)});
rendererEntity.getComponent(Renderer).renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('content')!.appendChild(rendererEntity.getComponent(Renderer).renderer.domElement);
rendererEntity.setComponent(PlayerCamera, {zoom: 6, lerp: .2});
const physics = Matter.Engine.create();
physics.world.gravity.y = 0;
rendererEntity.setComponent(ECSMATTER.Engine, {engine: physics});

engine.addEntity(rendererEntity);

// Test ship
const shipEntity = engine.createNextEntity();
shipEntity.setComponent(Player, {});
shipEntity.setComponent(Ship, {body: new BasicBody()});
shipEntity.setComponent(ParentObject3D, {object3D: scene});
shipEntity.setComponent(ActiveCannons, {activeCannonsHooks: ['cannon-0', 'cannon-1']});
shipEntity.setComponent(ECSMATTER.Body, {
  body: Matter.Bodies.circle(0, 0, 50, {frictionAir: 0, mass: 1}),
  engine: rendererEntity
});
shipEntity.setComponent(MovementMaxSpeed, {maxSpeed: 3});
shipEntity.setComponent(MovementAcceleration, {acceleration: 1});
shipEntity.setComponent(MovementMaxAngularSpeed, {maxAngularSpeed: .07});
shipEntity.setComponent(MovementAngularAcceleration, {angularAcceleration: .03});
engine.addEntity(shipEntity);

let counter = 0;
setInterval(() => {
  counter++;
  if (counter % 2) {
    shipEntity.setComponent(MovementMaxSpeed, {maxSpeed: 10});
    shipEntity.setComponent(MovementAcceleration, {acceleration: 20});
    shipEntity.setComponent(MovementAngularAcceleration, {angularAcceleration: .45});
  } else {
    shipEntity.setComponent(MovementMaxSpeed, {maxSpeed: 3});
    shipEntity.setComponent(MovementAcceleration, {acceleration: 1});
    shipEntity.setComponent(MovementAngularAcceleration, {angularAcceleration: .03});
  }
}, 10000);

// Physics

const ship2Entity = engine.createNextEntity();
ship2Entity.setComponent(Ship, {body: new BasicBody()});
ship2Entity.setComponent(ParentObject3D, {object3D: scene});
ship2Entity.setComponent(ECSMATTER.Body, {
  body: Matter.Bodies.rectangle(10, -100, 50, 50),
  engine: rendererEntity
});
engine.addEntity(ship2Entity);

// Light
const ambientLightEntity = engine.createNextEntity();
ambientLightEntity.setComponent(Object3D, {object3D: new THREE.AmbientLight(0x404040)});
ambientLightEntity.setComponent(ParentObject3D, {object3D: scene});
engine.addEntity(ambientLightEntity);

const hemisphereLightEntity = engine.createNextEntity();
hemisphereLightEntity.setComponent(Object3D, {object3D: new THREE.HemisphereLight(0xffffbb, 0x080820, 1)});
hemisphereLightEntity.setComponent(ParentObject3D, {object3D: scene});
engine.addEntity(hemisphereLightEntity);

// Grid
const gridEntity = engine.createNextEntity();
gridEntity.setComponent(Object3D, {object3D: new THREE.GridHelper(1000, 500)});
gridEntity.setComponent(ParentObject3D, {object3D: scene});
engine.addEntity(gridEntity);

// Systems
engine.addSystem(new MovementInputSystem());
engine.addSystem(new MovementDecreaseVelocitySystem());
engine.addSystem(new MovementDecreaseAngularVelocitySystem());
engine.addSystem(new MovementSystem());
engine.addSystem(new MovementLimitSystem());
engine.addSystem(new CannonsIdleSystem());
engine.addSystem(new CannonsBuildSystem());
engine.addSystem(new CannonsDestroySystem());
engine.addSystem(new CannonsShotSystem());
engine.addSystem(new ShipRendererSystem());
engine.addSystem(new RemovedShipCannonsRemoveSystem());
engine.addSystem(new CannonsRenderSystem());
engine.addSystem(new PlayerCameraViewSystem());
engine.addSystem(new ECSMATTER.BodySystem());
engine.addSystem(new ECSMATTER.EngineSystem());
engine.addSystem(new Object3dMatterPhysicsSystem());
engine.addSystem(new RendererSystem());

const clock = new THREE.Clock();
(function animate() {
  requestAnimationFrame(animate);
  engine.update(clock.getDelta());
})();

const ws = new WebSocket('ws://localhost:8080/');
ws.addEventListener('open', () => {
  ws.send('something');
});