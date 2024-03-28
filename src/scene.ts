import { Shader } from "./webgl.js";
import { Node, Camera } from "./object.js";

export class Scene {
  private root_node: Node;
  private camera: Camera;
  private active_sahders: Map<Shader, number>;

  // TODO: environment, lights

  constructor() {}
}
