"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maplinemachine_1 = require("../src/maplinemachine");
const node_process_1 = require("node:process");
const rxjs_1 = require("rxjs");
// const toUpperAndNonEmptyIndexed = (s: string, lineNumber: number) => {
//   if (s.trim().length === 0) {
//     return null; // removes line from output
//   }
//   return `${lineNumber}: ${s.toUpperCase()}`;
// };
const deco = (obs) => {
    return obs.pipe((0, rxjs_1.filter)(v => v.trim().length > 0), 
    // map((v, i) => {
    //   if (i === 3) {
    //     throw new Error('i is 3!');
    //   }
    //   return `${i}: ${v}`;
    // }),
    (0, rxjs_1.reduce)((count, _) => count + 1, 0), (0, rxjs_1.map)(x => x.toString()));
};
const lineMachine = (0, maplinemachine_1.createMapLineMachineRxjs)(deco);
const runner = () => {
    const prom = lineMachine('./examples/input.txt', node_process_1.stdout);
    prom
        .then(stats => console.log('\nstats:', stats))
        .catch(err => console.error(err));
    console.log('after a lineMachine call');
};
runner();
//# sourceMappingURL=exampleRxjs.js.map