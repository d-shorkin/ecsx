import {Comparator} from "../Core/Comparator";
import {Euler, Matrix4, Quaternion, Vector3} from "three";
import {ComponentConstructor, IComponent, IEntity, Transform} from "../..";

export interface TransformDataItem {
  position: Vector3;
  scale: Vector3;
  euler: Euler;
  quaternion: Quaternion;
  matrix: Matrix4;
}

export interface TransformData {
  local: TransformDataItem;
  world: TransformDataItem;
}

export class TransformComparator extends Comparator<TransformData>{
  protected fuse: ComponentConstructor<IComponent>[] = [Transform];

  protected create(entity: IEntity): TransformData | null {
    return {
      local: {
        position: new Vector3(0,0,0),
        euler: new Euler(0,0,0),
        quaternion: new Quaternion(0,0,0,0),
        scale: new Vector3(1, 1, 1),
        matrix: new Matrix4()
      },
      world: {
        position: new Vector3(0,0,0),
        euler: new Euler(0,0,0),
        quaternion: new Quaternion(0,0,0,0),
        scale: new Vector3(1, 1, 1),
        matrix: new Matrix4()
      }
    };
  }

  protected update(entity: IEntity, obj: TransformData): TransformData | null {
    return obj;
  }

  protected destroy(entity: IEntity, obj: TransformData): void {
    // do nothing...
  }

}