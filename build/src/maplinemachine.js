"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMapLineMachine = void 0;
const readline_transform_1 = __importDefault(require("readline-transform"));
const filestreamwrapper_1 = require("./utils/filestreamwrapper");
const linemachine_common_1 = require("./linemachine-common");
const createMapLineMachine = (callback, options) => {
    const proc = async (input, output, fileContext) => {
        const finalOptions = {
            ...linemachine_common_1.DEFAULT_LINEMACHINE_OPTIONS,
            ...options,
        };
        const transformToLines = new readline_transform_1.default({ ignoreEndOfBreak: false });
        const r = input.pipe(transformToLines);
        const writeOutput = (0, linemachine_common_1.createOutputWriter)(output, finalOptions);
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
                await writeOutput(lineResult);
            }
            return Promise.resolve(context);
        }
        catch (err) {
            err.message = `${(0, linemachine_common_1.getLineContextInfo)(context)}\n${err.message}`;
            return Promise.reject(err);
        }
    };
    return (0, filestreamwrapper_1.fileStreamWrapper)(proc);
};
exports.createMapLineMachine = createMapLineMachine;
//# sourceMappingURL=maplinemachine.js.map