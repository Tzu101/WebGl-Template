import { Matrix4, Quaternion } from "./math.js";
import {
  webgl,
  IndexBuffer,
  VertexBuffer,
  VertexArray,
  Shader,
} from "./webgl.js";

class Transform {
  private _translation: number[];
  private _euler_rotation: number[];
  private _quaternion_rotation: number[];
  private _scale: number[];

  constructor() {
    this._translation = [0, 0, 0];
    this._euler_rotation = [0, 0, 0];
    this._quaternion_rotation = [1, 0, 0, 0];
    this._scale = [1, 1, 1];
  }

  get translation() {
    return this._translation;
  }
  set translation(new_translation: number[]) {
    this._translation = [...new_translation];
  }

  get euler_rotation() {
    return this._euler_rotation;
  }
  set euler_rotation(new_rotation: number[]) {
    this._euler_rotation = [...new_rotation];
    this._quaternion_rotation = Quaternion.fromEuler(this._euler_rotation);
  }

  get quaternion_rotation() {
    return this._quaternion_rotation;
  }
  set quaternion_rotation(new_rotation: number[]) {
    this._quaternion_rotation = [...new_rotation];
    this._euler_rotation = Quaternion.toEuler(this._quaternion_rotation);
  }

  get scale() {
    return this._scale;
  }
  set scale(new_scale: number[]) {
    this._scale = [...new_scale];
  }

  rotateX(angle_rad: number) {
    this._quaternion_rotation = Quaternion.rotateX(
      this._quaternion_rotation,
      angle_rad
    );
    this._euler_rotation = Quaternion.toEuler(this._quaternion_rotation);
  }
  rotateY(angle_rad: number) {
    this._quaternion_rotation = Quaternion.rotateY(
      this._quaternion_rotation,
      angle_rad
    );
    this._euler_rotation = Quaternion.toEuler(this._quaternion_rotation);
  }
  rotateZ(angle_rad: number) {
    this._quaternion_rotation = Quaternion.rotateZ(
      this._quaternion_rotation,
      angle_rad
    );
    this._euler_rotation = Quaternion.toEuler(this._quaternion_rotation);
  }
}

export class Node {
  protected _transform: Transform;
  protected _model_matrix: number[];

  constructor() {
    this._transform = new Transform();
    this._model_matrix = Matrix4.identity();
  }

  get transform() {
    return this._transform;
  }

  updateModelMatrix() {
    let new_matrix = Matrix4.identity();

    const translation_matrix = Matrix4.translation(this._transform.translation);
    const rotation_matrix = Matrix4.rotationFromQuaternion(
      this._transform.quaternion_rotation
    );
    const scale_matrix = Matrix4.scaling(this._transform.scale);

    new_matrix = Matrix4.multiplay(new_matrix, translation_matrix);
    new_matrix = Matrix4.multiplay(new_matrix, rotation_matrix);
    new_matrix = Matrix4.multiplay(new_matrix, scale_matrix);

    this._model_matrix = new_matrix;
  }

  get model_matrix() {
    return this._model_matrix;
  }
}

export class Camera extends Node {
  public fov = 0;
  public aspect = 0;
  public near = 0;
  public far = 0;

  protected _projection_matrix: number[];
  protected _view_matrix: number[];
  protected _camera_matrix: number[];

  constructor(fov_rad: number, aspect: number, near: number, far: number) {
    super();

    this.fov = fov_rad;
    this.aspect = aspect;
    this.near = near;
    this.far = far;

    this._view_matrix = this.calculateViewMatrix();
    this._projection_matrix = this.calculatePerspectiveMatrix();
    this._camera_matrix = this.calculateCameraMatrix();
  }

  get projection_matrix() {
    return this._projection_matrix;
  }

  get camera_matrix() {
    return this._camera_matrix;
  }

  updateCameraMatrix() {
    this._camera_matrix = this.calculateCameraMatrix();
  }

  updateModelMatrix(): void {
    super.updateModelMatrix();
    this._view_matrix = this.calculateViewMatrix();
    this.updateCameraMatrix();
  }

  updateProjectionMatrix() {
    this._projection_matrix = this.calculatePerspectiveMatrix();
    this.updateCameraMatrix();
  }

  private calculateViewMatrix() {
    return Matrix4.inverse(this._model_matrix);
  }

  private calculatePerspectiveMatrix() {
    return Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
  }

  private calculateCameraMatrix() {
    return Matrix4.multiplay(this._projection_matrix, this._view_matrix);
  }
}

export class Texture {
  private texture: WebGLTexture;

  constructor(image: HTMLImageElement) {
    const new_texture = webgl.createTexture();
    if (!new_texture) {
      console.error("Couldnt init texture!");
      return;
    }
    this.texture = new_texture;

    webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
    webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
    webgl.texParameteri(
      webgl.TEXTURE_2D,
      webgl.TEXTURE_WRAP_S,
      webgl.CLAMP_TO_EDGE
    );
    webgl.texParameteri(
      webgl.TEXTURE_2D,
      webgl.TEXTURE_WRAP_T,
      webgl.CLAMP_TO_EDGE
    );
    webgl.texParameteri(
      webgl.TEXTURE_2D,
      webgl.TEXTURE_MIN_FILTER,
      webgl.NEAREST
    );
    webgl.texParameteri(
      webgl.TEXTURE_2D,
      webgl.TEXTURE_MAG_FILTER,
      webgl.NEAREST
    );

    webgl.texImage2D(
      webgl.TEXTURE_2D,
      0,
      webgl.RGBA,
      webgl.RGBA,
      webgl.UNSIGNED_BYTE,
      image
    );
  }

  bind(slot: number) {
    webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
    webgl.activeTexture(webgl.TEXTURE0 + slot);
  }
}

export class Model {
  private vertex_array: VertexArray;
  private index_buffer: IndexBuffer;
  private shader: Shader;
  private textures: Texture[];

  constructor(
    data: number[],
    data_layout: number[],
    indices: number[],
    shader: Shader,
    textures?: Texture[]
  ) {
    const vertex_buffer = new VertexBuffer();
    vertex_buffer.bufferData(data);

    this.vertex_array = new VertexArray(data_layout);
    this.vertex_array.applyToBuffer(vertex_buffer);

    this.index_buffer = new IndexBuffer();
    this.index_buffer.bufferData(indices);

    this.shader = shader;

    if (textures) {
      this.textures = textures;

      this.shader.bind();
      for (let t = 0; t < this.textures.length; t++) {
        this.shader.setUniform1i(`textures`, t);
        this.textures[t].bind(t);
      }
    } else {
      this.textures = [];
    }
  }

  bind() {
    this.vertex_array.bind();
    this.index_buffer.bind();
    this.shader.bind();
    for (let t = 0; t < this.textures.length; t++) {
      this.textures[t].bind(0);
    }
  }

  draw() {
    webgl.drawElements(
      webgl.TRIANGLES,
      this.index_buffer.size,
      webgl.UNSIGNED_SHORT,
      0
    );
  }
}
