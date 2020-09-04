import {Comparator, ComponentConstructor, IComponent, IEntity} from "@ecsx/core";
import {Engine as EngineComponent} from "../Components/Engine";
import {Engine, IEngineDefinition} from "matter-js";

export class EngineComparator extends Comparator<Engine> {
  protected fuse: ComponentConstructor<IComponent>[] = [EngineComponent];
  private readonly options: IEngineDefinition;

  constructor(options: IEngineDefinition = {}) {
    super();
    this.options = options;
  }

  protected create(entity: IEntity): Engine | null {
    return Engine.create(this.options);
  }

  protected update(entity: IEntity, obj: Engine): Engine | null {
    return obj;
  }

  protected destroy(entity: IEntity, obj: Engine): void {
    // nothing...
  }
}