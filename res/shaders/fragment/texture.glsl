#version 300 es
precision mediump float;

struct DirectionalLight {
  vec3 color;
  vec3 direction;
  float intensity;
};

struct PointLight {
  vec3 color;
  vec3 position;
  float intensity;
};

uniform vec3 u_ViewPosition;
uniform vec3 u_AmbientLight;
uniform int u_DirectionalLightsActive;
uniform DirectionalLight u_DirectionalLights[10];
uniform int u_PointLightsActive;
uniform PointLight u_PointLights[10];
uniform sampler2D u_Textures[8];

in vec3 o_Position;
in vec3 o_Normal;
in vec2 o_TexCoords;

out vec4 o_Color;

vec3 calculateLighting(vec3 normal) {
  vec3 diffuse = vec3(0);
  vec3 specular = vec3(0);
  vec3 view_direction = normalize(u_ViewPosition - o_Position);

  for (int l = 0; l < u_DirectionalLightsActive; l++) {
    DirectionalLight light = u_DirectionalLights[l];
    vec3 light_color = light.color * light.intensity;

    diffuse += light_color * max(0.0, dot(light.direction, normal));

    vec3 specular_vector = normalize(light.direction + view_direction);
    specular += light_color * pow(max(0.0, dot(normal, specular_vector)), 32.0);
  }

  for (int l = 0; l < u_PointLightsActive; l++) {
    PointLight light = u_PointLights[l];
    vec3 light_color = light.color * light.intensity;
    vec3 light_direction = normalize(light.position - o_Position);

    diffuse += light_color * max(0.0, dot(light_direction, normal));

    vec3 specular_vector = normalize(light_direction + view_direction);
    specular += light_color * pow(max(0.0, dot(normal, specular_vector)), 32.0);
  }

  return diffuse + specular;
}

void main() {
  vec3 normal = normalize(o_Normal);

  /*vec3 view_direction = normalize(u_ViewPosition - o_Position);
  vec3 specular_vector = normalize(light_direction + view_direction);
  vec3 specular = light_color * pow(max(0.0, dot(normal, specular_vector)), 32.0);*/

  vec3 lighting = u_AmbientLight + calculateLighting(normal);

  vec4 texel = texture(u_Textures[0], o_TexCoords);
  o_Color = texel * vec4(lighting, 1.0);
}
