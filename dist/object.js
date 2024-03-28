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
    static combineTranslations(translation_a, translation_b) {
        return [
            translation_a[0] + translation_b[0],
            translation_a[1] + translation_b[1],
            translation_a[2] + translation_b[2],
        ];
    }
    static combineQuaternionRotations(rotation_a, rotation_b) {
        return Quaternion.multiply(rotation_a, rotation_b);
    }
    static combineScales(scale_a, scale_b) {
        return [
            scale_a[0] * scale_b[0],
            scale_a[1] * scale_b[1],
            scale_a[2] * scale_b[2],
        ];
    }
    static combineTransforms(transform_a, transform_b) {
        const translation = Transform.combineTranslations(transform_a.translation, transform_b.translation);
        const quaternion_rotation = Transform.combineQuaternionRotations(transform_b.quaternion_rotation, transform_a.quaternion_rotation);
        const scale = Transform.combineScales(transform_a.scale, transform_b.scale);
        const combined_transform = new Transform();
        combined_transform.translation = translation;
        combined_transform.quaternion_rotation = quaternion_rotation;
        combined_transform.scale = scale;
        return combined_transform;
    }
}
export class Node {
    constructor() {
        this._local_transform = new Transform();
        this._root_transform = new Transform();
        this._model_matrix = Matrix4.identity();
        this.children = [];
    }
    get transform() {
        return this._local_transform;
    }
    set root_transform(root_transform) {
        this._root_transform = root_transform;
    }
    get global_transform() {
        return Transform.combineTransforms(this._local_transform, this._root_transform);
    }
    get model_matrix() {
        return this._model_matrix;
    }
    updateModelMatrix() {
        let new_matrix = Matrix4.identity();
        const global_transform = this.global_transform;
        const translation_matrix = Matrix4.translation(global_transform.translation);
        const rotation_matrix = Matrix4.rotationFromQuaternion(global_transform.quaternion_rotation);
        const scale_matrix = Matrix4.scaling(global_transform.scale);
        new_matrix = Matrix4.multiplay(new_matrix, translation_matrix);
        new_matrix = Matrix4.multiplay(new_matrix, rotation_matrix);
        new_matrix = Matrix4.multiplay(new_matrix, scale_matrix);
        this._model_matrix = new_matrix;
        for (const child of this.children) {
            child.root_transform = global_transform;
            child.updateModelMatrix();
        }
    }
    addChild(child) {
        this.children.push(child);
        child.root_transform = this.global_transform;
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
export class Texture {
    constructor(image) {
        const new_texture = webgl.createTexture();
        if (!new_texture) {
            return;
        }
        this.texture = new_texture;
        webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
        //webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, true);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MIN_FILTER, webgl.NEAREST);
        webgl.texParameteri(webgl.TEXTURE_2D, webgl.TEXTURE_MAG_FILTER, webgl.NEAREST);
        webgl.texImage2D(webgl.TEXTURE_2D, 0, webgl.RGBA, webgl.RGBA, webgl.UNSIGNED_BYTE, image);
    }
    bind(slot) {
        webgl.activeTexture(webgl.TEXTURE0 + slot);
        webgl.bindTexture(webgl.TEXTURE_2D, this.texture);
    }
}
export class Material {
    constructor(shader, textures) {
        this.shader = shader;
        this.textures = textures;
        this.shader.bind();
        for (let t = 0; t < this.textures.length; t++) {
            this.shader.setUniform1i(`textures[${t}]`, t);
        }
    }
    bind() {
        this.shader.bind();
        for (let t = 0; t < this.textures.length; t++) {
            this.textures[t].bind(t);
        }
    }
}
export class Model {
    constructor(data, data_layout, indices, material) {
        this.vertex_array = new VertexArray(data_layout);
        if (Array.isArray(data[0])) {
            data = data;
            const vertexBuffers = [];
            for (const vertex_data of data) {
                const vertex_buffer = new VertexBuffer();
                vertex_buffer.bufferData(vertex_data);
                vertexBuffers.push(vertex_buffer);
            }
            this.vertex_array.applyToBuffers(vertexBuffers);
        }
        else {
            data = data;
            const vertex_buffer = new VertexBuffer();
            vertex_buffer.bufferData(data);
            this.vertex_array.applyToBuffer(vertex_buffer);
        }
        this.index_buffer = new IndexBuffer();
        this.index_buffer.bufferData(indices);
        this.material = material;
    }
    bind() {
        this.vertex_array.bind();
        this.index_buffer.bind();
        this.material.bind();
    }
    draw() {
        webgl.drawElements(webgl.TRIANGLES, this.index_buffer.size, webgl.UNSIGNED_SHORT, 0);
    }
}
