import {IEngine, IFamily, ISystem} from "../Core/Contract";
import {CameraAutoAspect, Renderer} from "../Components";

export class CameraAutoAspectSystem implements ISystem{
  private renderers: IFamily;

  onAttach(engine: IEngine): void {
    this.renderers = engine.createFamily(Renderer)
  }

  execute(engine: IEngine, delta: number): void {
    this.renderers.getEntities().forEach(e => e.getComponent(Renderer).items.forEach((({camera}) => {
      if(camera.getEntity().hasComponent(CameraAutoAspect)){
        camera.set('aspect', e.getComponent(Renderer).width / e.getComponent(Renderer).height)
      }
    })));
  }

}