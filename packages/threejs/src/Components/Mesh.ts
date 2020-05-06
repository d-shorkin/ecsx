import {Component} from "@ecsx/core";
import {Geometry, BufferGeometry, Material} from "three";

export class Mesh extends Component {
  geometry?: Geometry | BufferGeometry;
  material?: Material | Material[];
}