var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { canvasInit } from "./canvas.js";
import { webglInit } from "./webgl.js";
import { Scene } from "./scene.js";
function appInit() {
    return __awaiter(this, void 0, void 0, function* () {
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
                    intensity: 0.75,
                },
                {
                    color: [1, 0, 0],
                    position: [0, 0, 10],
                    intensity: 0.5,
                },
            ],
            directional_lights: [
                {
                    color: [0.9, 0.9, 0.1],
                    direction: [0.2, 1, 0],
                    intensity: 2,
                },
            ],
        });
        yield scene.init();
        function loop() {
            scene.update();
            scene.display();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    });
}
appInit();
