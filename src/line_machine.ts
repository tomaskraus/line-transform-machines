import {
  addLineInfoToErrorObj,
  fileLineProcessorWrapper,
} from './line_machine_common';
import type {TFileProcessor} from './utils/file_stream_wrapper';
import type {
  TLineMachineOptions,
  TFileLineContext,
  TLineStreamCallback,
} from './line_machine_common';

export type TMapLineCallback = (
  line: string,
  lineNumber: number
) => string | null;

export const createLineMachine = (
  callback: TMapLineCallback,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileLineContext> => {
  const lineStreamCallback: TLineStreamCallback = async (
    lineStream,
    writeOutput,
    context //, opts
  ): Promise<TFileLineContext> => {
    try {
      for await (const line of lineStream) {
        context.lineNumber++;
        const lineResult = callback(line, context.lineNumber);
        await writeOutput(lineResult);
      }
      return Promise.resolve(context);
    } catch (err) {
      return Promise.reject(addLineInfoToErrorObj(context)(err as Error));
    }
  };

  return fileLineProcessorWrapper(lineStreamCallback, options);
};
