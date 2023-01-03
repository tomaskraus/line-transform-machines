"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRxjsLineMachine = void 0;
const rxjs_1 = require("rxjs");
const line_machine_common_1 = require("./line_machine_common");
const createRxjsLineMachine = (observableDecorator, options) => {
    const lineStreamCallback = async (lineStream, writeOutput, context //, opts
    ) => {
        const initialObservable = (0, rxjs_1.from)(lineStream).pipe((0, rxjs_1.tap)(() => context.lineNumber++));
        return new Promise((resolve, reject) => observableDecorator(initialObservable).subscribe({
            next: line => writeOutput(line),
            error: err => {
                reject((0, line_machine_common_1.addLineInfoToErrorObj)(context)(err));
            },
            complete: () => resolve(context),
        }));
    };
    return (0, line_machine_common_1.fileLineProcessorWrapper)(lineStreamCallback, options);
};
exports.createRxjsLineMachine = createRxjsLineMachine;
//# sourceMappingURL=rxjs_line_machine.js.map