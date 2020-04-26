import {Component} from "@ecsx/core";
import {Mesh as ThreeMesh, Geometry, BufferGeometry, Material, Scene} from "three";
import {getScene} from "../helpers";

export class Mesh extends Component {
  geometry?: Geometry | BufferGeometry;
  material?: Material | Material[];

  private scene: Scene | null = null;
  private mesh?: ThreeMesh;

  getMesh(): ThreeMesh {
    this.update();
    return this.mesh!;
  }

  update() {
    if (!this.geometry || !this.material) {
      throw new Error('geometry and material property is required');
    }

    if (!this.mesh) {
      this.mesh = new ThreeMesh(this.geometry, this.material)
    }

    const scene = getScene(this.getEntity());

    if (scene !== this.scene) {
      if (this.scene) {
        this.scene.remove(this.mesh);
      }

      if (scene) {
        scene.add(this.mesh);
      }

      this.scene = scene;
    }

    if ((this.mesh.geometry !== this.geometry || this.mesh.material !== this.material)) {
      const newMesh = new ThreeMesh(this.geometry, this.material);
      if (this.scene) {
        this.scene.remove(this.mesh);
        this.scene.add(newMesh);
      }
      this.mesh = newMesh;
    }
  }

  destroy(): void {
    if(!this.mesh){
      return;
    }
    if(this.scene){
      this.scene.remove(this.mesh);
    }
  }
}