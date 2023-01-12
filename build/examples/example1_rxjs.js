"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_process_1 = require("node:process");
const rxjs_1 = require("rxjs");
const rxjs_line_machine_1 = require("../src/rxjs_line_machine");
const toUpperIgnoreEmptyLinesNumbered = (obs) => {
    return obs.pipe((0, rxjs_1.filter)(x => x.value.trim().length > 0), (0, rxjs_1.map)(x => `${x.lineNumber}: ${x.value.toLocaleUpperCase()}`));
};
const lineMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(toUpperIgnoreEmptyLinesNumbered);
const runner = async () => {
    try {
        await lineMachine('./examples/input.txt', node_process_1.stdout);
    }
    catch (err) {
        console.error(err);
    }
};
runner();
//# sourceMappingURL=example1_rxjs.js.map