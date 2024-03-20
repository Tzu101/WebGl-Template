export let canvas: HTMLCanvasElement;

export function canvasInit(): boolean {
  const canvas_element = document.getElementById("canvas");

  if (!(canvas_element instanceof HTMLCanvasElement)) {
    return false;
  }

  canvas = canvas_element;
  resizeCanvas();
  return true;
}

function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}

window.addEventListener("resize", resizeCanvas);
