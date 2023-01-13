"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_machine_1 = require("../src/line_machine");
const node_process_1 = require("node:process");
const toUpperIgnoreEmptyLinesNumbered = (s, lineNum) => {
    if (s.trim().length === 0)
        return null; // returning null removes that line from output
    return `${lineNum}: ${s.toUpperCase()}`;
};
const lineMachine = (0, line_machine_1.createLineMachine)(toUpperIgnoreEmptyLinesNumbered);
const runner = async () => {
    try {
        await lineMachine('./examples/input.txt', node_process_1.stdout);
    }
    catch (err) {
        console.error(err);
    }
};
runner();
//# sourceMappingURL=example1_callback.js.map