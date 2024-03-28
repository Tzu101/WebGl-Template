#version 300 es
precision mediump float;

layout(location = 0) in vec4 position;
layout(location = 1) in vec2 uv;

uniform mat4 proj_mat;
uniform mat4 model_mat;

out vec2 uv_position;

void main() {
	uv_position = uv;
	gl_Position = proj_mat * model_mat * position;
}