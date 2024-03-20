var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { webgl } from "./webgl.js";
export class Shader {
    static fetchSource(shader_path) {
        return __awaiter(this, void 0, void 0, function* () {
            const file_content = yield (yield fetch(shader_path)).text();
            return file_content;
        });
    }
    static throwShaderError(shader) {
        console.error("Shader error!", webgl.getShaderInfoLog(shader));
    }
    static throwProgramError(program) {
        console.error("Program error!", webgl.getProgramInfoLog(program));
    }
    constructor() {
        const shader_program = webgl.createProgram();
        if (shader_program) {
            this.program = shader_program;
        }
        this.uniform_cache = new Map();
    }
    shaderInit(vertex_path, fragment_path) {
        return __awaiter(this, void 0, void 0, function* () {
            const vertex_shader = webgl.createShader(webgl.VERTEX_SHADER);
            const fragment_shader = webgl.createShader(webgl.FRAGMENT_SHADER);
            if (!vertex_shader || !fragment_shader) {
                return;
            }
            const vertex_source = yield Shader.fetchSource(vertex_path);
            const fragment_source = yield Shader.fetchSource(fragment_path);
            webgl.shaderSource(vertex_shader, vertex_source);
            webgl.shaderSource(fragment_shader, fragment_source);
            webgl.compileShader(vertex_shader);
            if (!webgl.getShaderParameter(vertex_shader, webgl.COMPILE_STATUS)) {
                Shader.throwShaderError(vertex_shader);
                return;
            }
            webgl.compileShader(fragment_shader);
            if (!webgl.getShaderParameter(fragment_shader, webgl.COMPILE_STATUS)) {
                Shader.throwShaderError(fragment_shader);
                return;
            }
            webgl.attachShader(this.program, vertex_shader);
            webgl.attachShader(this.program, fragment_shader);
            webgl.linkProgram(this.program);
            if (!webgl.getProgramParameter(this.program, webgl.LINK_STATUS)) {
                Shader.throwProgramError(this.program);
                return;
            }
            webgl.validateProgram(this.program);
            if (!webgl.getProgramParameter(this.program, webgl.VALIDATE_STATUS)) {
                Shader.throwProgramError(this.program);
                return;
            }
        });
    }
    bind() {
        webgl.useProgram(this.program);
    }
    getUniformLocation(name) {
        if (this.uniform_cache.has(name)) {
            return this.uniform_cache.get(name);
        }
        const uniform_location = webgl.getUniformLocation(this.program, name);
        if (uniform_location) {
            this.uniform_cache.set(name, uniform_location);
        }
        return uniform_location;
    }
    setUniformMatrix4fv(name, data) {
        const uniform_location = this.getUniformLocation(name);
        webgl.uniformMatrix4fv(uniform_location, false, data);
    }
}
