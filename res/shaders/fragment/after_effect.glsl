#version 300 es
precision mediump float;

uniform sampler2D u_Texture;
uniform float u_Timer;

in vec2 o_TexCoords;

out vec4 o_Color;

void main() {
  /*float offset = u_Blur;

  vec4 texel1 = texture(u_Texture, o_TexCoords + vec2(0.0, 0.0));
  vec4 texel2 = texture(u_Texture, o_TexCoords + vec2(0.0, -offset));
  vec4 texel3 = texture(u_Texture, o_TexCoords + vec2(-offset, 0.0));
  vec4 texel4 = texture(u_Texture, o_TexCoords + vec2(-offset, -offset));
  vec4 texel5 = texture(u_Texture, o_TexCoords + vec2(0.0, offset));
  vec4 texel6 = texture(u_Texture, o_TexCoords + vec2(offset, 0.0));
  vec4 texel7 = texture(u_Texture, o_TexCoords + vec2(offset, offset));
  vec4 texel8 = texture(u_Texture, o_TexCoords + vec2(offset, -offset));
  vec4 texel9 = texture(u_Texture, o_TexCoords + vec2(-offset, offset));
  
  o_Color = (texel1 + texel2 + texel3 + texel4 + texel5 + texel6 + texel7 + texel8 + texel9) / 9.0;*/
  
  o_Color = texture(u_Texture, o_TexCoords) - vec4(vec3(u_Timer), 0.0);
}
