#version 300 es
precision mediump float;

uniform vec3 u_ViewPosition;
uniform vec3 u_AmbientLight;
uniform sampler2D u_Textures[8];

in vec3 o_Position;
in vec3 o_Normal;
in vec2 o_TexCoords;

out vec4 o_Color;

void main() {
  vec3 normal = normalize(o_Normal);

  vec3 light_color = vec3(0, 1.0, 0);
  vec3 light_position = vec3(501.0, 0, 0);
  vec3 light_direction = normalize(light_position - o_Position);

  vec3 diffuse = light_color * max(0.0, dot(light_direction, normal));

  vec3 view_direction = normalize(u_ViewPosition - o_Position);
  vec3 specular_vector = normalize(light_direction + view_direction);
  vec3 specular = light_color * pow(max(0.0, dot(normal, specular_vector)), 32.0);

  vec3 light = u_AmbientLight + diffuse + specular;

  vec4 texel = texture(u_Textures[0], o_TexCoords);
  o_Color = texel * vec4(light, 1.0);
}
