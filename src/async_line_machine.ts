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

export type TAsyncMapLineCallback = (
  line: string,
  lineNumber: number
) => Promise<string | null>;

export const createAsyncLineMachine = (
  callback: TAsyncMapLineCallback,
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
        const lineResult = await callback(line, context.lineNumber);
        await writeOutput(lineResult);
      }
      return Promise.resolve(context);
    } catch (err) {
      return Promise.reject(addLineInfoToErrorObj(context)(err as Error));
    }
  };

  return fileLineProcessorWrapper(lineStreamCallback, options);
};
