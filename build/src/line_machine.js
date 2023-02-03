"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLineMachine = void 0;
const line_machine_common_1 = require("./line_machine_common");
const createLineMachine = (callback, options) => {
    const lineStreamCallback = async (lineStream, writeOutput, context //, opts
    ) => {
        try {
            for await (const line of lineStream) {
                context.value = line;
                context.lineNumber++;
                const lineResult = callback(line, context.lineNumber, (0, line_machine_common_1.getFileLineInfo)(context));
                await writeOutput(lineResult);
            }
            return Promise.resolve(context);
        }
        catch (err) {
            return Promise.reject(new line_machine_common_1.LineMachineError(context, err, lineStreamCallback));
        }
    };
    return (0, line_machine_common_1.fileLineProcessorWrapper)(lineStreamCallback, options);
};
exports.createLineMachine = createLineMachine;
//# sourceMappingURL=line_machine.js.map