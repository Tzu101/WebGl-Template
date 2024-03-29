#version 300 es
precision mediump float;

uniform mat4 u_ProjectionMatrix;
uniform mat4 u_ModelMatrix;

layout(location = 0) in vec4 u_Position;
layout(location = 1) in vec3 u_Normal;
layout(location = 2) in vec2 u_TexCoords;

out vec3 o_Position;
out vec3 o_Normal;
out vec2 o_TexCoords;

void main() {
	o_Position = vec3(u_ModelMatrix * u_Position);
	o_Normal = inverse(transpose(mat3(u_ModelMatrix))) * u_Normal;
	o_TexCoords = u_TexCoords;
	gl_Position = u_ProjectionMatrix * u_ModelMatrix * u_Position;
}