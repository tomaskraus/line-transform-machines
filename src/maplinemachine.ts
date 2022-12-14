import stream from 'stream';
import ReadlineTransform from 'readline-transform';
import {once} from 'events';
import {fileStreamWrapper} from './utils/filestreamwrapper';
import type {TFileStreamContext} from './utils/filestreamwrapper';
import type {TStreamProcessor, TFileProcessor} from './utils/filestreamwrapper';

export type TMapLineFn = (line: string, lineNumber: number) => string | null;

export type TAsyncMapLineFn = (
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

export const mapLineMachine = (
  mapFn: TMapLineFn | TAsyncMapLineFn,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileStreamContext> => {
  const proc: TStreamProcessor<TFileStreamContext> = async (
    input: stream.Readable,
    output: stream.Writable,
    context: TFileStreamContext
  ): Promise<TFileStreamContext> => {
    const finalOptions = {
      ...DEFAULT_LTM_OPTIONS,
      ...options,
    };
    const transformToLines = new ReadlineTransform({ignoreEndOfBreak: false});
    const r = input.pipe(transformToLines);
    context.linesRead = 0;
    let notNullAlreadyRead = false;
    for await (const line of r) {
      context.linesRead++;
      let lineResult: string | null;
      if (finalOptions.useAsyncFn) {
        lineResult = await (mapFn as TAsyncMapLineFn).call(
          finalOptions.thisArg,
          line,
          context.linesRead
        );
      } else {
        lineResult = (mapFn as TMapLineFn).call(
          finalOptions.thisArg,
          line,
          context.linesRead
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
  };

  return fileStreamWrapper<TFileStreamContext>(proc);
};
