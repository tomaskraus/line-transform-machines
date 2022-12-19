"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maplinemachine_1 = require("../src/maplinemachine");
// our callback that can throw error
const normalizeNumbers = (s) => {
    const num = parseInt(s);
    if (isNaN(num))
        throw new Error(`Not a number: ${s}`);
    return num.toString();
};
const lineMachine = (0, maplinemachine_1.createMapLineMachine)(normalizeNumbers);
const runner = async () => {
    try {
        await lineMachine('./examples/nums.txt', './examples/normalized.txt');
    }
    catch (err) {
        console.error(err);
    }
};
runner();
//# sourceMappingURL=error-example.js.map