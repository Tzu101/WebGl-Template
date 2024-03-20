var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Vector3 } from "./math.js";
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
var DIRECTION;
(function (DIRECTION) {
    DIRECTION[DIRECTION["FORWARD"] = 0] = "FORWARD";
    DIRECTION[DIRECTION["BACKWARD"] = 1] = "BACKWARD";
    DIRECTION[DIRECTION["LEFT"] = 2] = "LEFT";
    DIRECTION[DIRECTION["RIGHT"] = 3] = "RIGHT";
    DIRECTION[DIRECTION["UP"] = 4] = "UP";
    DIRECTION[DIRECTION["DOWN"] = 5] = "DOWN";
})(DIRECTION || (DIRECTION = {}));
export class MovementControler {
    static keyLogger(keymap, state) {
        return (event) => {
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
    constructor(target) {
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
        this.mouse_pointer_ref = () => __awaiter(this, void 0, void 0, function* () {
            if (!this.is_mouse_lock) {
                canvas.requestPointerLock();
            }
        });
        this.mouse_move_ref = (event) => {
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
