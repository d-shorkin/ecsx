import {Component, Renderer as CoreRenderer} from "@ecsx/core";
import {WebGLRenderer, WebGLRendererParameters, Vector2} from "three";

export class ThreeRenderer extends Component {
  private renderer?: WebGLRenderer;
  private container?: HTMLElement;
  private options: WebGLRendererParameters = {antialias: true};
  private size: Vector2 = new Vector2();

  getRenderer(): WebGLRenderer | null {
    if (!this.getEntity().hasComponent(CoreRenderer)) {
      this.getEntity().removeComponent(ThreeRenderer);
      return null;
    }

    const component = this.getEntity().getComponent(CoreRenderer);

    if (!this.renderer) {
      this.renderer = new WebGLRenderer()
    }

    if (this.container !== component.container) {
      if (this.container) {
        this.container.removeChild(this.renderer.domElement);
      }
      if (component.container) {
        component.container.appendChild(this.renderer.domElement);
      }
      this.container = component.container;
    }

    this.renderer.getSize(this.size);
    if (this.size.x !== component.width || this.size.y !== component.height) {
      this.renderer.setSize(component.width, component.height);
    }

    return this.renderer;
  }

  setOptions(options: WebGLRendererParameters) {
    this.options = options;
    if (this.renderer && this.container) {
      this.container.removeChild(this.renderer.domElement);
    }

    delete this.renderer;
    delete this.container;
  }


  destroy(): void {
    if(this.container && this.renderer){
      this.container.removeChild(this.renderer.domElement)
    }
  }
}