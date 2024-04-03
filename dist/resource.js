var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function fetchData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        return fetch(url);
    });
}
export function loadText(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fetchData(url);
        return yield data.text();
    });
}
export function loadJson(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fetchData(url);
        return yield data.json();
    });
}
export function loadModels(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fetchData(url);
        const dataJson = yield data.json();
        const models = [];
        for (const mesh of dataJson.meshes) {
            models.push({
                vertices: mesh.vertices,
                indices: [].concat.apply([], mesh.faces),
                normals: mesh.normals,
                texcoords: mesh.texturecoords[0],
            });
        }
        return models;
    });
}
export function loadImage(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const texture = new Image();
        texture.src = url;
        yield texture.decode();
        return texture;
    });
}
export class ResourceLoader {
    constructor() {
        this.text_queue = [];
        this.json_queue = [];
        this.models_queue = [];
        this.image_queue = [];
        this.loaded_text = [];
        this.loaded_json = [];
        this.loaded_models = [];
        this.loaded_image = [];
        this.is_loading = true;
    }
    loadResources() {
        return __awaiter(this, void 0, void 0, function* () {
            const loaded_data = yield Promise.all([
                this.text_queue,
                this.json_queue,
                this.models_queue,
                this.image_queue,
            ].map(Promise.all.bind(Promise)));
            this.is_loading = false;
            this.loaded_text = loaded_data[0];
            this.loaded_json = loaded_data[1];
            this.loaded_models = loaded_data[2];
            this.loaded_image = loaded_data[3];
        });
    }
    requestText(url) {
        this.text_queue.push(loadText(url));
        return this.text_queue.length - 1;
    }
    requestJson(url) {
        this.json_queue.push(loadJson(url));
        return this.json_queue.length - 1;
    }
    requestModels(url) {
        this.models_queue.push(loadModels(url));
        return this.models_queue.length - 1;
    }
    requestImage(url) {
        this.image_queue.push(loadImage(url));
        return this.image_queue.length - 1;
    }
    throwReciveError() {
        throw new Error("Still loading resources!");
    }
    reciveText(index) {
        if (this.is_loading) {
            this.throwReciveError();
        }
        return this.loaded_text[index];
    }
    reciveJson(index) {
        if (this.is_loading) {
            this.throwReciveError();
        }
        return this.loaded_json[index];
    }
    reciveModels(index) {
        if (this.is_loading) {
            this.throwReciveError();
        }
        return this.loaded_models[index];
    }
    reciveImage(index) {
        if (this.is_loading) {
            this.throwReciveError();
        }
        return this.loaded_image[index];
    }
}
