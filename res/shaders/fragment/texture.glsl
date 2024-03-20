#version 300 es
precision highp float;

in vec4 frag_color;
in vec4 frag_position;
out vec4 final_color;

uniform sampler2D textures[8];

void main() {
  vec4 color0 = texture(textures[0], frag_position.xy);
  vec4 color1 = texture(textures[1], frag_position.xy);
  vec4 colott = frag_position.y * color0 + (1.0 - frag_position.y ) * color1;
  final_color = frag_position.x * colott + (1.0 - frag_position.x ) * frag_color;
}