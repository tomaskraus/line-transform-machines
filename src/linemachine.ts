import stream from 'stream';
import ReadlineTransform from 'readline-transform';
import {once} from 'events';
import {fileStreamWrapper} from './utils/filestreamwrapper';
import type {TFileStreamContext} from './utils/filestreamwrapper';
import type {TStreamProcessor, TFileProcessor} from './utils/filestreamwrapper';

export type TFileLineContext = TFileStreamContext & {lineNumber: number};

export type TMapLineCallback = (
  line: string,
  lineNumber: number
) => string | null;

export type TAsyncMapLineCallback = (
  line: string,
  lineNumber: number
) => Promise<string | null>;

/**
 * Options
 */
export type TLineMachineOptions = {
  /**
   * remembers...
   */
  rememberEndOfLines: boolean;
  useAsyncFn: boolean;
  thisArg: any;
};

export const DEFAULT_LTM_OPTIONS: TLineMachineOptions = {
  rememberEndOfLines: true,
  useAsyncFn: false,
  thisArg: this,
};

const getInfoStr = (context: TFileLineContext): string => {
  if (context.inputFileName) {
    return `[${context.inputFileName}:${context.lineNumber}]`;
  }
  return `line [${context.lineNumber}]`;
};

export const createLineMachine = (
  callback: TMapLineCallback | TAsyncMapLineCallback,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileLineContext> => {
  const proc: TStreamProcessor<TFileLineContext> = async (
    input: stream.Readable,
    output: stream.Writable,
    fileContext: TFileStreamContext
  ): Promise<TFileLineContext> => {
    const finalOptions = {
      ...DEFAULT_LTM_OPTIONS,
      ...options,
    };
    const transformToLines = new ReadlineTransform({ignoreEndOfBreak: false});
    const r = input.pipe(transformToLines);
    let notNullAlreadyRead = false;
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
        if (
          lineResult !== null &&
          finalOptions.rememberEndOfLines &&
          notNullAlreadyRead
        ) {
          lineResult = '\n' + lineResult;
        }
        if (lineResult !== null) {
          notNullAlreadyRead = true;
        }
        if (lineResult !== null && lineResult !== '') {
          const canContinue = output.write(lineResult);
          // from https://www.nodejsdesignpatterns.com/blog/javascript-async-iterators/
          if (!canContinue) {
            // backpressure, now we stop and we need to wait for drain
            await once(output, 'drain');
            // ok now it's safe to resume writing
          }
        }
      }
      return Promise.resolve(context);
    } catch (err) {
      (err as Error).message = `${getInfoStr(context)}\n${
        (err as Error).message
      }`;
      return Promise.reject(err);
    }
  };

  return fileStreamWrapper<TFileLineContext>(proc);
};
