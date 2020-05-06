import {IVector2} from "../Contract/Common";
import {Component} from "../Core/Component";
import {Transform} from "./Transform";
import {Matrix4} from "three";

export class Collider2d extends Component {
  vertices: IVector2[][] = [];

  private worldMatrix: Matrix4 = new Matrix4();
  private world?: IVector2[][] = [];

  getWorld(): this['vertices'] {
    if (!this.getEntity().hasComponent(Transform)) {
      return this.vertices;
    }

    const transform = this.getEntity().getComponent(Transform);

    if (!this.world || !transform._getMatrix().equals(this.worldMatrix)) {
      this.world = this.recalculateWorld(transform._getMatrix());
    }

    return this.world;
  }

  set<K extends keyof this>(key: K, data: this[K]): void {
    super.set(key, data);

    if (key === "vertices") {
      this.world = this.recalculateWorld(this.worldMatrix);
    }
  }

  private recalculateWorld(matrix: Matrix4): IVector2[][] {
    const m = matrix.elements;

    const world = this.vertices.map(part => part.map(({x, y}) => ({
      x: m[0] * x + m[4] * y + m[8],
      y: m[1] * x + m[5] * y + m[9]
    })));

    this.worldMatrix.copy(matrix);

    return world;
  }
}