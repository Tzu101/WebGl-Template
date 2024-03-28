import { clamp, interpolate, Vector3 } from "./math.js";
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

enum Direction {
  FORWARD,
  BACKWARD,
  LEFT,
  RIGHT,
  UP,
  DOWN,
}

type KeyMap = Map<Direction, number>;
type KeyFunc = (event: KeyboardEvent) => void;
type MouseFunc = (event: MouseEvent) => void;

const HALF_PI = Math.PI / 2;

export class MovementControler {
  private static keyLogger(keymap: KeyMap, state: number) {
    return (event: KeyboardEvent) => {
      switch (event.key) {
        case KEY.W:
          keymap.set(Direction.FORWARD, state);
          break;
        case KEY.S:
          keymap.set(Direction.BACKWARD, state);
          break;
        case KEY.A:
          keymap.set(Direction.LEFT, state);
          break;
        case KEY.D:
          keymap.set(Direction.RIGHT, state);
          break;
        case KEY.SPACE:
          keymap.set(Direction.UP, state);
          break;
        case KEY.SHIFT:
          keymap.set(Direction.DOWN, state);
          break;
      }
    };
  }

  private target: Node;
  private keymap: KeyMap;
  private mouse_rotation_y: number;
  private mouse_rotation_x: number;
  private mouse_rotation_goal_y: number;
  private mouse_rotation_goal_x: number;
  private is_mouse_lock: boolean;
  private speed: number;
  private sensitivity: number;
  private interpolation: number;

  private onKeyUp: KeyFunc;
  private onKeyDown: KeyFunc;
  private onMouseClick: MouseFunc;
  private onMouseMove: MouseFunc;
  private onPointerLockChange: () => void;

  constructor(
    target: Node,
    speed: number = 1,
    sensitivity: number = 0.01,
    interpolation: number = 0.4
  ) {
    this.target = target;
    this.speed = speed;
    this.sensitivity = sensitivity;
    this.interpolation = interpolation;

    this.keymap = new Map();
    this.keymap.set(Direction.FORWARD, 0);
    this.keymap.set(Direction.BACKWARD, 0);
    this.keymap.set(Direction.LEFT, 0);
    this.keymap.set(Direction.RIGHT, 0);
    this.keymap.set(Direction.UP, 0);
    this.keymap.set(Direction.DOWN, 0);

    this.mouse_rotation_y = 0;
    this.mouse_rotation_x = 0;
    this.mouse_rotation_goal_y = 0;
    this.mouse_rotation_goal_x = 0;
    this.is_mouse_lock = false;

    this.onKeyUp = MovementControler.keyLogger(this.keymap, 0);
    this.onKeyDown = MovementControler.keyLogger(this.keymap, 1);
    this.onMouseClick = async () => {
      if (!this.is_mouse_lock) {
        canvas.requestPointerLock();
      }
    };
    this.onMouseMove = (event: MouseEvent) => {
      if (this.is_mouse_lock) {
        this.mouse_rotation_goal_x -= event.movementY * this.sensitivity;
        this.mouse_rotation_goal_x = clamp(
          this.mouse_rotation_goal_x,
          -HALF_PI,
          HALF_PI
        );
        this.mouse_rotation_goal_y -= event.movementX * this.sensitivity;

        this.mouse_rotation_x = interpolate(
          this.mouse_rotation_x,
          this.mouse_rotation_goal_x,
          this.interpolation
        );
        this.mouse_rotation_y = interpolate(
          this.mouse_rotation_y,
          this.mouse_rotation_goal_y,
          this.interpolation
        );

        this.target.transform.euler_rotation = [
          this.mouse_rotation_x,
          this.mouse_rotation_y,
          0,
        ];
        this.target.updateModelMatrix();
      }
    };
    this.onPointerLockChange = () => {
      this.is_mouse_lock = !this.is_mouse_lock;
    };

    canvas.addEventListener("click", this.onMouseClick);
    canvas.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("pointerlockchange", this.onPointerLockChange);
  }

  destructor() {
    window.removeEventListener("click", this.onMouseClick);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("pointerlockchange", this.onPointerLockChange);
  }

  getMoveDirection(direction: Direction) {
    return this.keymap.get(direction) ?? 0;
  }

  update() {
    const move_x =
      this.getMoveDirection(Direction.RIGHT) -
      this.getMoveDirection(Direction.LEFT);
    const move_y =
      this.getMoveDirection(Direction.UP) -
      this.getMoveDirection(Direction.DOWN);
    const move_z =
      this.getMoveDirection(Direction.BACKWARD) -
      this.getMoveDirection(Direction.FORWARD);

    if (Math.abs(move_x) + Math.abs(move_y) + Math.abs(move_z)) {
      let move = [move_x, 0, move_z];
      move = Vector3.rotateY(move, this.target.transform.euler_rotation[1]);
      move = Vector3.normalize(move);
      move[1] = move_y;

      this.target.transform.translation[0] += move[0] * this.speed;
      this.target.transform.translation[1] += move[1] * this.speed;
      this.target.transform.translation[2] += move[2] * this.speed;
      this.target.updateModelMatrix();
    }
  }
}
