async function fetchData(url: string) {
  return fetch(url);
}

export async function loadText(url: string) {
  const data = await fetchData(url);
  return await data.text();
}

export async function loadJson(url: string) {
  const data = await fetchData(url);
  return await data.json();
}

type ModelData = {
  vertices: number[];
  indices: number[];
  normals: number[];
  texcoords: number[];
};
export async function loadModels(url: string): Promise<ModelData[]> {
  const data = await fetchData(url);
  const dataJson = await data.json();

  const models: ModelData[] = [];
  for (const mesh of dataJson.meshes) {
    models.push({
      vertices: mesh.vertices,
      indices: [].concat.apply([], mesh.faces),
      normals: mesh.normals,
      texcoords: mesh.texturecoords[0],
    });
  }
  return models;
}

export async function loadImage(url: string) {
  const texture = new Image();
  texture.src = url;
  await texture.decode();
  return texture;
}
