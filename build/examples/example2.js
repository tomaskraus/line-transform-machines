"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maplinemachine_1 = require("../src/maplinemachine");
const node_process_1 = require("node:process");
const toUpperAndNonEmptyIndexed = (s, lineNumber) => {
    if (s.trim().length === 0) {
        return null; // removes line from output
    }
    return `${lineNumber}: ${s.toUpperCase()}`;
};
const lineMachine = (0, maplinemachine_1.createMapLineMachine)(toUpperAndNonEmptyIndexed);
const runner = async () => {
    const res = await lineMachine('./examples/input.txt', node_process_1.stdout);
    console.log('\n', res);
};
runner();
//# sourceMappingURL=example2.js.map