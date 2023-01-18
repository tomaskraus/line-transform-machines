"use strict";
/**
 * TLDR: reads input text and prints a JS string that represents that input text.
 *
 * Reads the text from a standard input. (let's call that text INPUT-TEXT)
 * Prints a piece of JS code to standard output.
 *   That JS code consists of string (or concatenation of strings) - call it OUT-STRING.
 * OUT-STRING represents an INPUT-TEXT in such a form,
 * that when OUT-STRING is printed by some JS script, its output should contain the INPUT-TEXT.
 *
 * Try it by running on this file:)
 *   cat examples/text2string.ts | node build/examples/text2string.js
 */
Object.defineProperty(exports, "__esModule", { value: true });
const rxjs_line_machine_1 = require("../src/rxjs_line_machine");
const node_process_1 = require("node:process");
const rxjs_1 = require("rxjs");
const jsStringLiteralFromLine = (obs) => {
    return obs.pipe((0, rxjs_1.map)(x => ({
        value: x.value.replace(/\\/g, '\\\\').replace(/'/g, "\\'"),
        lineNumber: x.lineNumber,
    })), (0, rxjs_1.map)(x => (x.lineNumber === 1 ? `'${x.value}'` : `+ '\\n${x.value}'`)));
};
const lineMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(jsStringLiteralFromLine);
const runner = () => {
    const process = lineMachine(node_process_1.stdin, node_process_1.stdout);
    process.catch(err => console.error(err));
};
runner();
//# sourceMappingURL=text2string.js.map