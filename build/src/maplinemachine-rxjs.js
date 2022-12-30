"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMapLineMachineRxjs = void 0;
const readline_transform_1 = __importDefault(require("readline-transform"));
const filestreamwrapper_1 = require("./utils/filestreamwrapper");
const rxjs_1 = require("rxjs");
const linemachine_common_1 = require("./linemachine-common");
const createMapLineMachineRxjs = (observableDecorator, options) => {
    const proc = async (input, output, fileContext) => {
        const finalOptions = {
            ...linemachine_common_1.DEFAULT_LTM_OPTIONS,
            ...options,
        };
        const transformToLines = new readline_transform_1.default({ ignoreEndOfBreak: false });
        const r = input.pipe(transformToLines);
        const writeOutput = (0, linemachine_common_1.createOutputWriter)(output, finalOptions);
        const context = {
            ...fileContext,
            lineNumber: 0,
        };
        const initialObservable = (0, rxjs_1.from)(r).pipe((0, rxjs_1.tap)(() => context.lineNumber++));
        return new Promise((reject, resolve) => observableDecorator(initialObservable).subscribe({
            next: writeOutput,
            error: err => {
                err.message = `${(0, linemachine_common_1.getLineContextInfo)(context)}\n${err.message}`;
                reject(err);
            },
            complete: () => resolve(context),
        }));
    };
    return (0, filestreamwrapper_1.fileStreamWrapper)(proc);
};
exports.createMapLineMachineRxjs = createMapLineMachineRxjs;
//# sourceMappingURL=maplinemachine-rxjs.js.map