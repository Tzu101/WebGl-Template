#version 300 es
precision mediump float;

layout(location = 0) in vec4 u_Position;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;

void main() {
	//gl_Position = u_ProjectionMatrix * u_ModelMatrix * u_Position;
	gl_Position = u_Position;
}