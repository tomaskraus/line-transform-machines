"use strict";
/**
 * common stuff for all lineMachines
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLineContextInfo = exports.createOutputWriter = exports.DEFAULT_LINEMACHINE_OPTIONS = void 0;
const events_1 = require("events");
exports.DEFAULT_LINEMACHINE_OPTIONS = {
    rememberEndOfLines: true,
    useAsyncFn: false,
    thisArg: this,
};
const createOutputWriter = (output, options) => {
    let notNullAlreadyRead = false;
    const outputWriter = async (line) => {
        if (line !== null && options.rememberEndOfLines && notNullAlreadyRead) {
            line = '\n' + line;
        }
        if (line !== null) {
            notNullAlreadyRead = true;
        }
        if (line !== null && line !== '') {
            const canContinue = output.write(line);
            // from https://www.nodejsdesignpatterns.com/blog/javascript-async-iterators/
            if (!canContinue) {
                // backpressure, now we stop and we need to wait for drain
                await (0, events_1.once)(output, 'drain');
                // ok now it's safe to resume writing
            }
        }
    };
    return outputWriter;
};
exports.createOutputWriter = createOutputWriter;
const getLineContextInfo = (context) => {
    if (context.inputFileName) {
        return `[${context.inputFileName}:${context.lineNumber}]`;
    }
    return `line [${context.lineNumber}]`;
};
exports.getLineContextInfo = getLineContextInfo;
//# sourceMappingURL=linemachine-common.js.map