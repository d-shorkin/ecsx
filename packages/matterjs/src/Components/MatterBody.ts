import {Collider2d, Component} from "@ecsx/core";
import {Body, Composite, World} from "matter-js";
import {MatterWorldChild} from "./MatterWorldChild";
import {IVector2} from "../../../core/src/Contract/Common";

export class MatterBody extends Component {
  get angularSpeed(): number {
    return this.body?.angularSpeed || 0;
  }

  set angularSpeed(value: number) {
    if (this.body) {
      this.body.bodies.forEach(b => b.angularSpeed = value);
    }
  }

  get angularVelocity(): number {
    return this.body?.angularVelocity || 0;
  }

  set angularVelocity(value: number) {
    if (this.body) {
      this.body.bodies.forEach(b => Body.setAngularVelocity(b, value));
    }
  }

  get density(): number {
    return this.body?.density || 0.001;
  }

  set density(value: number) {
    if (this.body) {
      this.body.bodies.forEach(b => Body.setDensity(b, value));

    }
  }

  get friction(): number {
    return this.body?.friction || 0.1;
  }

  set friction(value: number) {
    if (this.body) {
      this.body.bodies.forEach(b => b.friction = value);
    }
  }

  get frictionAir(): number {
    return this.body?.bodies[0]?.friction || 0.01;
  }

  set frictionAir(value: number) {
    if (this.body) {
      this.body.bodies.forEach(b => b.frictionAir = value);
    }
  }

  get inertia(): number {
    return this.body?.bodies[0]?.inertia || 1;
  }

  set inertia(value: number) {
    if (this.body) {
      this.body.bodies.forEach(b => Body.setInertia(b, value));
    }
  }

  private body: Composite | null = null;
  private world: World | null = null;
  private vertices: IVector2[][] = [];

  getBody(): Composite | null {
    return this.body;
  }

  update() {
    if (
      (!this.getEntity().hasComponent(Collider2d) || !this.getEntity().hasComponent(Collider2d)) &&
      this.body && this.world
    ) {
      World.remove(this.world, this.body);
      return;
    }

    const vertices = this.getEntity().getComponent(Collider2d).vertices;

    if (this.body && vertices === this.vertices) {
      this.updateWorld();
      return;
    }

    this.destroy();

    this.vertices = vertices;

    this.createBody();
  }

  updateWorld() {
    if (this.body) {
      return;
    }

    this.getEntity().hasComponent(MatterWorldChild, (component) => {
      if (component.world === this.world) {
        return;
      }

      if (this.world) {
        World.remove(this.world, this.body!);
      }

      if (component.world) {
        World.add(component.world, this.body!);
      }

      this.world = component.world;
    })
  }

  createBody() {
    this.getEntity().hasComponent(MatterWorldChild, ({world}) => {
      this.world = world;
      this.body = Composite.create({
        bodies: this.vertices.map()
      })
    });
  }

  destroy(): void {
    if (this.body && this.world) {
      World.remove(this.world, this.body);
      this.body = null;
    }
  }
}