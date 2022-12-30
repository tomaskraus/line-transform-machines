import stream from 'stream';
import ReadlineTransform from 'readline-transform';
import {fileStreamWrapper} from './utils/filestreamwrapper';
import type {TFileStreamContext} from './utils/filestreamwrapper';
import type {TStreamProcessor, TFileProcessor} from './utils/filestreamwrapper';

import type {TLineMachineOptions, TFileLineContext} from './linemachine-common';
import {
  DEFAULT_LINEMACHINE_OPTIONS,
  createOutputWriter,
  getLineContextInfo,
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
  const proc: TStreamProcessor<TFileLineContext> = async (
    input: stream.Readable,
    output: stream.Writable,
    fileContext: TFileStreamContext
  ): Promise<TFileLineContext> => {
    const finalOptions = {
      ...DEFAULT_LINEMACHINE_OPTIONS,
      ...options,
    };
    const transformToLines = new ReadlineTransform({ignoreEndOfBreak: false});
    const r = input.pipe(transformToLines);
    const writeOutput = createOutputWriter(output, finalOptions);
    const context: TFileLineContext = {
      ...fileContext,
      lineNumber: 0,
    };
    try {
      for await (const line of r) {
        context.lineNumber++;
        let lineResult: string | null;
        if (finalOptions.useAsyncFn) {
          lineResult = await (callback as TAsyncMapLineCallback).call(
            finalOptions.thisArg,
            line,
            context.lineNumber
          );
        } else {
          lineResult = (callback as TMapLineCallback).call(
            finalOptions.thisArg,
            line,
            context.lineNumber
          );
        }
        await writeOutput(lineResult);
      }
      return Promise.resolve(context);
    } catch (err) {
      (err as Error).message = `${getLineContextInfo(context)}\n${
        (err as Error).message
      }`;
      return Promise.reject(err);
    }
  };

  return fileStreamWrapper<TFileLineContext>(proc);
};
