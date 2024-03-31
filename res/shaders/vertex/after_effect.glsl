#version 300 es
precision mediump float;

layout(location = 0) in vec4 u_Position;

out vec2 o_TexCoords;

void main() {
  o_TexCoords = (u_Position.xy + 1.0) * 0.5;
	gl_Position = u_Position;
}