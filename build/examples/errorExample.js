"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_machine_1 = require("../src/line_machine");
// our callback that can throw error
const normalizeNumbers = (s) => {
    const num = parseInt(s);
    if (isNaN(num))
        throw new Error(`Not a number: ${s}`);
    return num.toString();
};
const lineMachine = (0, line_machine_1.createLineMachine)(normalizeNumbers);
const runner = async () => {
    try {
        await lineMachine('./examples/nums.txt', './examples/normalized.txt');
    }
    catch (err) {
        console.error(err);
    }
};
runner();
//# sourceMappingURL=errorExample.js.map