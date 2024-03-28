#version 300 es
precision mediump float;

in vec2 uv_position;
out vec4 final_color;

uniform sampler2D textures[8];

void main() {
  final_color = texture(textures[0], uv_position);
}
