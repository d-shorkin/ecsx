import {Component, Camera as CoreCamera} from "@ecsx/core";
import {PerspectiveCamera, OrthographicCamera, Camera} from "three";

export class ThreeCamera extends Component {
  private perspectiveCamera?: PerspectiveCamera;
  private orthographicCamera?: OrthographicCamera;

  getCamera(): Camera | null {
    if (!this.getEntity().hasComponent(CoreCamera)) {
      this.getEntity().removeComponent(ThreeCamera);
      return null;
    }

    const component = this.getEntity().getComponent(CoreCamera);
    this.createCameras(component);

    if (component.hasAnyUpdates('perspective', 'fov', 'near', 'aspect', 'far')) {
      if (component.perspective) {
        this.perspectiveCamera!.fov = component.fov;
        this.perspectiveCamera!.aspect = component.aspect;
        this.perspectiveCamera!.near = component.near;
        this.perspectiveCamera!.far = component.far;
        this.perspectiveCamera!.updateProjectionMatrix();
      } else {
        this.orthographicCamera!.left = component.fov * component.aspect / -2;
        this.orthographicCamera!.right = component.fov * component.aspect / 2;
        this.orthographicCamera!.top = component.fov / 2;
        this.orthographicCamera!.bottom = component.fov / -2;
        this.orthographicCamera!.near = component.near;
        this.orthographicCamera!.far = component.far;
        this.orthographicCamera!.updateProjectionMatrix();
      }
    }

    if (component.perspective) {
      return this.perspectiveCamera!;
    } else {
      return this.orthographicCamera!;
    }
  }

  private createCameras(component: Readonly<CoreCamera>) {
    if (component!.perspective) {
      if (!this.perspectiveCamera) {
        this.perspectiveCamera = new PerspectiveCamera(component.fov, component.aspect, component.near, component.far);
      }
    } else if (!this.orthographicCamera) {
      this.orthographicCamera = new OrthographicCamera(
        component.fov * component.aspect / -2,
        component.fov * component.aspect / 2,
        component.fov / 2,
        component.fov / -2,
        component.near, component.far);
    }
  }


}