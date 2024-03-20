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

export async function loadImage(url: string) {
  const texture = new Image();
  texture.src = url;
  await texture.decode();
  return texture;
}
