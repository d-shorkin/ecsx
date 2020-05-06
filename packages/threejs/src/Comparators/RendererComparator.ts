import {WebGLRenderer, WebGLRendererParameters, Vector2} from "three";
import {Comparator, ComponentConstructor, IComponent, IEntity, Renderer} from "@ecsx/core";

export class ExtendsWebGLRenderer extends WebGLRenderer {
  currentDomContainer?: HTMLElement;
}

export class RendererComparator extends Comparator<ExtendsWebGLRenderer> {
  private options: WebGLRendererParameters;
  private size: Vector2 = new Vector2();
  protected fuse: ComponentConstructor<IComponent>[] = [Renderer];

  constructor(options: WebGLRendererParameters = {}) {
    super();
    this.options = {antialias: true, ...options};
  }

  protected create(entity: IEntity): ExtendsWebGLRenderer | null {
    const renderer = entity.getComponent(Renderer);

    const r = new ExtendsWebGLRenderer(this.options);

    if (renderer.container) {
      r.currentDomContainer = renderer.container;
      r.currentDomContainer.appendChild(r.domElement);
    }

    r.setSize(renderer.width, renderer.height);

    return r;
  }

  protected destroy(entity: IEntity, obj: ExtendsWebGLRenderer): void {
    if (obj.currentDomContainer) {
      obj.currentDomContainer.removeChild(obj.domElement);
    }
  }

  protected update(entity: IEntity, obj: ExtendsWebGLRenderer): ExtendsWebGLRenderer | null {

    const renderer = entity.getComponent(Renderer);

    if (obj.currentDomContainer !== renderer.container) {

      if (obj.currentDomContainer) {
        obj.currentDomContainer.removeChild(obj.domElement);
      }

      if (renderer.container) {
        renderer.container.appendChild(obj.domElement);
      }

      obj.currentDomContainer = renderer.container;
    }

    obj.getSize(this.size);
    if (this.size.x !== renderer.width || this.size.y !== renderer.height) {
      obj.setSize(renderer.width, renderer.height);
    }

    return obj;
  }
}