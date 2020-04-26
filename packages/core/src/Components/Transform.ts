import {Component} from "../Core/Component";
import {Matrix4} from 'three/src/math/Matrix4';
import {Quaternion} from 'three/src/math/Quaternion';
import {Euler} from 'three/src/math/Euler';
import {Vector3} from 'three/src/math/Vector3';

export interface TransformDataClear {
  position: Vector3;
  scale: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
}

export class Transform extends Component {
  static tag = 'core/transform';

  positionX: number = 0;
  positionY: number = 0;
  positionZ: number = 0;
  rotationX: number = 0;
  rotationY: number = 0;
  rotationZ: number = 0;
  scaleX: number = 1;
  scaleY: number = 1;
  scaleZ: number = 1;

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

  private worldTransform?: Transform;

  private needsUpdateLocalMatrix: boolean = false;
  private needsUpdateQuaternion: boolean = false;
  private worldMatrixUpdated: boolean = false;

  private worldMatrix: Matrix4 = new Matrix4();
  private localMatrix: Matrix4 = new Matrix4();
  private commonMatrix: Matrix4 = new Matrix4();

  set<K extends keyof this>(key: K, data: this[K]): void {
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

  getWorld<K extends keyof Transform>(key: K): Transform[K] {
    this.updateMatrix();
    if(this.worldTransform){
      return this.worldTransform[key];
    }
    throw new Error('cannot find world transform')
  }

  _hasLocalUpdate(): boolean {
    return this.needsUpdateLocalMatrix;
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

    if (this._hasLocalUpdate() || this.worldMatrixUpdated) {
      this.commonMatrix.identity().multiplyMatrices(this.worldMatrix, this.localMatrix);
      this.commonMatrix.decompose(this.worldData.position, this.worldData.quaternion, this.worldData.scale);
      this.worldData.rotation.setFromQuaternion(this.worldData.quaternion);

      if(!this.worldTransform){
        this.worldTransform = new Transform()
      }

      this.worldTransform.positionX = this.worldData.position.x;
      this.worldTransform.positionY = this.worldData.position.y;
      this.worldTransform.positionZ = this.worldData.position.z;
      this.worldTransform.rotationX = this.worldData.rotation.x;
      this.worldTransform.rotationY = this.worldData.rotation.y;
      this.worldTransform.rotationZ = this.worldData.rotation.z;
      this.worldTransform.scaleX = this.worldData.scale.x;
      this.worldTransform.scaleY = this.worldData.scale.y;
      this.worldTransform.scaleZ = this.worldData.scale.z;
    }

    this.needsUpdateLocalMatrix = false;
    this.worldMatrixUpdated = false;
  }

  private setValuesHasChanges<T extends object, K extends keyof T>(obj: T, key: K, value: any): boolean {
    if (obj[key] !== value) {
      obj[key] = value;
      return true;
    }
    return false;
  }
}
