import { canvas } from "./canvas.js";

export let webgl: WebGL2RenderingContext;

export function webglInit(): boolean {
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
  protected buffer: WebGLBuffer;

  constructor() {
    const new_buffer = webgl.createBuffer();
    if (new_buffer) {
      this.buffer = new_buffer;
    }
  }
}

export class IndexBuffer extends Buffer {
  private _size: number;

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

  bufferData(data: number[]) {
    this._size = data.length;
    this.bind();
    webgl.bufferData(
      webgl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(data),
      webgl.STATIC_DRAW
    );
  }
}

export class VertexBuffer extends Buffer {
  bind() {
    webgl.bindBuffer(webgl.ARRAY_BUFFER, this.buffer);
  }

  bufferData(data: number[]) {
    this.bind();
    webgl.bufferData(
      webgl.ARRAY_BUFFER,
      new Float32Array(data),
      webgl.STATIC_DRAW
    );
  }
}

export class VertexArray {
  private size: number;
  private layout: number[];
  private vertex_array: WebGLVertexArrayObject;

  constructor(layout: number[]) {
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

  applyToBuffer(buffer: VertexBuffer) {
    this.bind();
    buffer.bind();

    let offset = 0;
    for (let layer_index = 0; layer_index < this.layout.length; layer_index++) {
      const layer_size = this.layout[layer_index];

      webgl.enableVertexAttribArray(layer_index);
      webgl.vertexAttribPointer(
        layer_index,
        layer_size,
        webgl.FLOAT,
        false,
        this.size * Float32Array.BYTES_PER_ELEMENT,
        offset
      );

      offset += layer_size * Float32Array.BYTES_PER_ELEMENT;
    }
  }

  applyToBuffers() {}
}

export class Shader {
  private static throwShaderError(shader: WebGLShader) {
    console.error("Shader error!", webgl.getShaderInfoLog(shader));
  }

  private static throwProgramError(program: WebGLProgram) {
    console.error("Program error!", webgl.getProgramInfoLog(program));
  }

  private _program: WebGLProgram;
  private uniform_cache: Map<string, WebGLUniformLocation>;

  constructor(vertex_source: string, fragment_source: string) {
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

  getUniformLocation(name: string): WebGLUniformLocation | null {
    if (this.uniform_cache.has(name)) {
      return this.uniform_cache.get(name) as WebGLUniformLocation;
    }

    const uniform_location = webgl.getUniformLocation(this._program, name);
    if (uniform_location) {
      this.uniform_cache.set(name, uniform_location);
    }
    return uniform_location;
  }

  setUniformMatrix4fv(name: string, data: Float32Array) {
    const uniform_location = this.getUniformLocation(name);
    webgl.uniformMatrix4fv(uniform_location, false, data);
  }
}
