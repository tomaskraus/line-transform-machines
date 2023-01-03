import {
  addLineInfoToErrorObj,
  fileLineProcessorWrapper,
} from './linemachine-common';
import type {TFileProcessor} from './utils/filestreamwrapper';
import type {
  TLineMachineOptions,
  TFileLineContext,
  TLineStreamCallback,
} from './linemachine-common';

export type TMapLineCallback = (
  line: string,
  lineNumber: number
) => string | null;

export type TAsyncMapLineCallback = (
  line: string,
  lineNumber: number
) => Promise<string | null>;

export const createMapLineMachine = (
  callback: TMapLineCallback | TAsyncMapLineCallback,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileLineContext> => {
  const lineStreamCallback: TLineStreamCallback = async (
    lineStream,
    writeOutput,
    context,
    opts
  ): Promise<TFileLineContext> => {
    try {
      for await (const line of lineStream) {
        context.lineNumber++;
        let lineResult: string | null;
        if (opts.useAsyncFn) {
          lineResult = await (callback as TAsyncMapLineCallback).call(
            opts.thisArg,
            line,
            context.lineNumber
          );
        } else {
          lineResult = (callback as TMapLineCallback).call(
            opts.thisArg,
            line,
            context.lineNumber
          );
        }
        await writeOutput(lineResult);
      }
      return Promise.resolve(context);
    } catch (err) {
      return Promise.reject(addLineInfoToErrorObj(context)(err as Error));
    }
  };

  return fileLineProcessorWrapper(lineStreamCallback, options);
};
