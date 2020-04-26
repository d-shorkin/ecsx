import {Component, Scene as CoreScene} from "@ecsx/core";
import {Scene, HemisphereLight, DirectionalLight} from "three";

export class ThreeScene extends Component {
  private scene: Scene | null = null;

  getScene(): Scene | null {
    if (!this.getEntity().hasComponent(CoreScene)) {
      this.getEntity().removeComponent(ThreeScene);
      return null;
    }

    if(!this.scene){
      this.scene = new Scene();

      const hemiLight = new HemisphereLight(0xffffff, 0xffffff, 0.6);
      hemiLight.color.setHSL(0.6, 1, 0.6);
      hemiLight.groundColor.setHSL(0.095, 1, 0.75);
      hemiLight.position.set(0, 50, 0);
      this.scene.add(hemiLight);

      const dirLight = new DirectionalLight(0xffffff, 1);
      dirLight.color.setHSL(0.1, 1, 0.95);
      dirLight.position.set(-1, 1.75, 1);
      dirLight.position.multiplyScalar(30);
      this.scene.add(dirLight);
    }

    return this.scene;
  }
}