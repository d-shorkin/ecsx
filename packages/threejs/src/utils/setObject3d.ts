import {IEntity} from "@ecsx/core";
import {Object3D} from "three";
import {Object3DComponent} from "../components";

export const setObject3d = (entity: IEntity, object: Object3D) => {
  if(!entity.hasComponent(Object3DComponent)){
    entity.setComponent(Object3DComponent,{object})
    return;
  }

  const obj = entity.getComponent(Object3DComponent)
  if(obj.object !== object){
    obj.object = object
  }
}
