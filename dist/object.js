import { Matrix4, Quaternion } from "./math.js";
import { webgl, IndexBuffer, VertexBuffer, VertexArray, } from "./webgl.js";
class Transform {
    constructor() {
        this._translation = [0, 0, 0];
        this._euler_rotation = [0, 0, 0];
        this._quaternion_rotation = [1, 0, 0, 0];
        this._scale = [1, 1, 1];
    }
    get translation() {
        return this._translation;
    }
    set translation(new_translation) {
        this._translation = [...new_translation];
    }
    get euler_rotation() {
        return this._euler_rotation;
    }
    set euler_rotation(new_rotation) {
        this._euler_rotation = [...new_rotation];
        this._quaternion_rotation = Quaternion.fromEuler(this._euler_rotation);
    }
    get quaternion_rotation() {
        return this._quaternion_rotation;
    }
    set quaternion_rotation(new_rotation) {
        this._quaternion_rotation = [...new_rotation];
        this._euler_rotation = Quaternion.toEuler(this._quaternion_rotation);
    }
    get scale() {
        return this._scale;
    }
    set scale(new_scale) {
        this._scale = [...new_scale];
    }
    rotateX(angle_rad) {
        this._quaternion_rotation = Quaternion.rotateX(this._quaternion_rotation, angle_rad);
        this._euler_rotation = Quaternion.toEuler(this._quaternion_rotation);
    }
    rotateY(angle_rad) {
        this._quaternion_rotation = Quaternion.rotateY(this._quaternion_rotation, angle_rad);
        this._euler_rotation = Quaternion.toEuler(this._quaternion_rotation);
    }
    rotateZ(angle_rad) {
        this._quaternion_rotation = Quaternion.rotateZ(this._quaternion_rotation, angle_rad);
        this._euler_rotation = Quaternion.toEuler(this._quaternion_rotation);
    }
}
export class Node {
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
        const rotation_matrix = Matrix4.rotationFromQuaternion(this._transform.quaternion_rotation);
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
    constructor(fov_rad, aspect, near, far) {
        super();
        this.fov = 0;
        this.aspect = 0;
        this.near = 0;
        this.far = 0;
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
    updateModelMatrix() {
        super.updateModelMatrix();
        this._view_matrix = this.calculateViewMatrix();
        this.updateCameraMatrix();
    }
    updateProjectionMatrix() {
        this._projection_matrix = this.calculatePerspectiveMatrix();
        this.updateCameraMatrix();
    }
    calculateViewMatrix() {
        return Matrix4.inverse(this._model_matrix);
    }
    calculatePerspectiveMatrix() {
        return Matrix4.perspective(this.fov, this.aspect, this.near, this.far);
    }
    calculateCameraMatrix() {
        return Matrix4.multiplay(this._projection_matrix, this._view_matrix);
    }
}
export class Model {
    constructor(data, data_layout, indices, shader) {
        const vertex_buffer = new VertexBuffer();
        vertex_buffer.bufferData(data);
        this.vertex_array = new VertexArray(data_layout);
        this.vertex_array.applyToBuffer(vertex_buffer);
        this.index_buffer = new IndexBuffer();
        this.index_buffer.bufferData(indices);
        this.shader = shader;
    }
    bind() {
        this.vertex_array.bind();
        this.index_buffer.bind();
        this.shader.bind();
    }
    draw() {
        webgl.drawElements(webgl.TRIANGLES, this.index_buffer.size, webgl.UNSIGNED_SHORT, 0);
    }
}
