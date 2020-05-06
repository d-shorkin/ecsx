import {Comparator, ComponentConstructor, IComponent, IEntity, Scene as SceneComponent} from "@ecsx/core";
import {Scene} from "three";

export class SceneComparator extends Comparator<Scene> {
  protected fuse: ComponentConstructor<IComponent>[] = [SceneComponent];

  protected create(entity: IEntity): Scene | null {
    return new Scene();
  }

  protected destroy(entity: IEntity, obj: Scene): void {
    // nothing...
  }

  protected update(entity: IEntity, obj: Scene): Scene | null {
    return obj;
  }
}