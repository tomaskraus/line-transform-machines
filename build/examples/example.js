"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const linemachine_1 = require("../src/linemachine");
const node_process_1 = require("node:process");
// our callback
const toUpperIgnoreEmptyLinesNumbered = (s, lineNum) => {
    if (s.trim().length === 0)
        return null; // returning null removes that line from output
    return `${lineNum}:\n    ${s.toUpperCase()}`; // can 'insert' new lines using newline characters in the string returned
};
const lineMachine = (0, linemachine_1.createLineMachine)(toUpperIgnoreEmptyLinesNumbered);
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