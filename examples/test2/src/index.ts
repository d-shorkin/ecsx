import {Engine} from "@ecsx/core";
import {Application} from "@pixi/app";
import {ContainerComponent} from "@ecsx/pixijs";

const app = new Application({})

const engine = new Engine()

// Scene
const scene = engine.createEntity();
scene.setComponent(ContainerComponent, {container: app.stage})

app.ticker.add((delta) => {
  engine.update(delta)
})


