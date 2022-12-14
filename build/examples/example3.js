"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maplinemachine_1 = require("../src/maplinemachine");
const node_process_1 = require("node:process");
const normalizeNumbers = (s) => {
    const s2 = s.trim();
    if (s2 === '') {
        return null;
    }
    const s3 = parseInt(s2);
    if (isNaN(s3)) {
        throw new Error(`Not a number: ${s2}`);
    }
    return s2;
};
const lineMachine = (0, maplinemachine_1.createMapLineMachine)(normalizeNumbers);
const runner = async () => {
    try {
        await lineMachine('./examples/nums.txt', node_process_1.stdout);
    }
    catch (err) {
        console.error(err);
    }
};
runner();
//# sourceMappingURL=example3.js.map