import { canvasInit } from "./canvas.js";
import { webgl, webglInit } from "./webgl.js";
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

  const scene = new Scene();
  await scene.init();

  function loop() {
    webgl.clearColor(1.0, 0.9, 0.8, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    scene.update();
    scene.display();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
appInit();
