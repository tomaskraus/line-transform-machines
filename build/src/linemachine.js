"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLineMachine = exports.DEFAULT_LTM_OPTIONS = void 0;
const readline_transform_1 = __importDefault(require("readline-transform"));
const events_1 = require("events");
const filestreamwrapper_1 = require("./utils/filestreamwrapper");
exports.DEFAULT_LTM_OPTIONS = {
    rememberEndOfLines: true,
    useAsyncFn: false,
    thisArg: this,
};
const getInfoStr = (context) => {
    if (context.inputFileName) {
        return `[${context.inputFileName}:${context.lineNumber}]`;
    }
    return `line [${context.lineNumber}]`;
};
const createLineMachine = (callback, options) => {
    const proc = async (input, output, fileContext) => {
        const finalOptions = {
            ...exports.DEFAULT_LTM_OPTIONS,
            ...options,
        };
        const transformToLines = new readline_transform_1.default({ ignoreEndOfBreak: false });
        const r = input.pipe(transformToLines);
        let notNullAlreadyRead = false;
        const context = {
            ...fileContext,
            lineNumber: 0,
        };
        try {
            for await (const line of r) {
                context.lineNumber++;
                let lineResult;
                if (finalOptions.useAsyncFn) {
                    lineResult = await callback.call(finalOptions.thisArg, line, context.lineNumber);
                }
                else {
                    lineResult = callback.call(finalOptions.thisArg, line, context.lineNumber);
                }
                if (lineResult !== null &&
                    finalOptions.rememberEndOfLines &&
                    notNullAlreadyRead) {
                    lineResult = '\n' + lineResult;
                }
                if (lineResult !== null) {
                    notNullAlreadyRead = true;
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
            return Promise.resolve(context);
        }
        catch (err) {
            err.message = `${getInfoStr(context)}\n${err.message}`;
            return Promise.reject(err);
        }
    };
    return (0, filestreamwrapper_1.fileStreamWrapper)(proc);
};
exports.createLineMachine = createLineMachine;
//# sourceMappingURL=linemachine.js.map