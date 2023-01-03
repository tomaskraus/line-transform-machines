"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsyncLineMachine = void 0;
const line_machine_common_1 = require("./line_machine_common");
const createAsyncLineMachine = (callback, options) => {
    const lineStreamCallback = async (lineStream, writeOutput, context, opts) => {
        try {
            for await (const line of lineStream) {
                context.lineNumber++;
                const lineResult = await callback.call(opts.thisArg, line, context.lineNumber);
                await writeOutput(lineResult);
            }
            return Promise.resolve(context);
        }
        catch (err) {
            return Promise.reject((0, line_machine_common_1.addLineInfoToErrorObj)(context)(err));
        }
    };
    return (0, line_machine_common_1.fileLineProcessorWrapper)(lineStreamCallback, options);
};
exports.createAsyncLineMachine = createAsyncLineMachine;
//# sourceMappingURL=async_line_machine.js.map