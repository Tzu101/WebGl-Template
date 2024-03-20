import { Vector3 } from "./math.js";
import { canvas } from "./canvas.js";
import { Node } from "./object.js";

enum KEY {
  W = "w",
  S = "s",
  A = "a",
  D = "d",
  SPACE = " ",
  SHIFT = "Shift",
}

enum DIRECTION {
  FORWARD,
  BACKWARD,
  LEFT,
  RIGHT,
  UP,
  DOWN,
}

type KeyMap = Map<DIRECTION, boolean>;

export class MovementControler {
  private static keyLogger(keymap: KeyMap, state: boolean) {
    return (event: KeyboardEvent) => {
      switch (event.key) {
        case KEY.W:
          keymap.set(DIRECTION.FORWARD, state);
          break;
        case KEY.S:
          keymap.set(DIRECTION.BACKWARD, state);
          break;
        case KEY.A:
          keymap.set(DIRECTION.LEFT, state);
          break;
        case KEY.D:
          keymap.set(DIRECTION.RIGHT, state);
          break;
        case KEY.SPACE:
          keymap.set(DIRECTION.UP, state);
          break;
        case KEY.SHIFT:
          keymap.set(DIRECTION.DOWN, state);
          break;
      }
    };
  }

  private target: Node;
  private keymap: KeyMap;
  private keyup_ref: (event: KeyboardEvent) => void;
  private keydown_ref: (event: KeyboardEvent) => void;
  private mouse_pointer_ref: (event: MouseEvent) => void;
  private mouse_move_ref: (event: MouseEvent) => void;

  private mouse_rotation_y: number;
  private is_mouse_lock: boolean;

  constructor(target: Node) {
    this.target = target;
    this.keymap = new Map();
    this.keymap.set(DIRECTION.FORWARD, false);
    this.keymap.set(DIRECTION.BACKWARD, false);
    this.keymap.set(DIRECTION.LEFT, false);
    this.keymap.set(DIRECTION.RIGHT, false);
    this.keymap.set(DIRECTION.UP, false);
    this.keymap.set(DIRECTION.DOWN, false);

    this.mouse_rotation_y = 0;
    this.is_mouse_lock = false;

    this.keyup_ref = MovementControler.keyLogger(this.keymap, false);
    this.keydown_ref = MovementControler.keyLogger(this.keymap, true);
    this.mouse_pointer_ref = async () => {
      if (!this.is_mouse_lock) {
        canvas.requestPointerLock();
      }
    };
    this.mouse_move_ref = (event: MouseEvent) => {
      if (this.is_mouse_lock) {
        this.target.transform.rotateY(-event.movementX * 0.01);
        this.mouse_rotation_y -= event.movementY * 0.01;
        this.target.transform.euler_rotation = [
          this.mouse_rotation_y,
          this.target.transform.euler_rotation[1],
          0,
        ];
      }
    };

    canvas.addEventListener("click", this.mouse_pointer_ref);

    document.addEventListener("pointerlockchange", () => {
      this.is_mouse_lock = !this.is_mouse_lock;
    });
    canvas.addEventListener("mousemove", this.mouse_move_ref);

    window.addEventListener("keyup", this.keyup_ref);
    window.addEventListener("keydown", this.keydown_ref);
  }

  destructor() {
    window.removeEventListener("click", this.mouse_pointer_ref);
    window.removeEventListener("mousemove", this.mouse_move_ref);
    window.removeEventListener("keyup", this.keyup_ref);
    window.removeEventListener("keydown", this.keydown_ref);
  }

  update() {
    let move = [
      // @ts-ignore
      this.keymap.get(DIRECTION.RIGHT) - this.keymap.get(DIRECTION.LEFT),
      0,
      // @ts-ignore
      this.keymap.get(DIRECTION.BACKWARD) - this.keymap.get(DIRECTION.FORWARD),
    ];

    move = Vector3.rotateY(move, this.target.transform.euler_rotation[1]);
    move = Vector3.normalize(move);
    // @ts-ignore
    move[1] = this.keymap.get(DIRECTION.UP) - this.keymap.get(DIRECTION.DOWN);

    this.target.transform.translation[0] += move[0];
    this.target.transform.translation[1] += move[1];
    this.target.transform.translation[2] += move[2];
  }
}
