import {IEntity, RootScene} from "@ecsx/core";
import {ThreeScene} from "./Components";
import {Scene} from "three";

export function getScene(e: IEntity): null | Scene {
  if (
    !e.hasComponent(RootScene) ||
    !e.getComponent(RootScene).scene ||
    !e.getComponent(RootScene).scene!.getEntity().hasComponent(ThreeScene)
  ) {
    return null;
  }

  return e.getComponent(RootScene).scene!.getEntity().getComponent(ThreeScene).getScene();
}