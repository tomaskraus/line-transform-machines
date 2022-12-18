"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maplinemachine_1 = require("../src/maplinemachine");
const node_process_1 = require("node:process");
const toUpperIgnoreEmptyLinesNumbered = (s, lineNum) => {
    if (s.trim().length === 0)
        return null;
    return `${lineNum}: ${s.toUpperCase()}`;
};
const lineMachine = (0, maplinemachine_1.createMapLineMachine)(toUpperIgnoreEmptyLinesNumbered);
const runner = async () => {
    try {
        const stats = await lineMachine('./examples/input.txt', node_process_1.stdout);
        console.log('\nstats:', stats);
    }
    catch (err) {
        console.error(err);
    }
};
runner();
//# sourceMappingURL=example.js.map