import {Component} from "../Core/Component";
import {IVector4} from "../Contract/Common";

export class Camera extends Component {
  perspective: boolean = true;
  aspect: number = 1;
  near: number = .1;
  far: number = 2000;
  fov: number = 50;
  viewPort?: IVector4;
}

export class CameraAutoAspect extends Component {

}