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

export class ResourceLoader {
  private text_queue: Promise<string>[] = [];
  private json_queue: Promise<any>[] = [];
  private models_queue: Promise<ModelData[]>[] = [];
  private image_queue: Promise<HTMLImageElement>[] = [];

  private loaded_text: string[] = [];
  private loaded_json: any[] = [];
  private loaded_models: ModelData[][] = [];
  private loaded_image: HTMLImageElement[] = [];

  private is_loading = true;

  constructor() {}

  async loadResources() {
    const loaded_data = await Promise.all(
      [
        this.text_queue,
        this.json_queue,
        this.models_queue,
        this.image_queue,
      ].map(Promise.all.bind(Promise))
    );
    this.is_loading = false;

    this.loaded_text = loaded_data[0] as string[];
    this.loaded_json = loaded_data[1] as any[];
    this.loaded_models = loaded_data[2] as ModelData[][];
    this.loaded_image = loaded_data[3] as HTMLImageElement[];
  }

  requestText(url: string) {
    this.text_queue.push(loadText(url));
    return this.text_queue.length - 1;
  }

  requestJson(url: string) {
    this.json_queue.push(loadJson(url));
    return this.json_queue.length - 1;
  }

  requestModels(url: string) {
    this.models_queue.push(loadModels(url));
    return this.models_queue.length - 1;
  }

  requestImage(url: string) {
    this.image_queue.push(loadImage(url));
    return this.image_queue.length - 1;
  }

  throwReciveError() {
    throw new Error("Still loading resources!");
  }

  reciveText(index: number) {
    if (this.is_loading) {
      this.throwReciveError();
    }
    return this.loaded_text[index];
  }

  reciveJson(index: number) {
    if (this.is_loading) {
      this.throwReciveError();
    }
    return this.loaded_json[index];
  }

  reciveModels(index: number) {
    if (this.is_loading) {
      this.throwReciveError();
    }
    return this.loaded_models[index];
  }

  reciveImage(index: number) {
    if (this.is_loading) {
      this.throwReciveError();
    }
    return this.loaded_image[index];
  }
}
