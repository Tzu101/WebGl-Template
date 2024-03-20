#version 300 es
precision highp float;

in vec4 frag_color;
in vec4 frag_position;
out vec4 final_color;

uniform sampler2D textures[8];

void main() {
  final_color = (texture(textures[0], frag_position.xy) + frag_color) / 2.0; 
}