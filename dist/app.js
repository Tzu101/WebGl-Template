var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { canvas, canvasInit } from "./canvas.js";
import { webgl, webglInit, Shader, } from "./webgl.js";
import { loadText, loadImage } from "./resource.js";
import { Node, Camera, Model } from "./object.js";
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
        // prettier-ignore
        const data_square = [
            -0.5, -0.5, 1, 1, 1,
            -0.5, 0.5, 1, 0, 0,
            0.5, -0.5, 0, 1, 0,
            0.5, 0.5, 0, 0, 1
        ];
        // prettier-ignore
        const indices_square = [
            0, 3,
            1, 0,
            2, 3
        ];
        // prettier-ignore
        const data_cube = [
            // Front face
            -0.5, -0.5, 0.5, 1, 0, 0,
            0.5, -0.5, 0.5, 1, 0, 0,
            0.5, 0.5, 0.5, 1, 0, 0,
            -0.5, 0.5, 0.5, 1, 0, 0,
            // Back face
            -0.5, -0.5, -0.5, 0, 1, 0,
            0.5, -0.5, -0.5, 0, 1, 0,
            0.5, 0.5, -0.5, 0, 1, 0,
            -0.5, 0.5, -0.5, 0, 1, 0,
            // Top face
            -0.5, 0.5, 0.5, 0, 0, 1,
            0.5, 0.5, 0.5, 0, 0, 1,
            0.5, 0.5, -0.5, 0, 0, 1,
            -0.5, 0.5, -0.5, 0, 0, 1,
            // Bottom face
            -0.5, -0.5, 0.5, 1, 1, 0,
            0.5, -0.5, 0.5, 1, 1, 0,
            0.5, -0.5, -0.5, 1, 1, 0,
            -0.5, -0.5, -0.5, 1, 1, 0,
            // Right face
            0.5, -0.5, 0.5, 1, 0, 1,
            0.5, 0.5, 0.5, 1, 0, 1,
            0.5, 0.5, -0.5, 1, 0, 1,
            0.5, -0.5, -0.5, 1, 0, 1,
            // Left face
            -0.5, -0.5, 0.5, 0, 1, 1,
            -0.5, 0.5, 0.5, 0, 1, 1,
            -0.5, 0.5, -0.5, 0, 1, 1,
            -0.5, -0.5, -0.5, 0, 1, 1, // back bottom-left
        ];
        // prettier-ignore
        const indices_cube = [
            0, 1, 2, 0, 2, 3,
            4, 6, 5, 4, 7, 6,
            8, 9, 10, 8, 10, 11,
            13, 12, 14, 14, 12, 15,
            17, 16, 18, 18, 16, 19,
            20, 21, 22, 20, 22, 23 // Left face
        ];
        const vertex_basic_source = loadText("./res/shaders/vertex/basic.glsl");
        const fragment_basic_source = loadText("./res/shaders/fragment/basic.glsl");
        const fragment_texture_source = loadText("./res/shaders/fragment/texture.glsl");
        const shader_source = yield Promise.all([
            vertex_basic_source,
            fragment_basic_source,
            fragment_texture_source,
        ]);
        const shader_square = new Shader(shader_source[0], shader_source[2]);
        const shader_cube = new Shader(shader_source[0], shader_source[1]);
        const cloudTexture = webgl.createTexture();
        webgl.activeTexture(webgl.TEXTURE0);
        webgl.bindTexture(webgl.TEXTURE_2D, cloudTexture);
        webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
        const texture0 = yield loadImage("./res/textures/clouds.jpg");
        webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, texture0);
        const grassTexture = webgl.createTexture();
        webgl.activeTexture(webgl.TEXTURE1);
        webgl.bindTexture(webgl.TEXTURE_2D, grassTexture);
        webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
        const texture1 = yield loadImage("./res/textures/grass.jpg");
        webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, texture1);
        shader_square.bind();
        const loc0 = webgl.getUniformLocation(shader_square.program, "texture0");
        webgl.uniform1i(loc0, 0);
        const loc1 = webgl.getUniformLocation(shader_square.program, "texture1");
        webgl.uniform1i(loc1, 1);
        const square = new Model(data_square, [2, 3], indices_square, shader_square);
        const cube = new Model(data_cube, [3, 3], indices_cube, shader_cube);
        const camera = new Camera(0.87, canvas.clientWidth / canvas.clientHeight, 1, 100000);
        camera.updateModelMatrix();
        shader_cube.bind();
        shader_cube.setUniformMatrix4fv("proj_mat", new Float32Array(camera.camera_matrix));
        shader_square.bind();
        shader_square.setUniformMatrix4fv("proj_mat", new Float32Array(camera.camera_matrix));
        const node_square = new Node();
        node_square.transform.translation = [0, -50, -300];
        node_square.transform.scale = [200, 200, 200];
        node_square.updateModelMatrix();
        const node_cube = new Node();
        node_cube.transform.translation = [0, 50, -300];
        node_cube.transform.scale = [20, 200, 10];
        function loop() {
            webgl.clearColor(0.9, 0.9, 1.0, 1.0);
            webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
            /*camera.transform.translation[2] += 0.5;
            camera.transform.rotateZ(0.02);
            camera.updateModelMatrix();
            shader.setUniformMatrix4fv(
              "proj_mat",
              new Float32Array(camera.camera_matrix)
            );*/
            node_cube.transform.rotateX(0.01);
            node_cube.transform.rotateY(0.005);
            node_cube.transform.rotateZ(0.0025);
            node_cube.updateModelMatrix();
            node_square.transform.rotateZ(0.001);
            node_square.updateModelMatrix();
            cube.bind();
            shader_cube.setUniformMatrix4fv("model_mat", new Float32Array(node_cube.model_matrix));
            cube.draw();
            square.bind();
            shader_square.setUniformMatrix4fv("model_mat", new Float32Array(node_square.model_matrix));
            square.draw();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    });
}
appInit();
