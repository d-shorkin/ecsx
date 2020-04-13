import {Component} from "../Core/Component";
import {Matrix4} from 'three/src/math/Matrix4';
import {Quaternion} from 'three/src/math/Quaternion';
import {Euler} from 'three/src/math/Euler';
import {Vector3} from 'three/src/math/Vector3';

export interface TransformData {
  positionX: number;
  positionY: number;
  positionZ: number;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
}

export interface TransformDataClear {
  position: Vector3;
  scale: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
}

export class Transform extends Component<TransformData> {
  static tag = 'core/transform';

  protected data: TransformData = {
    positionX: 0,
    positionY: 0,
    positionZ: 0,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    scaleX: 1,
    scaleY: 1,
    scaleZ: 1
  };

  private clearData: TransformDataClear = {
    position: new Vector3(),
    rotation: new Euler(),
    quaternion: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  };

  private worldData: TransformDataClear = {
    position: new Vector3(),
    rotation: new Euler(),
    quaternion: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  };

  private needsUpdateLocalMatrix: boolean = false;
  private needsUpdateQuaternion: boolean = false;
  private worldMatrixUpdated: boolean = false;

  private worldMatrix: Matrix4 = new Matrix4();
  private localMatrix: Matrix4 = new Matrix4();
  private commonMatrix: Matrix4 = new Matrix4();

  set<K extends keyof TransformData>(key: K, data: TransformData[K]): void {
    let changed = false;
    switch (key) {
      case "positionX":
        changed = this.setValuesHasChanges(this.clearData.position, 'x', data);
        break;
      case "positionY":
        changed = this.setValuesHasChanges(this.clearData.position, 'y', data);
        break;
      case "positionZ":
        changed = this.setValuesHasChanges(this.clearData.position, 'z', data);
        break;
      case "rotationX":
        if (changed = this.setValuesHasChanges(this.clearData.rotation, 'x', data)) {
          this.needsUpdateQuaternion = true;
        }
        break;
      case "rotationY":
        if (changed = this.setValuesHasChanges(this.clearData.rotation, 'y', data)) {
          this.needsUpdateQuaternion = true;
        }
        break;
      case "rotationZ":
        if (changed = this.setValuesHasChanges(this.clearData.rotation, 'z', data)) {
          this.needsUpdateQuaternion = true;
        }
        break;
      case "scaleX":
        changed = this.setValuesHasChanges(this.clearData.scale, 'x', data);
        break;
      case "scaleY":
        changed = this.setValuesHasChanges(this.clearData.scale, 'y', data);
        break;
      case "scaleZ":
        changed = this.setValuesHasChanges(this.clearData.scale, 'z', data);
        break;
    }

    if (changed) {
      this.needsUpdateLocalMatrix = true;
      super.set(key, data);
    }
  }

  getQuaternion(): Quaternion {
    if (this.needsUpdateQuaternion) {
      this.clearData.quaternion.setFromEuler(this.clearData.rotation);
      this.needsUpdateQuaternion = false;
    }
    return this.clearData.quaternion;
  }

  getEuler(): Euler {
    return this.clearData.rotation;
  }

  getWorld<K extends keyof TransformData>(key: K): TransformData[K] {
    this.updateMatrix();
    switch (key) {
      case "positionX":
        return this.worldData.position.x;
      case "positionY":
        return this.worldData.position.y;
      case "positionZ":
        return this.worldData.position.z;
      case "rotationX":
        return this.worldData.rotation.x;
      case "rotationY":
        return this.worldData.rotation.y;
      case "rotationZ":
        return this.worldData.rotation.z;
      case "scaleX":
        return this.worldData.scale.x;
      case "scaleY":
        return this.worldData.scale.y;
      case "scaleZ":
        return this.worldData.scale.z;
      default:
        throw new Error(`Wrong key ${key}`);
    }
  }

  _matrixHasUpdates(): boolean {
    return this.needsUpdateLocalMatrix || this.worldMatrixUpdated;
  }

  _getMatrix(): Matrix4 {
    this.updateMatrix();
    return this.commonMatrix;
  }

  _setWorldMatrix(matrix: Matrix4): void {
    this.worldMatrix.copy(matrix);
    this.worldMatrixUpdated = true;
  }

  private updateMatrix(): void {
    if (this.needsUpdateLocalMatrix) {
      this.localMatrix.compose(this.clearData.position, this.getQuaternion(), this.clearData.scale);
    }

    if (this._matrixHasUpdates()) {
      this.commonMatrix.identity().multiplyMatrices(this.worldMatrix, this.localMatrix);
      this.commonMatrix.decompose(this.worldData.position, this.worldData.quaternion, this.worldData.scale);
      this.worldData.rotation.setFromQuaternion(this.worldData.quaternion);
    }

    this.needsUpdateLocalMatrix = false;
    this.worldMatrixUpdated = false;
  }

  private setValuesHasChanges<T extends object, K extends keyof T>(obj: T, key: K, value: T[K]): boolean {
    if (obj[key] !== value) {
      obj[key] = value;
      return true;
    }
    return false;
  }
}
