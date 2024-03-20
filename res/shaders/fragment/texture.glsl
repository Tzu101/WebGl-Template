#version 300 es
precision highp float;

in vec4 frag_color;
in vec4 frag_position;
out vec4 final_color;

uniform sampler2D texture0;
uniform sampler2D texture1;

void main() {
	//final_color = vec4(vec3(1.0) - frag_color.rgb, 1.0);
  final_color = texture(texture0, frag_position.xy); 
  //final_color = (texture(textures[1], frag_position.xy) + frag_color) / 2.0; 
}