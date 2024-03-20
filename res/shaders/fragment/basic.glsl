#version 300 es
precision highp float;

in vec4 frag_color;
out vec4 final_color;

void main() {
	final_color = frag_color;
}
