"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_line_machine_1 = require("../src/rxjs_line_machine");
const node_process_1 = require("node:process");
const rxjs_1 = require("rxjs");
const toUpperAsync = (s) => {
    return new Promise(resolve => setTimeout(() => resolve(s.toUpperCase()), 1000));
};
const nonEmptyLinesToUpper = (source) => {
    return source.pipe((0, rxjs_1.map)(x => x.value), (0, rxjs_1.filter)(v => v.trim().length > 0), (0, rxjs_1.concatMap)(s => toUpperAsync(s)));
};
const lineMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(nonEmptyLinesToUpper);
const runner = () => {
    const prom = lineMachine('./examples/input.txt', node_process_1.stdout);
    prom
        .then(stats => console.log('\nstats:', stats))
        .catch(err => console.error(err));
    console.log('after a lineMachine call');
};
runner();
//# sourceMappingURL=exampleRxjsAsync.js.map