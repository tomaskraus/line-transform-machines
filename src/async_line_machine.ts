import {
  LineMachineError,
  fileLineProcessorWrapper,
  getFileLineInfo,
} from './line_machine_common';
import type {TFileProcessor} from './utils/file_stream_wrapper';
import type {
  TLineMachineOptions,
  TFileLineContext,
  TLineStreamCallback,
} from './line_machine_common';

export type TAsyncLineCallback = (
  line: string,
  lineNumber: number,
  fileLineInfo?: string
) => Promise<string | null>;

export const createAsyncLineMachine = (
  callback: TAsyncLineCallback,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileLineContext> => {
  const lineStreamCallback: TLineStreamCallback = async (
    lineStream,
    writeOutput,
    context //, opts
  ): Promise<TFileLineContext> => {
    try {
      for await (const line of lineStream) {
        context.value = line;
        context.lineNumber++;
        const lineResult = await callback(
          line,
          context.lineNumber,
          getFileLineInfo(context)
        );
        await writeOutput(lineResult);
      }
      return Promise.resolve(context);
    } catch (err) {
      return Promise.reject(
        new LineMachineError(context, err as Error, lineStreamCallback)
      );
    }
  };

  return fileLineProcessorWrapper(lineStreamCallback, options);
};
