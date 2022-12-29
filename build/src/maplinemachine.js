"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMapLineMachineRxjs = exports.createMapLineMachine = exports.DEFAULT_LTM_OPTIONS = void 0;
const readline_transform_1 = __importDefault(require("readline-transform"));
const events_1 = require("events");
const filestreamwrapper_1 = require("./utils/filestreamwrapper");
const rxjs_1 = require("rxjs");
exports.DEFAULT_LTM_OPTIONS = {
    rememberEndOfLines: true,
    useAsyncFn: false,
    thisArg: this,
};
const _createOutputWriter = (output, options) => {
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
const createMapLineMachine = (callback, options) => {
    const proc = async (input, output, context) => {
        const finalOptions = {
            ...exports.DEFAULT_LTM_OPTIONS,
            ...options,
        };
        const transformToLines = new readline_transform_1.default({ ignoreEndOfBreak: false });
        const r = input.pipe(transformToLines);
        context.linesRead = 0;
        const writeOutput = _createOutputWriter(output, finalOptions);
        try {
            for await (const line of r) {
                context.linesRead++;
                let lineResult;
                if (finalOptions.useAsyncFn) {
                    lineResult = await callback.call(finalOptions.thisArg, line, context.linesRead);
                }
                else {
                    lineResult = callback.call(finalOptions.thisArg, line, context.linesRead);
                }
                await writeOutput(lineResult);
            }
            return Promise.resolve(context);
        }
        catch (err) {
            err.message = `${(0, filestreamwrapper_1.getContextInfoStr)(context)}\n${err.message}`;
            return Promise.reject(err);
        }
    };
    return (0, filestreamwrapper_1.fileStreamWrapper)(proc);
};
exports.createMapLineMachine = createMapLineMachine;
const createMapLineMachineRxjs = (observableDecorator, options) => {
    const proc = async (input, output, context) => {
        const finalOptions = {
            ...exports.DEFAULT_LTM_OPTIONS,
            ...options,
        };
        const transformToLines = new readline_transform_1.default({ ignoreEndOfBreak: false });
        const r = input.pipe(transformToLines);
        const writeOutput = _createOutputWriter(output, finalOptions);
        const initialObservable = (0, rxjs_1.from)(r).pipe((0, rxjs_1.tap)(() => context.linesRead++));
        return new Promise((reject, resolve) => observableDecorator(initialObservable).subscribe({
            next: writeOutput,
            error: err => {
                err.message = `${(0, filestreamwrapper_1.getContextInfoStr)(context)}\n${err.message}`;
                reject(err);
            },
            complete: () => resolve(context),
        }));
    };
    return (0, filestreamwrapper_1.fileStreamWrapper)(proc);
};
exports.createMapLineMachineRxjs = createMapLineMachineRxjs;
//# sourceMappingURL=maplinemachine.js.map