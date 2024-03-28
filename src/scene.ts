import { canvas } from "./canvas.js";
import { Shader } from "./webgl.js";
import { loadText, loadModel, loadImage } from "./resource.js";
import { Node, Camera, Texture, Material, Model } from "./object.js";
import { RotationControler, MovementControler } from "./controler.js";

// TODO: Define background, lights, fog, skybox
export type Environment = {};

export class Scene extends Node {
  private camera: Camera;
  private active_shaders: Map<Shader, number>;

  // TODO: environment, lights

  constructor() {
    super();
  }

  async init() {
    // Camera setup
    this.camera = new Camera(
      0.87,
      canvas.clientWidth / canvas.clientHeight,
      1,
      100000
    );
    this.camera.controler = new MovementControler(this.camera, 2.5);

    // Objects setup
    const vertex_source = await loadText("./res/shaders/vertex/texture.glsl");
    const fragment_source = await loadText(
      "./res/shaders/fragment/texture.glsl"
    );
    const texture_shader = new Shader(vertex_source, fragment_source);

    const monkey_model = await loadModel("./res/models/monkey.json");
    const monkey_texture = new Texture(
      await loadImage("./res/textures/monkey.png")
    );
    const monkey_material = new Material(texture_shader, [monkey_texture]);

    const monkey = new Model(
      [monkey_model.vertices, monkey_model.texcoords],
      [3, 2],
      monkey_model.indices,
      monkey_material
    );
    monkey.controler = new RotationControler(monkey, [0, 0, 0.01]);
    this.addChild(monkey);

    monkey.transform.translation = [0, 0, -300];
    monkey.transform.scale = [20, 20, 20];
    monkey.transform.euler_rotation = [Math.PI * 1.5, 0, 0];
    monkey.updateModelMatrix();

    // Performance data setup
    this.active_shaders = new Map();
    this.active_shaders.set(texture_shader, 1);
  }

  update() {
    this.camera.update();
    super.update();
  }

  display() {
    // Global uniforms
    for (const [shader, _] of this.active_shaders) {
      shader.bind();
      shader.setUniformMatrix4fv(
        "proj_mat",
        new Float32Array(this.camera.camera_matrix)
      );
    }

    super.display();
  }
}
