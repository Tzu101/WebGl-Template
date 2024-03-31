import { canvasInit } from "./canvas.js";
import { webglInit } from "./webgl.js";
import { Scene } from "./scene.js";

async function appInit() {
  if (!canvasInit()) {
    console.error("Couldnt access canvas element!");
    return;
  }

  if (!webglInit()) {
    console.error("WebGL not supported!");
    return;
  }

  const scene = new Scene({
    ambient_light: [0.25, 0.25, 0.25],
    point_lights: [
      {
        color: [0, 1, 0],
        position: [10, 0, 0],
        intensity: 0.25,
      },
      {
        color: [1, 0, 0],
        position: [0, 0, 10],
        intensity: 0.25,
      },
    ],
    directional_lights: [
      {
        color: [1, 1, 1],
        direction: [0.2, 1, 0],
        intensity: 1,
      },
    ],
  });
  await scene.init();

  function loop() {
    scene.update();
    scene.display();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
appInit();
