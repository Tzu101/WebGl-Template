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
