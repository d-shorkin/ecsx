import * as Matter from "matter-js";
import decomp from 'poly-decomp';

export interface IExtendedBodyConfig extends Matter.IBodyDefinition {
  removeCollinear?: number;
  optimalDecomp?: boolean;
}

export class MatterPolygonFactory {
  private options: IExtendedBodyConfig;

  constructor(options: IExtendedBodyConfig = {}) {
    this.options = options;
  }

  createfromVerticles(vertices: Matter.Vector[]): Matter.Body {
    if (vertices.length < 3) {
      throw new Error('Cannot create polygon using less 3 point')
    }

    if (vertices.length <= 3) {
      return Matter.Bodies.fromVertices(0, 0, [vertices], this.options, false);
    }

    return this.createFromVerticesSet(this.decompVerticles(vertices));
  }

  createFromVerticesSet(verticesSet: Matter.Vector[][]): Matter.Body {
    return Matter.Body.create({
      parts: verticesSet.map(vertices => Matter.Body.create({
        vertices,
        position: Matter.Vertices.centre(vertices)
      })),
      ...this.options
    });
  }

  decompVerticles(vertices: Matter.Vector[]): Matter.Vector[][] {
    let concave = vertices.map(function (vertex) {
      return [vertex.x, vertex.y];
    });

    decomp.makeCCW(concave);

    if (this.options.removeCollinear) {
      decomp.removeCollinearPoints(concave, this.options.removeCollinear);
    }

    let points: number[][][] = [];

    if (this.options.optimalDecomp) {
      points = decomp.decomp(concave);
    } else {
      points = decomp.quickDecomp(concave);
    }

    return points.map((v: number[][]) => v.map(v => Matter.Vector.create(v[0], v[1])));
  }
}