import {IEngine, IEntity, IEntityCollection, ISystem} from "@ecsx/core";
import {Player, PlayerCamera} from "../components";
import {Camera, Object3D} from "@ecsx/threejs";

export class PlayerCameraViewSystem implements ISystem{
  private player: IEntityCollection;
  private camera: IEntityCollection;
  onAttach(engine: IEngine): void {
    this.player = engine.createFamily(Player, Object3D);
    this.camera = engine.createFamily(Camera, PlayerCamera);
  }

  execute(engine: IEngine, delta: number): void {
    this.player.getEntities().forEach((entity: IEntity) => {
      const obj = entity.getComponent(Object3D).object3D;
      const pos = obj.position.clone();
      this.camera.getEntities().forEach((camera: IEntity) => {
        const zoom = camera.getComponent(PlayerCamera).zoom;
        const lerp = camera.getComponent(PlayerCamera).lerp;

        const campos = pos.clone();
        campos.x = pos.x;
        campos.y = pos.y + zoom;
        campos.z = pos.z + zoom * .2;

        campos.lerp(camera.getComponent(Camera).camera.position, lerp);
        camera.getComponent(Camera).camera.position.fromArray(campos.toArray());

        camera.getComponent(Camera).camera.lookAt(pos);
      });
    });
  }

}