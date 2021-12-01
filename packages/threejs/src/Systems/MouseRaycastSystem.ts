import {IEngine, IEntityCollection, ISystem} from "@ecsx/core";
import {Camera, Object3D, Raycast, Renderer, Scene} from "../Components";
import * as THREE from "three";

export class MouseRaycastSystem implements ISystem{
  private renderers: IEntityCollection;
  private raycaster: THREE.Raycaster;
  private objects: IEntityCollection;

  onAttach(engine: IEngine): void {
    this.raycaster = new THREE.Raycaster();
    this.renderers = engine.createFamily(Renderer, Scene, Camera);
    this.objects = engine.createFamily(Object3D);
    this.renderers.getEntities().forEach(e => {
      e.getComponent(Renderer).renderer.domElement.onclick = event => {
        const {offsetWidth, offsetHeight} = e.getComponent(Renderer).renderer.domElement;
        const cords = {
          x: event.offsetX / offsetWidth * 2 - 1,
          y: - event.offsetY / offsetHeight * 2 + 1
        };
        this.raycaster.setFromCamera(cords, e.getComponent(Camera).camera);
        const intersects = this.raycaster.intersectObjects(this.objects.getEntities().map(e => e.getComponent(Object3D).object3D), true);
        e.setComponent(Raycast, {entities: this.objects.getEntities().filter(e => !!intersects.find(i => i.object === e.getComponent(Object3D).object3D))});
      }
    })
  }

  execute(engine: IEngine, delta: number): void {
  }
}