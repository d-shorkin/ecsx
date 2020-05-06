import {
  IEngine,
  IEntity,
  IFamily, IRepository,
  ISystem, NullFamily, Renderer,
  Renderer as RendererComponent,
} from "@ecsx/core";
import {Renderer as IRenderer, Scene, Camera} from "three";


export class RendererSystem implements ISystem {
  private renderers: IFamily = NullFamily;
  private renderersRepository: IRepository<IRenderer>;
  private sceneRepository: IRepository<Scene>;
  private cameraRepository: IRepository<Camera>;

  constructor(
    renderersRepository: IRepository<IRenderer>,
    sceneRepository: IRepository<Scene>,
    cameraRepository: IRepository<Camera>
  ) {
    this.renderersRepository = renderersRepository;
    this.sceneRepository = sceneRepository;
    this.cameraRepository = cameraRepository;
  }

  onAttach(engine: IEngine): void {
    this.renderers = engine.createFamily(Renderer);
  }

  execute(engine: IEngine, delta: number): void {
    this.renderers.getEntities().forEach((entity: IEntity) => {
      if (!this.renderersRepository.hasBy(entity)) {
        return;
      }

      const renderer = this.renderersRepository.getBy(entity);

      entity.getComponent(RendererComponent).items.forEach(({camera, scene}) => {
        if(!this.cameraRepository.hasBy(camera) || !this.sceneRepository.hasBy(scene)){
          return;
        }

        renderer.render(this.sceneRepository.getBy(scene), this.cameraRepository.getBy(camera));
      });
    });
  }
}

