import { canvas, canvasInit } from "./canvas.js";
import { webgl, webglInit, Shader } from "./webgl.js";
import { loadText, loadImage } from "./resource.js";
import { Node, Camera, Texture, Material, Model } from "./object.js";
import { MovementControler } from "./controler.js";

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
  const data_cube_positions = [
    // Front face
    -0.5, -0.5,  0.5, // bottom-left
     0.5, -0.5,  0.5, // bottom-right
     0.5,  0.5,  0.5, // top-right
    -0.5,  0.5,  0.5, // top-left

    // Back face
    -0.5, -0.5, -0.5, // bottom-left
     0.5, -0.5, -0.5, // bottom-right
     0.5,  0.5, -0.5, // top-right
    -0.5,  0.5, -0.5, // top-left

    // Top face
    -0.5,  0.5,  0.5, // front top-left
     0.5,  0.5,  0.5, // front top-right
     0.5,  0.5, -0.5, // back top-right
    -0.5,  0.5, -0.5, // back top-left

    // Bottom face
    -0.5, -0.5,  0.5, // front bottom-left
     0.5, -0.5,  0.5, // front bottom-right
     0.5, -0.5, -0.5, // back bottom-right
    -0.5, -0.5, -0.5, // back bottom-left

    // Right face
     0.5, -0.5,  0.5, // front bottom-right
     0.5,  0.5,  0.5, // front top-right
     0.5,  0.5, -0.5, // back top-right
     0.5, -0.5, -0.5, // back bottom-right

    // Left face
    -0.5, -0.5,  0.5, // front bottom-left
    -0.5,  0.5,  0.5, // front top-left
    -0.5,  0.5, -0.5, // back top-left
    -0.5, -0.5, -0.5, // back bottom-left
  ]

  // prettier-ignore
  const data_cube_colors = [
    // Front face
    1, 0, 0, // bottom-left
    1, 0, 0, // bottom-right
    1, 0, 0, // top-right
    1, 0, 0, // top-left

    0, 1, 0, // bottom-left
    0, 1, 0, // bottom-right
    0, 1, 0, // top-right
    0, 1, 0, // top-left

    0, 0, 1, // front top-left
    0, 0, 1, // front top-right
    0, 0, 1, // back top-right
    0, 0, 1, // back top-left

    1, 1, 0, // front bottom-left
    1, 1, 0, // front bottom-right
    1, 1, 0, // back bottom-right
    1, 1, 0, // back bottom-left

    1, 0, 1, // front bottom-right
    1, 0, 1, // front top-right
    1, 0, 1, // back top-right
    1, 0, 1, // back bottom-right

    0, 1, 1, // front bottom-left
    0, 1, 1, // front top-left
    0, 1, 1, // back top-left
    0, 1, 1, // back bottom-left
  ]

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
  const shader = new Shader(shader_source[0], shader_source[1]);

  const texture0 = new Texture(await loadImage("./res/textures/clouds.jpg"));
  const texture1 = new Texture(await loadImage("./res/textures/grass.jpg"));

  const material = new Material(shader, [texture0, texture1]);

  //const square = new Model(data_cube, [3, 3], indices_cube, material);
  const square = new Model(
    [data_cube_positions, data_cube_colors],
    [3, 3],
    indices_cube,
    material
  );

  const camera = new Camera(
    0.87,
    canvas.clientWidth / canvas.clientHeight,
    1,
    100000
  );

  const node = new Node();
  node.transform.translation = [0, 0, -300];
  node.transform.scale = [200, 200, 200];
  node.updateModelMatrix();

  const controler = new MovementControler(camera, 2.5);

  function loop() {
    webgl.clearColor(0.9, 0.9, 1.0, 1.0);
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    controler.update();

    node.transform.rotateZ(0.001);
    node.updateModelMatrix();

    square.bind();
    shader.setUniformMatrix4fv(
      "proj_mat",
      new Float32Array(camera.camera_matrix)
    );
    shader.setUniformMatrix4fv(
      "model_mat",
      new Float32Array(node.model_matrix)
    );
    square.draw();

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

appInit();
