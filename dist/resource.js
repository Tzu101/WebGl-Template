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
export function loadModel(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield fetchData(url);
        const dataJson = yield data.json();
        return {
            vertices: dataJson.meshes[0].vertices,
            indices: [].concat.apply([], dataJson.meshes[0].faces),
            normals: dataJson.meshes[0].normals,
            texcoords: dataJson.meshes[0].texturecoords[0],
        };
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
