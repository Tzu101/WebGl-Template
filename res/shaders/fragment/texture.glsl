#version 300 es
precision mediump float;

uniform vec3 u_AmbientLight;
uniform sampler2D u_Textures[8];

in vec2 o_TexCoords;

out vec4 o_Color;

void main() {
  o_Color = texture(u_Textures[0], o_TexCoords) + vec4(u_AmbientLight, 1.0);
}
