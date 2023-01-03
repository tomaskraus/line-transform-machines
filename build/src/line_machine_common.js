"use strict";
/**
 * common stuff for all lineMachines
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLineInfoToErrorObj = exports.getLineContextInfo = exports.fileLineProcessorWrapper = exports.createOutputWriter = exports.DEFAULT_LINEMACHINE_OPTIONS = void 0;
const events_1 = require("events");
const readline_transform_1 = __importDefault(require("readline-transform"));
const filestreamwrapper_1 = require("./utils/filestreamwrapper");
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
const fileLineProcessorWrapper = (lineStreamCallback, options) => {
    const streamProc = async (input, output, fileContext) => {
        const finalOptions = {
            ...exports.DEFAULT_LINEMACHINE_OPTIONS,
            ...options,
        };
        const transformToLines = new readline_transform_1.default({ ignoreEndOfBreak: false });
        const r = input.pipe(transformToLines);
        const writeOutput = (0, exports.createOutputWriter)(output, finalOptions);
        const context = {
            ...fileContext,
            lineNumber: 0,
        };
        return lineStreamCallback(r, writeOutput, context, finalOptions);
    };
    return (0, filestreamwrapper_1.fileStreamWrapper)(streamProc);
};
exports.fileLineProcessorWrapper = fileLineProcessorWrapper;
const getLineContextInfo = (context) => {
    if (context.inputFileName) {
        return `[${context.inputFileName}:${context.lineNumber}]`;
    }
    return `line [${context.lineNumber}]`;
};
exports.getLineContextInfo = getLineContextInfo;
const addLineInfoToErrorObj = (context) => (err) => {
    err.message = `${(0, exports.getLineContextInfo)(context)}\n${err.message}`;
    return err;
};
exports.addLineInfoToErrorObj = addLineInfoToErrorObj;
//# sourceMappingURL=line_machine_common.js.map