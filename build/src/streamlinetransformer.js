"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamLineTransformer = void 0;
const readline_transform_1 = __importDefault(require("readline-transform"));
const events_1 = require("events");
const streamLineTransformer = (asyncLineMapFn) => async (input, output) => {
    const transformToLines = new readline_transform_1.default();
    const r = input.pipe(transformToLines);
    let linesRead = 0;
    for await (const line of r) {
        linesRead++;
        const lineResult = await asyncLineMapFn(line);
        const canContinue = output.write(lineResult);
        // from https://www.nodejsdesignpatterns.com/blog/javascript-async-iterators/
        if (!canContinue) {
            // backpressure, now we stop and we need to wait for drain
            await (0, events_1.once)(output, 'drain');
            // ok now it's safe to resume writing
        }
    }
    return { linesRead };
};
exports.streamLineTransformer = streamLineTransformer;
//# sourceMappingURL=streamlinetransformer.js.map