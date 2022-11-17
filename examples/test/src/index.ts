import {Engine} from "@ecsx/core";
import {
  RendererSizeSystem,
  RenderSystem,
  RendererComponent,
  SceneComponent,
  CameraComponent,
  RendererSizeComponent,
  Object3DSystem,
  MeshComponent,
  Object3DParentComponent, AutoGenerateObject3DSystem
} from "@ecsx/threejs";
import {BoxGeometry, Clock, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer} from "three";
/*const worker = new Worker(new URL('./deep-thought.ts', import.meta.url));
worker.postMessage({
  question:
    'The Answer to the Ultimate Question of Life, The Universe, and Everything.',
});
worker.onmessage = ({ data: { answer } }) => {
  console.log(answer);
};*/

const engine = new Engine()

const renderer = engine.createEntity();
renderer.setComponent(RendererComponent, {renderer: new WebGLRenderer()})
renderer.setComponent(RendererSizeComponent, {width: 600, height: 400})
renderer.setComponent(SceneComponent, {scene: new Scene()})
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer.setComponent(CameraComponent, {camera})
camera.position.z = 5


const cubeEntity = engine.createEntity();
const geometry = new BoxGeometry( 1, 1, 1 );
const material = new MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new Mesh( geometry, material );
cubeEntity.setComponent(MeshComponent, {mesh: cube})
cubeEntity.setComponent(Object3DParentComponent, {parent: renderer})

//engine.addSystem(new WindowRendererSizeSystem())
engine.addSystem(new RendererSizeSystem());
engine.addSystem(new AutoGenerateObject3DSystem())
engine.addSystem(new Object3DSystem())
engine.addSystem(new RenderSystem())

const clock = new Clock(true);

document.body.appendChild( renderer.getComponent(RendererComponent).renderer.domElement );

let fps = 0;

(function run() {
  requestAnimationFrame( run );
  fps += 1
  engine.update(clock.getDelta());
})()

setTimeout(() => {
  console.log(engine.getEntities())
}, 5000)

setTimeout(() => {
  cubeEntity.removeComponent(Object3DParentComponent)
}, 2000)

setTimeout(() => {
  cubeEntity.setComponent(Object3DParentComponent, {parent: renderer})
}, 2500)

setTimeout(() => {
  console.log((fps / 10))
}, 10000)

