import { canvas, canvasInit } from "./canvas.js";
import {
  webgl,
  webglInit,
  IndexBuffer,
  VertexBuffer,
  VertexArray,
  Shader,
} from "./webgl.js";
import { loadText, loadImage } from "./resource.js";
import { Node, Camera, Texture, Model } from "./object.js";
import { Matrix4 } from "./math.js";

async function appInit() {
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
    -0.5, -0.5,  0.5, 1, 0, 0, // bottom-left
     0.5, -0.5,  0.5, 1, 0, 0, // bottom-right
     0.5,  0.5,  0.5, 1, 0, 0, // top-right
    -0.5,  0.5,  0.5, 1, 0, 0, // top-left

    // Back face
    -0.5, -0.5, -0.5, 0, 1, 0, // bottom-left
     0.5, -0.5, -0.5, 0, 1, 0, // bottom-right
     0.5,  0.5, -0.5, 0, 1, 0, // top-right
    -0.5,  0.5, -0.5, 0, 1, 0, // top-left

    // Top face
    -0.5,  0.5,  0.5, 0, 0, 1, // front top-left
     0.5,  0.5,  0.5, 0, 0, 1, // front top-right
     0.5,  0.5, -0.5, 0, 0, 1, // back top-right
    -0.5,  0.5, -0.5, 0, 0, 1, // back top-left

    // Bottom face
    -0.5, -0.5,  0.5, 1, 1, 0, // front bottom-left
     0.5, -0.5,  0.5, 1, 1, 0, // front bottom-right
     0.5, -0.5, -0.5, 1, 1, 0, // back bottom-right
    -0.5, -0.5, -0.5, 1, 1, 0, // back bottom-left

    // Right face
     0.5, -0.5,  0.5, 1, 0, 1, // front bottom-right
     0.5,  0.5,  0.5, 1, 0, 1, // front top-right
     0.5,  0.5, -0.5, 1, 0, 1, // back top-right
     0.5, -0.5, -0.5, 1, 0, 1, // back bottom-right

    // Left face
    -0.5, -0.5,  0.5, 0, 1, 1, // front bottom-left
    -0.5,  0.5,  0.5, 0, 1, 1, // front top-left
    -0.5,  0.5, -0.5, 0, 1, 1, // back top-left
    -0.5, -0.5, -0.5, 0, 1, 1, // back bottom-left
  ];

  // prettier-ignore
  const indices_cube = [
    0,  1,  2,      0,  2,  3,    // Front face
    4,  6,  5,      4,  7,  6,    // Back face
    8,  9,  10,     8,  10, 11,   // Top face
    13, 12, 14,     14, 12, 15,   // Bottom face
    17, 16, 18,     18, 16, 19,   // Right face
    20, 21, 22,     20, 22, 23    // Left face
  ];

  const vertex_basic_source = loadText("./res/shaders/vertex/basic.glsl");
  const fragment_basic_source = loadText("./res/shaders/fragment/basic.glsl");
  const fragment_texture_source = loadText(
    "./res/shaders/fragment/texture.glsl"
  );
  const shader_source = await Promise.all([
    vertex_basic_source,
    fragment_basic_source,
    fragment_texture_source,
  ]);
  const shader_square = new Shader(shader_source[0], shader_source[2]);
  const shader_cube = new Shader(shader_source[0], shader_source[1]);

  const texture0 = new Texture(await loadImage("./res/textures/clouds.jpg"));
  const texture1 = new Texture(await loadImage("./res/textures/grass.jpg"));
  const texture2 = new Texture(await loadImage("./res/textures/stars.jpeg"));

  const square = new Model(data_square, [2, 3], indices_square, shader_square, [
    texture0,
    texture1,
    texture2,
  ]);
  const cube = new Model(data_cube, [3, 3], indices_cube, shader_cube);

  const camera = new Camera(
    0.87,
    canvas.clientWidth / canvas.clientHeight,
    1,
    100000
  );
  camera.updateModelMatrix();

  shader_cube.bind();
  shader_cube.setUniformMatrix4fv(
    "proj_mat",
    new Float32Array(camera.camera_matrix)
  );

  shader_square.bind();
  shader_square.setUniformMatrix4fv(
    "proj_mat",
    new Float32Array(camera.camera_matrix)
  );

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
    shader_cube.setUniformMatrix4fv(
      "model_mat",
      new Float32Array(node_cube.model_matrix)
    );
    cube.draw();

    square.bind();
    shader_square.setUniformMatrix4fv(
      "model_mat",
      new Float32Array(node_square.model_matrix)
    );
    square.draw();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

appInit();
