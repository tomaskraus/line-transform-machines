"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_line_machine_1 = require("../src/rxjs-line-machine");
const node_process_1 = require("node:process");
const rxjs_1 = require("rxjs");
const nonEmptyLinesCount = (obs) => {
    return obs.pipe(
    // map((v, i) => {
    //   if (i === 3) {
    //     throw new Error('i is 3!');
    //   }
    //   return `${i}: ${v}`;
    // }),
    (0, rxjs_1.filter)(v => v.trim().length > 0), (0, rxjs_1.reduce)((count) => count + 1, 0), (0, rxjs_1.map)(x => x.toString()));
};
const lineMachine = (0, rxjs_line_machine_1.createRxJSLineMachine)(nonEmptyLinesCount);
const runner = () => {
    const prom = lineMachine('./examples/input.txt', node_process_1.stdout);
    prom
        .then(stats => console.log('\nstats:', stats))
        .catch(err => console.error(err));
    console.log('after a lineMachine call');
};
runner();
//# sourceMappingURL=exampleRxjs.js.map