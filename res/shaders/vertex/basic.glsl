#version 300 es
precision highp float;

layout(location = 0) in vec4 position;
layout(location = 1) in vec4 color;

uniform mat4 proj_mat;
uniform mat4 model_mat;

out vec4 frag_color;
out vec4 frag_position;

void main() {
	frag_color = color;
	frag_position = position + vec4(0.5);
	gl_Position = proj_mat * model_mat * position;
}