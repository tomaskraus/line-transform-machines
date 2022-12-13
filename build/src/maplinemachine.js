"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapLineMachine = void 0;
const readline_transform_1 = __importDefault(require("readline-transform"));
const events_1 = require("events");
const filestreamwrapper_1 = require("./utils/filestreamwrapper");
const mapLineMachine = (asyncMapFn, includeLineEnds = false) => {
    const proc = async (input, output) => {
        const transformToLines = new readline_transform_1.default({ ignoreEndOfBreak: false });
        const r = input.pipe(transformToLines);
        let linesRead = 0;
        for await (const line of r) {
            linesRead++;
            let lineResult = await asyncMapFn(line, linesRead);
            if (lineResult !== null && includeLineEnds && linesRead > 1) {
                lineResult = '\n' + lineResult;
            }
            if (lineResult !== null && lineResult !== '') {
                const canContinue = output.write(lineResult);
                // from https://www.nodejsdesignpatterns.com/blog/javascript-async-iterators/
                if (!canContinue) {
                    // backpressure, now we stop and we need to wait for drain
                    await (0, events_1.once)(output, 'drain');
                    // ok now it's safe to resume writing
                }
            }
        }
        return Promise.resolve({ linesRead });
    };
    return (0, filestreamwrapper_1.fileStreamWrapper)(proc);
};
exports.mapLineMachine = mapLineMachine;
//# sourceMappingURL=maplinemachine.js.map