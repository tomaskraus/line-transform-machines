"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const linemachine_1 = require("../src/linemachine");
const node_process_1 = require("node:process");
const toUpperAndNonEmptyIndexed = (s, lineNumber) => {
    if (s.trim().length === 0) {
        return null; // removes line from output
    }
    return `${lineNumber}: ${s.toUpperCase()}`;
};
const lineMachine = (0, linemachine_1.createLineMachine)(toUpperAndNonEmptyIndexed);
const runner = () => {
    const prom = lineMachine('./examples/input.txt', node_process_1.stdout);
    prom
        .then(stats => console.log('\nstats:', stats))
        .catch(err => console.error(err));
    console.log('after a lineMachine call');
};
runner();
//# sourceMappingURL=example2promise.js.map