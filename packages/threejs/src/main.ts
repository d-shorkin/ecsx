import {Transform, IEngine, IEntityCollection, ISystem, TagComponent} from "@ecsx/core";
import {BoxGeometry, Mesh, Scene, MeshStandardMaterial, DirectionalLight, HemisphereLight} from "three";

export class ThreeJsObject extends TagComponent {

}

export class ThreeJsRenderingSystem implements ISystem {
  private scene: Scene;

  private elements: IEntityCollection;
  private objects: { [p: string]: Mesh } = {};

  constructor(scene: Scene) {
    this.scene = scene;
  }

  onAttach(engine: IEngine): void {
    this.elements = engine.createFamily([ThreeJsObject]);

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

  execute(engine: IEngine, delta: number): void {
    this.elements.getEntities().forEach(e => {
      if (!this.objects[e.getId()]) {
        const geometry = new BoxGeometry(2, 2, 2);
        const material = new MeshStandardMaterial({color: 0xFF6666});
        const cube = new Mesh(geometry, material);
        this.scene.add(cube);
        this.objects[e.getId()] = cube;
      }
      const mesh: Mesh = this.objects[e.getId()];
      if (!e.hasComponent(Transform)) {
        return;
      }
      const transform = e.getComponent(Transform);
      mesh.position.x = transform.getWorld("positionX");
      mesh.position.y = transform.getWorld("positionY");
      mesh.position.z = transform.getWorld("positionZ");
      mesh.rotation.x = transform.getWorld("rotationX");
      mesh.rotation.y = transform.getWorld("rotationY");
      mesh.rotation.z = transform.getWorld("rotationZ");
      mesh.scale.x = transform.getWorld("scaleX");
      mesh.scale.y = transform.getWorld("scaleY");
      mesh.scale.z = transform.getWorld("scaleZ");
    })
  }
}