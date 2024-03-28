import { canvas } from "./canvas.js";
export let webgl;
export function webglInit() {
    const webgl_context = canvas.getContext("webgl2");
    if (!webgl_context) {
        return false;
    }
    webgl = webgl_context;
    setViewport();
    webgl.enable(webgl.CULL_FACE);
    webgl.enable(webgl.DEPTH_TEST);
    return true;
}
function setViewport() {
    webgl.viewport(0, 0, canvas.width, canvas.height);
}
window.addEventListener("resize", setViewport);
class Buffer {
    constructor() {
        const new_buffer = webgl.createBuffer();
        if (new_buffer) {
            this.buffer = new_buffer;
        }
    }
}
export class IndexBuffer extends Buffer {
    constructor() {
        super();
        this._size = 0;
    }
    get size() {
        return this._size;
    }
    bind() {
        webgl.bindBuffer(webgl.ELEMENT_ARRAY_BUFFER, this.buffer);
    }
    bufferData(data) {
        this._size = data.length;
        this.bind();
        webgl.bufferData(webgl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), webgl.STATIC_DRAW);
    }
}
export class VertexBuffer extends Buffer {
    bind() {
        webgl.bindBuffer(webgl.ARRAY_BUFFER, this.buffer);
    }
    bufferData(data) {
        this.bind();
        webgl.bufferData(webgl.ARRAY_BUFFER, new Float32Array(data), webgl.STATIC_DRAW);
    }
}
export class VertexArray {
    constructor(layout) {
        this.size = layout.reduce((acc, num) => acc + num, 0);
        this.layout = [...layout];
        const new_vertex_array = webgl.createVertexArray();
        if (new_vertex_array) {
            this.vertex_array = new_vertex_array;
        }
    }
    bind() {
        webgl.bindVertexArray(this.vertex_array);
    }
    applyToBuffer(buffer) {
        this.bind();
        buffer.bind();
        let offset = 0;
        for (let layer_index = 0; layer_index < this.layout.length; layer_index++) {
            const layer_size = this.layout[layer_index];
            webgl.enableVertexAttribArray(layer_index);
            webgl.vertexAttribPointer(layer_index, layer_size, webgl.FLOAT, false, this.size * Float32Array.BYTES_PER_ELEMENT, offset);
            offset += layer_size * Float32Array.BYTES_PER_ELEMENT;
        }
    }
    applyToBuffers(buffers) {
        this.bind();
        for (let buffer_index = 0; buffer_index < buffers.length; buffer_index++) {
            buffers[buffer_index].bind();
            const buffer_size = this.layout[buffer_index];
            webgl.enableVertexAttribArray(buffer_index);
            webgl.vertexAttribPointer(buffer_index, buffer_size, webgl.FLOAT, false, buffer_size * Float32Array.BYTES_PER_ELEMENT, 0);
        }
    }
}
export class Shader {
    static throwShaderError(shader) {
        console.error("Shader error!", webgl.getShaderInfoLog(shader));
    }
    static throwProgramError(program) {
        console.error("Program error!", webgl.getProgramInfoLog(program));
    }
    constructor(vertex_source, fragment_source) {
        const shader_program = webgl.createProgram();
        if (!shader_program) {
            console.error("Couldnt init program");
            return;
        }
        this._program = shader_program;
        this.uniform_cache = new Map();
        const vertex_shader = webgl.createShader(webgl.VERTEX_SHADER);
        const fragment_shader = webgl.createShader(webgl.FRAGMENT_SHADER);
        if (!vertex_shader || !fragment_shader) {
            return;
        }
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
        webgl.attachShader(this._program, vertex_shader);
        webgl.attachShader(this._program, fragment_shader);
        webgl.linkProgram(this._program);
        if (!webgl.getProgramParameter(this._program, webgl.LINK_STATUS)) {
            Shader.throwProgramError(this._program);
            return;
        }
        webgl.validateProgram(this._program);
        if (!webgl.getProgramParameter(this._program, webgl.VALIDATE_STATUS)) {
            Shader.throwProgramError(this._program);
            return;
        }
    }
    get program() {
        return this._program;
    }
    bind() {
        webgl.useProgram(this._program);
    }
    getUniformLocation(name) {
        if (this.uniform_cache.has(name)) {
            return this.uniform_cache.get(name);
        }
        const uniform_location = webgl.getUniformLocation(this._program, name);
        if (uniform_location) {
            this.uniform_cache.set(name, uniform_location);
        }
        return uniform_location;
    }
    setUniform1i(name, integer) {
        const uniform_location = this.getUniformLocation(name);
        webgl.uniform1i(uniform_location, integer);
    }
    setUniform3f(name, float1, float2, float3) {
        const uniform_location = this.getUniformLocation(name);
        webgl.uniform3f(uniform_location, float1, float2, float3);
    }
    setUniformMatrix4fv(name, matrix) {
        const uniform_location = this.getUniformLocation(name);
        webgl.uniformMatrix4fv(uniform_location, false, matrix);
    }
}
Shader.UNIFORM_MODEL_MATRIX = "u_ModelMatrix";
Shader.UNIFORM_PROJECTION_MATRIX = "u_ProjectionMatrix";
Shader.UNIFORM_AMBIENT_LIGHT = "u_AmbientLight";
Shader.UNIFORM_TEXTURES = "u_Textures";
