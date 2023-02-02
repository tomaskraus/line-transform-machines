"use strict";
/**
 * common stuff for all lineMachines
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineMachineError = exports.fileLineProcessorWrapper = exports.DEFAULT_LINEMACHINE_OPTIONS = void 0;
const events_1 = require("events");
const readline_transform_1 = __importDefault(require("readline-transform"));
const file_stream_wrapper_1 = require("./utils/file_stream_wrapper");
exports.DEFAULT_LINEMACHINE_OPTIONS = {
    rememberEndOfLines: true,
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
const fileLineProcessorWrapper = (lineStreamCallback, options) => {
    const streamProc = async (input, output, fileContext) => {
        const finalOptions = {
            ...exports.DEFAULT_LINEMACHINE_OPTIONS,
            ...options,
        };
        const transformToLines = new readline_transform_1.default({ ignoreEndOfBreak: false });
        const r = input.pipe(transformToLines);
        const writeOutput = createOutputWriter(output, finalOptions);
        const context = {
            ...fileContext,
            lineNumber: 0,
        };
        return lineStreamCallback(r, writeOutput, context, finalOptions);
    };
    return (0, file_stream_wrapper_1.fileStreamWrapper)(streamProc);
};
exports.fileLineProcessorWrapper = fileLineProcessorWrapper;
class LineMachineError extends Error {
    constructor(context, err, callerFn) {
        super(err.message);
        // properly capture stack trace in Node.js
        Error.captureStackTrace(this, callerFn || this.constructor);
        this.name = this.constructor.name;
        this.lineNumber = context.lineNumber;
        this.inputFileName = context.inputFileName || '';
        this.at = context.inputFileName
            ? `${context.inputFileName}:${context.lineNumber}`
            : '';
        this.lineValue = context.value || '';
    }
}
exports.LineMachineError = LineMachineError;
//# sourceMappingURL=line_machine_common.js.map