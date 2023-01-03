"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_line_machine_1 = require("../src/rxjs_line_machine");
const node_process_1 = require("node:process");
const rxjs_1 = require("rxjs");
const toUpperAsync = (s) => {
    return new Promise(resolve => setTimeout(() => resolve(s.toUpperCase()), 1000));
};
const nonEmptyLinesCount = (obs) => {
    return obs.pipe(
    // map((v, i) => {
    //   if (i === 3) {
    //     throw new Error('i is 3!');
    //   }
    //   return `${i}: ${v}`;
    // }),
    (0, rxjs_1.map)(x => x.value), (0, rxjs_1.filter)(v => v.trim().length > 0), 
    //reduce((count: number) => count + 1, 0),
    (0, rxjs_1.concatMap)(s => toUpperAsync(s))
    // map(x => x.toString())
    );
};
const lineMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(nonEmptyLinesCount);
const runner = () => {
    const prom = lineMachine('./examples/input.txt', node_process_1.stdout);
    prom
        .then(stats => console.log('\nstats:', stats))
        .catch(err => console.error(err));
    console.log('after a lineMachine call');
};
runner();
//# sourceMappingURL=exampleRxjsAsync.js.map