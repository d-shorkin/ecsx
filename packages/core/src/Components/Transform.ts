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

export interface ITransformProperties {
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

export class Transform extends Component implements ITransformProperties {
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

  /*set<K extends keyof this>(key: K, data: this[K]): void {
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
      default:
        this.throwKeyError(key as string);
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

  getWorld<K extends keyof ITransformProperties>(key: K): Transform[K] {
    this.updateMatrix();
    if (this.unitedTransform) {
      return this.unitedTransform[key];
    }
    throw new Error('cannot find world transform')
  }

  setWorld<K extends keyof ITransformProperties>(key: K, value: ITransformProperties[K]): void {
    this.updateWorldInverseMatrix();

    switch (key) {
      case "rotationX":
        if(!this.compareChange(this.unitedTransform, 'positionX', value)) return;
        this.unitedData.rotation.x = value;
        this.unitedData.quaternion.setFromEuler(this.unitedData.rotation);
        break;
      case "rotationY":
        if(!this.compareChange(this.unitedTransform, 'rotationY', value)) return;
        this.unitedData.rotation.y = value;
        this.unitedData.quaternion.setFromEuler(this.unitedData.rotation);
        break;
      case "rotationZ":
        if(!this.compareChange(this.unitedTransform, 'rotationZ', value)) return;
        this.unitedData.rotation.z = value;
        this.unitedData.quaternion.setFromEuler(this.unitedData.rotation);
        break;
      case "positionX":
        if(!this.compareChange(this.unitedTransform, 'positionX', value)) return;
        this.unitedData.position.x = value;
        break;
      case "positionY":
        if(!this.compareChange(this.unitedTransform, 'positionY', value)) return;
        this.unitedData.position.y = value;
        break;
      case "positionZ":
        if(!this.compareChange(this.unitedTransform, 'positionZ', value)) return;
        this.unitedData.position.z = value;
        break;
      case "scaleX":
        if(!this.compareChange(this.unitedTransform, 'scaleX', value)) return;
        this.unitedData.scale.x = value;
        break;
      case "scaleY":
        if(!this.compareChange(this.unitedTransform, 'scaleY', value)) return;
        this.unitedData.scale.y = value;
        break;
      case "scaleZ":
        if(!this.compareChange(this.unitedTransform, 'scaleZ', value)) return;
        this.unitedData.scale.z = value;
        break;
      default:
        this.throwKeyError(key);
    }

    this.unitedMatrix.compose(this.unitedData.position, this.unitedData.quaternion, this.unitedData.scale);

    this.localMatrix.multiplyMatrices(this.unitedMatrix, this.inverseWorldMatrix);
    this.localMatrix.decompose(this.clearData.position, this.clearData.quaternion, this.clearData.scale);
    this.clearData.rotation.setFromQuaternion(this.clearData.quaternion);

    this.positionX = this.clearData.position.x;
    this.positionY = this.clearData.position.y;
    this.positionZ = this.clearData.position.z;
    this.rotationX = this.clearData.rotation.x;
    this.rotationY = this.clearData.rotation.y;
    this.rotationZ = this.clearData.rotation.z;
    this.scaleX = this.clearData.scale.x;
    this.scaleY = this.clearData.scale.y;
    this.scaleZ = this.clearData.scale.z;

    this.unitedMatrixUpdated = true;


    // TODO: set update flag to true
  }

  _hasLocalUpdate(): boolean {
    return this.needsUpdateLocalMatrix || this.unitedMatrixUpdated;
  }

  _getMatrix(): Matrix4 {
    this.updateMatrix();
    return this.unitedMatrix;
  }

  _setWorldMatrix(matrix: Matrix4): void {
    this.worldMatrix.copy(matrix);
    this.worldMatrixUpdated = true;
  }

  private updateMatrix(): void {
    if (this.needsUpdateLocalMatrix) {
      this.localMatrix.compose(this.clearData.position, this.getQuaternion(), this.clearData.scale);
    }

    if (this.needsUpdateLocalMatrix || this.worldMatrixUpdated) {
      this.unitedMatrix.identity().multiplyMatrices(this.worldMatrix, this.localMatrix);
      this.unitedMatrix.decompose(this.unitedData.position, this.unitedData.quaternion, this.unitedData.scale);
      this.unitedData.rotation.setFromQuaternion(this.unitedData.quaternion);

      this.unitedTransform.positionX = this.unitedData.position.x;
      this.unitedTransform.positionY = this.unitedData.position.y;
      this.unitedTransform.positionZ = this.unitedData.position.z;
      this.unitedTransform.rotationX = this.unitedData.rotation.x;
      this.unitedTransform.rotationY = this.unitedData.rotation.y;
      this.unitedTransform.rotationZ = this.unitedData.rotation.z;
      this.unitedTransform.scaleX = this.unitedData.scale.x;
      this.unitedTransform.scaleY = this.unitedData.scale.y;
      this.unitedTransform.scaleZ = this.unitedData.scale.z;

      this.needsUpdateWorldInverseMatrix = true;
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

  private updateWorldInverseMatrix() {
    this.updateMatrix();
    if (this.needsUpdateWorldInverseMatrix) {
      this.inverseWorldMatrix.getInverse(this.worldMatrix);
    }
  }

  private throwKeyError(key: string): void {
    const keys = Object.keys(this.unitedTransform).map(k => `"${k}"`).join(', ');
    throw new Error(`Wrong key ${key} for transform you can use only ${keys} for transform`);
  }

  private compareChange<T extends object, K extends keyof T>(object: T, key: K, value: T[K]): boolean {
    if(object[key] !== value){
      object[key] = value;
      return true
    }

    return false;
  }
  */
}

export class WorldTransform extends Transform {

}
