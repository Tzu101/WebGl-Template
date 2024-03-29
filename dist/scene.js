var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { canvas } from "./canvas.js";
import { webgl, Shader } from "./webgl.js";
import { loadText, loadModel, loadImage } from "./resource.js";
import { Node, Camera, Texture, Material, Model } from "./object.js";
import { RotationControler, MovementControler } from "./controler.js";
export class Scene extends Node {
    constructor(environment) {
        super();
        this.environment = Scene.constructEnvironment(environment);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Camera setup
            this.camera = new Camera(0.87, canvas.clientWidth / canvas.clientHeight, 1, 100000);
            this.setCameraAspect = () => {
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this.camera.updateProjectionMatrix();
            };
            this.camera.controler = new MovementControler(this.camera, 2.5);
            window.addEventListener("resize", this.setCameraAspect);
            // Objects setup
            const vertex_source = yield loadText("./res/shaders/vertex/texture.glsl");
            const fragment_source = yield loadText("./res/shaders/fragment/texture.glsl");
            const texture_shader = new Shader(vertex_source, fragment_source);
            const monkey_model = yield loadModel("./res/models/monkey.json");
            const monkey_texture = new Texture(yield loadImage("./res/textures/monkey.png"));
            const monkey_material = new Material(texture_shader, [monkey_texture]);
            const monkey = new Model([monkey_model.vertices, monkey_model.normals, monkey_model.texcoords], [3, 3, 2], monkey_model.indices, monkey_material);
            monkey.controler = new RotationControler(monkey, [0, 0, 0.01]);
            this.addChild(monkey);
            monkey.transform.translation = [0, 0, -300];
            monkey.transform.scale = [20, 20, 20];
            monkey.transform.euler_rotation = [Math.PI * 1.5, 0, 0];
            monkey.updateModelMatrix();
            // Performance data setup
            this.active_shaders = new Map();
            this.active_shaders.set(texture_shader, 1);
        });
    }
    destructor() {
        window.removeEventListener("resize", this.setCameraAspect);
    }
    update() {
        this.camera.update();
        super.update();
    }
    display() {
        webgl.clearColor(...this.environment.background_color, 1.0);
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        // Global uniforms
        for (const [shader, _] of this.active_shaders) {
            shader.bind();
            shader.setUniform3fv(Shader.UNIFORM_VIEW_POSITION, this.camera.transform.translation);
            shader.setUniform3fv(Shader.UNIFORM_AMBIENT_LIGHT, this.environment.ambient_light);
            shader.setUniformMatrix4fv(Shader.UNIFORM_PROJECTION_MATRIX, this.camera.camera_matrix);
        }
        super.display();
    }
    static constructEnvironment(environment) {
        return environment
            ? Object.assign(Object.assign({}, Scene.defaultEnvironment), environment) : Object.assign({}, Scene.defaultEnvironment);
    }
}
Scene.defaultEnvironment = {
    background_color: [0, 0, 0],
    ambient_light: [0, 0, 0],
};
