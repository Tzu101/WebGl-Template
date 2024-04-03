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
import { webgl, Shader, VertexBuffer, VertexArray } from "./webgl.js";
import { loadText, ResourceLoader } from "./resource.js";
import { Node, Camera, Texture, Material, Model } from "./object.js";
import { RotationControler, MovementControler } from "./controler.js";
class AfterEffects {
    constructor(effects) {
        this.effects = effects;
        const new_framebuffer = webgl.createFramebuffer();
        if (new_framebuffer) {
            this.framebuffer = new_framebuffer;
        }
        const screen_buffer = new VertexBuffer();
        screen_buffer.bufferData(AfterEffects.quad_vertices);
        this.screen = new VertexArray([2]);
        this.screen.applyToBuffer(screen_buffer);
        this.adjustToCanvas();
    }
    bind() {
        webgl.bindFramebuffer(webgl.FRAMEBUFFER, this.framebuffer);
    }
    unbind() {
        webgl.bindFramebuffer(webgl.FRAMEBUFFER, null);
    }
    apply() {
        this.screen.bind();
        this.effects.bind();
        webgl.activeTexture(webgl.TEXTURE0);
        webgl.bindTexture(webgl.TEXTURE_2D, this.frame);
        this.effects.setUniform1i(`${Shader.UNIFORM_TEXTURE}`, 0);
        webgl.drawArrays(webgl.TRIANGLES, 0, 6);
    }
    adjustToCanvas() {
        this.bind();
        const new_frame = webgl.createTexture();
        if (!new_frame) {
            throw new Error("Couldnt create texture");
        }
        this.frame = new_frame;
        webgl.bindTexture(webgl.TEXTURE_2D, this.frame);
        webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, canvas.width, canvas.height, 0, webgl.RGBA, webgl.UNSIGNED_BYTE, null);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
        webgl.framebufferTexture2D(webgl.FRAMEBUFFER, webgl.COLOR_ATTACHMENT0, webgl.TEXTURE_2D, this.frame, 0);
        const new_depthbuffer = webgl.createRenderbuffer();
        if (!new_depthbuffer) {
            throw new Error("Couldnt create render buffer");
        }
        this.depthbuffer = new_depthbuffer;
        webgl.bindRenderbuffer(webgl.RENDERBUFFER, this.depthbuffer);
        webgl.renderbufferStorage(webgl.RENDERBUFFER, webgl.DEPTH_COMPONENT16, canvas.width, canvas.height);
        webgl.framebufferRenderbuffer(webgl.FRAMEBUFFER, webgl.DEPTH_ATTACHMENT, webgl.RENDERBUFFER, this.depthbuffer);
        this.unbind();
    }
}
AfterEffects.quad_vertices = [1, 1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1];
export class Scene extends Node {
    constructor(environment) {
        super();
        this.environment = Scene.constructEnvironment(environment);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            // Camera setup
            this.camera = new Camera(0.87, canvas.clientWidth / canvas.clientHeight, 0.1, 100000);
            this.onScreenResize = () => {
                this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
                this.camera.updateProjectionMatrix();
                this.after_effcts.adjustToCanvas();
            };
            this.camera.controler = new MovementControler(this.camera, 0.2);
            window.addEventListener("resize", this.onScreenResize);
            this.camera.transform.translation = [0, 0, 10];
            this.camera.updateModelMatrix();
            // Objects setup
            const loader = new ResourceLoader();
            const vertex_source_index = loader.requestText("./res/shaders/vertex/texture.glsl");
            const fragment_source_index = loader.requestText("./res/shaders/fragment/texture.glsl");
            const donut_models_index = loader.requestModels("./res/models/donut.json");
            const donut_base_texture_index = loader.requestImage("./res/textures/donut.png");
            const donut_icing_texture_index = loader.requestImage("./res/textures/icing.png");
            yield loader.loadResources();
            const vertex_source = loader.reciveText(vertex_source_index);
            const fragment_source = loader.reciveText(fragment_source_index);
            const donut_models = loader.reciveModels(donut_models_index);
            const donut_base_texture = new Texture(loader.reciveImage(donut_base_texture_index));
            const donut_icing_texture = new Texture(loader.reciveImage(donut_icing_texture_index));
            const texture_shader = new Shader(vertex_source, fragment_source);
            const donut_base_material = new Material(texture_shader, [
                donut_base_texture,
            ]);
            const donut_icing_material = new Material(texture_shader, [
                donut_icing_texture,
            ]);
            const donut_base = new Model([
                donut_models[0].vertices,
                donut_models[0].normals,
                donut_models[0].texcoords,
            ], [3, 3, 2], donut_models[0].indices, donut_base_material);
            const donut_icing = new Model([
                donut_models[1].vertices,
                donut_models[1].normals,
                donut_models[1].texcoords,
            ], [3, 3, 2], donut_models[1].indices, donut_icing_material);
            const donut = new Node();
            donut.addChild(donut_base);
            donut.addChild(donut_icing);
            donut.transform.scale = [10, 10, 10];
            donut.transform.euler_rotation = [Math.PI * 1.5, 0, 0];
            donut.controler = new RotationControler(donut, [0, 0, 0.01]);
            donut.updateModelMatrix();
            this.addChild(donut);
            // Performance data setup
            this.active_shaders = new Map();
            this.active_shaders.set(texture_shader, 1);
            // Global static uniforms
            for (const [shader, _] of this.active_shaders) {
                const point_lights_active = this.environment.point_lights.length;
                shader.setUniform1i(Shader.UNIFORM_POINT_LIGHTS_ACTIVE, point_lights_active);
                for (let l = 0; l < point_lights_active; l++) {
                    const point_light = this.environment.point_lights[l];
                    shader.setUniform3fv(`${Shader.UNIFORM_POINT_LIGHTS}[${l}].color`, point_light.color);
                    shader.setUniform3fv(`${Shader.UNIFORM_POINT_LIGHTS}[${l}].position`, point_light.position);
                    shader.setUniform1f(`${Shader.UNIFORM_POINT_LIGHTS}[${l}].intensity`, point_light.intensity);
                }
                const directional_lights_active = this.environment.directional_lights.length;
                shader.setUniform1i(Shader.UNIFORM_DIRECTIONAL_LIGHTS_ACTIVE, directional_lights_active);
                for (let l = 0; l < directional_lights_active; l++) {
                    const directional_light = this.environment.directional_lights[l];
                    shader.setUniform3fv(`${Shader.UNIFORM_DIRECTIONAL_LIGHTS}[${l}].color`, directional_light.color);
                    shader.setUniform3fv(`${Shader.UNIFORM_DIRECTIONAL_LIGHTS}[${l}].direction`, directional_light.direction);
                    shader.setUniform1f(`${Shader.UNIFORM_DIRECTIONAL_LIGHTS}[${l}].intensity`, directional_light.intensity);
                }
            }
            const after_effect_shader = new Shader(yield loadText("./res/shaders/vertex/after_effect.glsl"), yield loadText("./res/shaders/fragment/after_effect.glsl"));
            this.after_effcts = new AfterEffects(after_effect_shader);
        });
    }
    destructor() {
        window.removeEventListener("resize", this.onScreenResize);
    }
    update() {
        this.camera.update();
        super.update();
    }
    display() {
        this.after_effcts.bind();
        webgl.clearColor(...this.environment.background_color, 1.0);
        webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
        // Global dynamic uniforms
        for (const [shader, _] of this.active_shaders) {
            shader.bind();
            shader.setUniform3fv(Shader.UNIFORM_VIEW_POSITION, this.camera.transform.translation);
            shader.setUniform3fv(Shader.UNIFORM_AMBIENT_LIGHT, this.environment.ambient_light);
            shader.setUniformMatrix4fv(Shader.UNIFORM_PROJECTION_MATRIX, this.camera.camera_matrix);
        }
        super.display();
        this.after_effcts.unbind();
        this.after_effcts.apply();
    }
    static constructEnvironment(environment) {
        return environment
            ? Object.assign(Object.assign({}, Scene.defaultEnvironment), environment) : Object.assign({}, Scene.defaultEnvironment);
    }
}
Scene.defaultEnvironment = {
    background_color: [0, 0, 0],
    ambient_light: [0, 0, 0],
    directional_lights: [],
    point_lights: [],
};
