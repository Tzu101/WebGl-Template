var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { clamp, interpolate, Vector3 } from "./math.js";
import { canvas } from "./canvas.js";
var KEY;
(function (KEY) {
    KEY["W"] = "w";
    KEY["S"] = "s";
    KEY["A"] = "a";
    KEY["D"] = "d";
    KEY["SPACE"] = " ";
    KEY["SHIFT"] = "Shift";
})(KEY || (KEY = {}));
var Direction;
(function (Direction) {
    Direction[Direction["FORWARD"] = 0] = "FORWARD";
    Direction[Direction["BACKWARD"] = 1] = "BACKWARD";
    Direction[Direction["LEFT"] = 2] = "LEFT";
    Direction[Direction["RIGHT"] = 3] = "RIGHT";
    Direction[Direction["UP"] = 4] = "UP";
    Direction[Direction["DOWN"] = 5] = "DOWN";
})(Direction || (Direction = {}));
const HALF_PI = Math.PI / 2;
export class Controler {
    constructor(target) {
        this.target = target;
    }
    // Returns true if position was changed
    update() {
        return false;
    }
    destructor() {
        throw new Error("Method not implemented");
    }
}
export class RotationControler extends Controler {
    constructor(target, rotation) {
        super(target);
        this.rotation = rotation;
    }
    update() {
        this.target.transform.rotateX(this.rotation[0]);
        this.target.transform.rotateY(this.rotation[1]);
        this.target.transform.rotateZ(this.rotation[2]);
        return true;
    }
    destructor() { }
}
export class MovementControler extends Controler {
    static keyLogger(keymap, state) {
        return (event) => {
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
    constructor(target, speed = 1, sensitivity = 0.01, interpolation = 0.4) {
        super(target);
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
        this.is_mouse_update = false;
        this.onKeyUp = MovementControler.keyLogger(this.keymap, 0);
        this.onKeyDown = MovementControler.keyLogger(this.keymap, 1);
        this.onMouseClick = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.is_mouse_lock) {
                canvas.requestPointerLock();
            }
        });
        this.onMouseMove = (event) => {
            if (!this.is_mouse_lock)
                return;
            this.is_mouse_update = true;
            this.mouse_rotation_goal_x -= event.movementY * this.sensitivity;
            this.mouse_rotation_goal_x = clamp(this.mouse_rotation_goal_x, -HALF_PI, HALF_PI);
            this.mouse_rotation_goal_y -= event.movementX * this.sensitivity;
            this.mouse_rotation_x = interpolate(this.mouse_rotation_x, this.mouse_rotation_goal_x, this.interpolation);
            this.mouse_rotation_y = interpolate(this.mouse_rotation_y, this.mouse_rotation_goal_y, this.interpolation);
            this.target.transform.euler_rotation = [
                this.mouse_rotation_x,
                this.mouse_rotation_y,
                0,
            ];
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
    getMoveDirection(direction) {
        var _a;
        return (_a = this.keymap.get(direction)) !== null && _a !== void 0 ? _a : 0;
    }
    update() {
        const move_x = this.getMoveDirection(Direction.RIGHT) -
            this.getMoveDirection(Direction.LEFT);
        const move_y = this.getMoveDirection(Direction.UP) -
            this.getMoveDirection(Direction.DOWN);
        const move_z = this.getMoveDirection(Direction.BACKWARD) -
            this.getMoveDirection(Direction.FORWARD);
        let is_changed = false;
        if (this.is_mouse_update) {
            this.is_mouse_update = false;
            is_changed = true;
        }
        if (Math.abs(move_x) + Math.abs(move_y) + Math.abs(move_z) == 0) {
            return is_changed;
        }
        is_changed = true;
        let move = [move_x, 0, move_z];
        move = Vector3.rotateY(move, this.target.transform.euler_rotation[1]);
        move = Vector3.normalize(move);
        move[1] = move_y;
        this.target.transform.translation[0] += move[0] * this.speed;
        this.target.transform.translation[1] += move[1] * this.speed;
        this.target.transform.translation[2] += move[2] * this.speed;
        return is_changed;
    }
}
