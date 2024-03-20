export class Vector3 {
    static normalize(vector) {
        const length = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1] + vector[2] * vector[2]);
        if (length === 0) {
            return vector;
        }
        return [vector[0] / length, vector[1] / length, vector[2] / length];
    }
    static rotateY(vector, angle_rad) {
        const angle_sin = Math.sin(angle_rad);
        const angle_cos = Math.cos(angle_rad);
        const x = vector[0];
        const y = vector[1];
        const z = vector[2];
        return [x * angle_cos + z * angle_sin, y, -x * angle_sin + z * angle_cos];
    }
}
export class Quaternion {
    static normalize(quaternion) {
        const size = Math.sqrt(quaternion[0] * quaternion[0] +
            quaternion[1] * quaternion[1] +
            quaternion[2] * quaternion[2] +
            quaternion[3] * quaternion[3]);
        return [
            quaternion[0] / size,
            quaternion[1] / size,
            quaternion[2] / size,
            quaternion[3] / size,
        ];
    }
    static multiply(quaternion_a, quaternion_b) {
        const wa = quaternion_a[0];
        const xa = quaternion_a[1];
        const ya = quaternion_a[2];
        const za = quaternion_a[3];
        const wb = quaternion_b[0];
        const xb = quaternion_b[1];
        const yb = quaternion_b[2];
        const zb = quaternion_b[3];
        const w = wa * wb - xa * xb - ya * yb - za * zb;
        const x = wa * xb + xa * wb + ya * zb - za * yb;
        const y = wa * yb - xa * zb + ya * wb + za * xb;
        const z = wa * zb + xa * yb - ya * xb + za * wb;
        return [w, x, y, z];
    }
    static rotateAxis(quaternion, axis, angle_rad) {
        const angle_half = angle_rad / 2;
        const angle_sin = Math.sin(angle_half);
        const quaternion_axis = Quaternion.normalize([
            Math.cos(angle_half),
            axis[0] * angle_sin,
            axis[1] * angle_sin,
            axis[2] * angle_sin,
        ]);
        return Quaternion.multiply(quaternion_axis, quaternion);
    }
    static rotateX(quaternion, angle_rad) {
        const angle_half = angle_rad / 2;
        const quaternion_x = Quaternion.normalize([
            Math.cos(angle_half),
            Math.sin(angle_half),
            0,
            0,
        ]);
        return Quaternion.multiply(quaternion_x, quaternion);
    }
    static rotateY(quaternion, angle_rad) {
        const angle_half = angle_rad / 2;
        const quaternion_y = Quaternion.normalize([
            Math.cos(angle_half),
            0,
            Math.sin(angle_half),
            0,
        ]);
        return Quaternion.multiply(quaternion_y, quaternion);
    }
    static rotateZ(quaternion, angle_rad) {
        const angle_half = angle_rad / 2;
        const quaternion_z = Quaternion.normalize([
            Math.cos(angle_half),
            0,
            0,
            Math.sin(angle_half),
        ]);
        return Quaternion.multiply(quaternion_z, quaternion);
    }
    static toEuler(quaternion) {
        const w = quaternion[0];
        const x = quaternion[1];
        const y = quaternion[2];
        const z = quaternion[3];
        const sinr_cosp = 2 * (w * x + y * z);
        const cosr_cosp = 1 - 2 * (x * x + y * y);
        const x_axis = Math.atan2(sinr_cosp, cosr_cosp);
        const sinp = Math.sqrt(1 + 2 * (w * y - x * z));
        const cosp = Math.sqrt(1 - 2 * (w * y - x * z));
        const y_axis = 2 * Math.atan2(sinp, cosp) - Math.PI / 2;
        const siny_cosp = 2 * (w * z + x * y);
        const cosy_cosp = 1 - 2 * (y * y + z * z);
        const z_axis = Math.atan2(siny_cosp, cosy_cosp);
        return [x_axis, y_axis, z_axis];
    }
    static fromEuler(euler) {
        const cr = Math.cos(euler[0] / 2);
        const sr = Math.sin(euler[0] / 2);
        const cp = Math.cos(euler[1] / 2);
        const sp = Math.sin(euler[1] / 2);
        const cy = Math.cos(euler[2] / 2);
        const sy = Math.sin(euler[2] / 2);
        const qw = cr * cp * cy + sr * sp * sy;
        const qx = sr * cp * cy - cr * sp * sy;
        const qy = cr * sp * cy + sr * cp * sy;
        const qz = cr * cp * sy - sr * sp * cy;
        return [qw, qx, qy, qz];
    }
}
export class Matrix4 {
    static identity() {
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    }
    static translation(translation_vector) {
        return [
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
            0,
            translation_vector[0],
            translation_vector[1],
            translation_vector[2],
            1,
        ];
    }
    static rotationX(angle_rad) {
        const angle_sin = Math.sin(angle_rad);
        const angle_cos = Math.cos(angle_rad);
        return [
            1,
            0,
            0,
            0,
            0,
            angle_cos,
            angle_sin,
            0,
            0,
            -angle_sin,
            angle_cos,
            0,
            0,
            0,
            0,
            1,
        ];
    }
    static rotationY(angle_rad) {
        const angle_sin = Math.sin(angle_rad);
        const angle_cos = Math.cos(angle_rad);
        return [
            angle_cos,
            0,
            -angle_sin,
            0,
            0,
            1,
            0,
            0,
            angle_sin,
            0,
            angle_cos,
            0,
            0,
            0,
            0,
            1,
        ];
    }
    static rotationZ(angle_rad) {
        const angle_sin = Math.sin(angle_rad);
        const angle_cos = Math.cos(angle_rad);
        return [
            angle_cos,
            angle_sin,
            0,
            0,
            -angle_sin,
            angle_cos,
            0,
            0,
            0,
            0,
            1,
            0,
            0,
            0,
            0,
            1,
        ];
    }
    static rotationFromQuaternion(quaternion) {
        const ww = quaternion[0] * quaternion[0];
        const xx = quaternion[1] * quaternion[1];
        const yy = quaternion[2] * quaternion[2];
        const zz = quaternion[3] * quaternion[3];
        const wx = quaternion[0] * quaternion[1];
        const wy = quaternion[0] * quaternion[2];
        const wz = quaternion[0] * quaternion[3];
        const xy = quaternion[1] * quaternion[2];
        const xz = quaternion[1] * quaternion[3];
        const yz = quaternion[2] * quaternion[3];
        return [
            2 * (ww + xx) - 1,
            2 * (xy + wz),
            2 * (xz - wy),
            0,
            2 * (xy - wz),
            2 * (ww + yy) - 1,
            2 * (yz + wx),
            0,
            2 * (xz + wy),
            2 * (yz - wx),
            2 * (ww + zz) - 1,
            0,
            0,
            0,
            0,
            1,
        ];
    }
    static scaling(scale_vector) {
        return [
            scale_vector[0],
            0,
            0,
            0,
            0,
            scale_vector[1],
            0,
            0,
            0,
            0,
            scale_vector[2],
            0,
            0,
            0,
            0,
            1,
        ];
    }
    static multiplay(matrix_a, matrix_b) {
        const a00 = matrix_a[0];
        const a01 = matrix_a[1];
        const a02 = matrix_a[2];
        const a03 = matrix_a[3];
        const a10 = matrix_a[4];
        const a11 = matrix_a[5];
        const a12 = matrix_a[6];
        const a13 = matrix_a[7];
        const a20 = matrix_a[8];
        const a21 = matrix_a[9];
        const a22 = matrix_a[10];
        const a23 = matrix_a[11];
        const a30 = matrix_a[12];
        const a31 = matrix_a[13];
        const a32 = matrix_a[14];
        const a33 = matrix_a[15];
        const b00 = matrix_b[0];
        const b01 = matrix_b[1];
        const b02 = matrix_b[2];
        const b03 = matrix_b[3];
        const b10 = matrix_b[4];
        const b11 = matrix_b[5];
        const b12 = matrix_b[6];
        const b13 = matrix_b[7];
        const b20 = matrix_b[8];
        const b21 = matrix_b[9];
        const b22 = matrix_b[10];
        const b23 = matrix_b[11];
        const b30 = matrix_b[12];
        const b31 = matrix_b[13];
        const b32 = matrix_b[14];
        const b33 = matrix_b[15];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
    }
    static inverse(matrix) {
        const m00 = matrix[0];
        const m01 = matrix[1];
        const m02 = matrix[2];
        const m03 = matrix[3];
        const m10 = matrix[4];
        const m11 = matrix[5];
        const m12 = matrix[6];
        const m13 = matrix[7];
        const m20 = matrix[8];
        const m21 = matrix[9];
        const m22 = matrix[10];
        const m23 = matrix[11];
        const m30 = matrix[12];
        const m31 = matrix[13];
        const m32 = matrix[14];
        const m33 = matrix[15];
        const determinant = m00 *
            (m11 * m22 * m33 +
                m12 * m23 * m31 +
                m13 * m21 * m32 -
                m13 * m22 * m31 -
                m12 * m21 * m33 -
                m11 * m23 * m32) -
            m01 *
                (m10 * m22 * m33 +
                    m12 * m23 * m30 +
                    m13 * m20 * m32 -
                    m13 * m22 * m30 -
                    m12 * m20 * m33 -
                    m10 * m23 * m32) +
            m02 *
                (m10 * m21 * m33 +
                    m11 * m23 * m30 +
                    m13 * m20 * m31 -
                    m13 * m21 * m30 -
                    m11 * m20 * m33 -
                    m10 * m23 * m31) -
            m03 *
                (m10 * m21 * m32 +
                    m11 * m22 * m30 +
                    m12 * m20 * m31 -
                    m12 * m21 * m30 -
                    m11 * m20 * m32 -
                    m10 * m22 * m31);
        if (determinant === 0) {
            console.error("Cannot invert matrix");
        }
        const inverse_determinant = 1 / determinant;
        return [
            (m11 * m22 * m33 +
                m12 * m23 * m31 +
                m13 * m21 * m32 -
                m13 * m22 * m31 -
                m12 * m21 * m33 -
                m11 * m23 * m32) *
                inverse_determinant,
            (m01 * m22 * m33 +
                m02 * m23 * m31 +
                m03 * m21 * m32 -
                m03 * m22 * m31 -
                m02 * m21 * m33 -
                m01 * m23 * m32) *
                -inverse_determinant,
            (m01 * m12 * m33 +
                m02 * m13 * m31 +
                m03 * m11 * m32 -
                m03 * m12 * m31 -
                m02 * m11 * m33 -
                m01 * m13 * m32) *
                inverse_determinant,
            (m01 * m12 * m23 +
                m02 * m13 * m21 +
                m03 * m11 * m22 -
                m03 * m12 * m21 -
                m02 * m11 * m23 -
                m01 * m13 * m22) *
                -inverse_determinant,
            (m10 * m22 * m33 +
                m12 * m23 * m30 +
                m13 * m20 * m32 -
                m13 * m22 * m30 -
                m12 * m20 * m33 -
                m10 * m23 * m32) *
                -inverse_determinant,
            (m00 * m22 * m33 +
                m02 * m23 * m30 +
                m03 * m20 * m32 -
                m03 * m22 * m30 -
                m02 * m20 * m33 -
                m00 * m23 * m32) *
                inverse_determinant,
            (m00 * m12 * m33 +
                m02 * m13 * m30 +
                m03 * m10 * m32 -
                m03 * m12 * m30 -
                m02 * m10 * m33 -
                m00 * m13 * m32) *
                -inverse_determinant,
            (m00 * m12 * m23 +
                m02 * m13 * m20 +
                m03 * m10 * m22 -
                m03 * m12 * m20 -
                m02 * m10 * m23 -
                m00 * m13 * m22) *
                inverse_determinant,
            (m10 * m21 * m33 +
                m11 * m23 * m30 +
                m13 * m20 * m31 -
                m13 * m21 * m30 -
                m11 * m20 * m33 -
                m10 * m23 * m31) *
                inverse_determinant,
            (m00 * m21 * m33 +
                m01 * m23 * m30 +
                m03 * m20 * m31 -
                m03 * m21 * m30 -
                m01 * m20 * m33 -
                m00 * m23 * m31) *
                -inverse_determinant,
            (m00 * m11 * m33 +
                m01 * m13 * m30 +
                m03 * m10 * m31 -
                m03 * m11 * m30 -
                m01 * m10 * m33 -
                m00 * m13 * m31) *
                inverse_determinant,
            (m00 * m11 * m23 +
                m01 * m13 * m20 +
                m03 * m10 * m21 -
                m03 * m11 * m20 -
                m01 * m10 * m23 -
                m00 * m13 * m21) *
                -inverse_determinant,
            (m10 * m21 * m32 +
                m11 * m22 * m30 +
                m12 * m20 * m31 -
                m12 * m21 * m30 -
                m11 * m20 * m32 -
                m10 * m22 * m31) *
                -inverse_determinant,
            (m00 * m21 * m32 +
                m01 * m22 * m30 +
                m02 * m20 * m31 -
                m02 * m21 * m30 -
                m01 * m20 * m32 -
                m00 * m22 * m31) *
                inverse_determinant,
            (m00 * m11 * m32 +
                m01 * m12 * m30 +
                m02 * m10 * m31 -
                m02 * m11 * m30 -
                m01 * m10 * m32 -
                m00 * m12 * m31) *
                -inverse_determinant,
            (m00 * m11 * m22 +
                m01 * m12 * m20 +
                m02 * m10 * m21 -
                m02 * m11 * m20 -
                m01 * m10 * m22 -
                m00 * m12 * m21) *
                inverse_determinant,
        ];
    }
    static orthographic(left, right, bottom, top, near, far) {
        const right_minus_left = right - left;
        const top_minus_bottom = top - bottom;
        const far_minus_near = far - near;
        return [
            2 / right_minus_left,
            0,
            0,
            0,
            0,
            2 / top_minus_bottom,
            0,
            0,
            0,
            0,
            -2 / far_minus_near,
            0,
            -(right + left) / right_minus_left,
            -(top + bottom) / top_minus_bottom,
            -(far + near) / far_minus_near,
            1,
        ];
    }
    static perspective_temp(f) {
        return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, f, 0, 0, 0, 1];
    }
    static perspective(fov_rad, aspect, near, far) {
        var f = Math.tan(Math.PI * 0.5 - 0.5 * fov_rad);
        var range = 1.0 / (near - far);
        return [
            f / aspect,
            0,
            0,
            0,
            0,
            f,
            0,
            0,
            0,
            0,
            (near + far) * range,
            -1,
            0,
            0,
            2 * near * far * range,
            0,
        ];
    }
}
