import {Engine} from "@ecsx/core";
import {
  RendererSetSizeSystem,
  RenderSystem,
  RendererComponent,
  SceneComponent,
  CameraComponent,
  RendererSetSizeAction,
  MeshComponent,
  AutoGenerateObject3DSystem,
  IsMainRendererTag,
  Object3DReactSystem,
  Object3DParentComponent
} from "@ecsx/threejs";
import {BoxGeometry, Clock, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer} from "three";
import Stats from "stats.js"
import {
  CircleMoveComponent,
  CircleMoveSystem,
  PivotComponent,
  PositionComponent,
  PositionThreeSystem
} from "./Movement";

function randomInRange(min: number, max: number) {
  return Math.random() < 0.5 ? ((1-Math.random()) * (max-min) + min) : (Math.random() * (max-min) + min);
}

const engine = new Engine()
engine.addSystem(new CircleMoveSystem());
engine.addSystem(new PositionThreeSystem());
//engine.addSystem(new WindowRendererSizeSystem())
engine.addSystem(new RendererSetSizeSystem());
engine.addSystem(new AutoGenerateObject3DSystem())
engine.addSystem(new Object3DReactSystem())
engine.addSystem(new RenderSystem())

// Scene
const scene = engine.createEntity();
scene.setComponent(SceneComponent, {scene: new Scene()})

// Camera
const camera = engine.createEntity();
camera.setComponent(CameraComponent, {camera:  new PerspectiveCamera(75, 1200 / 800, 0.1, 1000)})
camera.setComponent(PositionComponent, {x: 0, y: 0, z: 10})

// Renderer
const renderer = engine.createEntity();
renderer.setComponent(RendererComponent, {renderer: new WebGLRenderer(), camera, scene})
renderer.setComponent(IsMainRendererTag, {})
renderer.setAction(RendererSetSizeAction, {width: 1200, height: 800})

const clock = new Clock(true);

document.body.appendChild( renderer.getComponent(RendererComponent).renderer.domElement );
var stats = new Stats();
stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild( stats.dom );

let btn = document.createElement("button");
btn.innerHTML = "add some cubes";
let times = 1
let result = 0
btn.addEventListener("click", () => {
  const add = Math.pow(2, times);
  for (let i = 0; i < add; i++) {
    const cubeEntity = engine.createEntity();
    const geometry = new BoxGeometry( randomInRange(.1, .2), randomInRange(.1, .2), randomInRange(.1, .2) );
    const material = new MeshBasicMaterial( { color: 0x00ff00 } )
    const cube = new Mesh( geometry, material )
    cubeEntity.setComponent(MeshComponent, {mesh: cube})
    cubeEntity.setComponent(Object3DParentComponent, {parent: scene})
    cubeEntity.setComponent(PositionComponent, {x: randomInRange(-1, 1), y: randomInRange(-1, 1), z: randomInRange(-1, 1)})
    cubeEntity.setComponent(CircleMoveComponent, {speed: randomInRange(-3, 3)})
    cubeEntity.setComponent(PivotComponent, {x: randomInRange(-2, 2), y: randomInRange(-2, 2), z: randomInRange(-2, 2)})

  }
  result += add;
  console.log(result)
  times ++;
})
document.body.appendChild(btn);

(function run() {
  stats.begin();
  engine.update(clock.getDelta());
  stats.end();
  requestAnimationFrame( run );
})()

