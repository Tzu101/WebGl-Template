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
export async function loadModel(url: string): Promise<ModelData> {
  const data = await fetchData(url);
  const dataJson = await data.json();
  return {
    vertices: dataJson.meshes[0].vertices,
    indices: [].concat.apply([], dataJson.meshes[0].faces),
    normals: dataJson.meshes[0].normals,
    texcoords: dataJson.meshes[0].texturecoords[0],
  };
}

export async function loadImage(url: string) {
  const texture = new Image();
  texture.src = url;
  await texture.decode();
  return texture;
}
