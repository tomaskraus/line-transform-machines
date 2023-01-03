"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRxJSLineMachine = void 0;
const rxjs_1 = require("rxjs");
const linemachine_common_1 = require("./linemachine-common");
const createRxJSLineMachine = (observableDecorator, options) => {
    const lineStreamCallback = async (lineStream, writeOutput, context //, opts
    ) => {
        const initialObservable = (0, rxjs_1.from)(lineStream).pipe((0, rxjs_1.tap)(() => context.lineNumber++));
        return new Promise((resolve, reject) => observableDecorator(initialObservable).subscribe({
            next: line => writeOutput(line),
            error: err => {
                reject((0, linemachine_common_1.addLineInfoToErrorObj)(context)(err));
            },
            complete: () => resolve(context),
        }));
    };
    return (0, linemachine_common_1.fileLineProcessorWrapper)(lineStreamCallback, options);
};
exports.createRxJSLineMachine = createRxJSLineMachine;
//# sourceMappingURL=rxjs-line-machine.js.map