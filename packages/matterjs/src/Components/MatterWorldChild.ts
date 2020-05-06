import {Component} from "@ecsx/core";
import {World} from "matter-js";

export class MatterWorldChild extends Component {
  world: World | null = null;
}