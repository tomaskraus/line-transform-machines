import stream from 'stream';
import ReadlineTransform from 'readline-transform';
import {once} from 'events';
import {fileStreamWrapper} from './utils/filestreamwrapper';
import {Observable, from, tap} from 'rxjs';
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

const _createOutputWriter = (
  output: stream.Writable,
  options: TLineMachineOptions
) => {
  let notNullAlreadyRead = false;

  const outputWriter = async (line: string | null) => {
    if (line !== null && options.rememberEndOfLines && notNullAlreadyRead) {
      line = '\n' + line;
    }
    if (line !== null) {
      notNullAlreadyRead = true;
    }
    if (line !== null && line !== '') {
      const canContinue = output.write(line);
      // from https://www.nodejsdesignpatterns.com/blog/javascript-async-iterators/
      if (!canContinue) {
        // backpressure, now we stop and we need to wait for drain
        await once(output, 'drain');
        // ok now it's safe to resume writing
      }
    }
  };
  return outputWriter;
};

const getInfoStr = (context: TFileLineContext): string => {
  if (context.inputFileName) {
    return `[${context.inputFileName}:${context.lineNumber}]`;
  }
  return `line [${context.lineNumber}]`;
};

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
      ...DEFAULT_LTM_OPTIONS,
      ...options,
    };
    const transformToLines = new ReadlineTransform({ignoreEndOfBreak: false});
    const r = input.pipe(transformToLines);
    const writeOutput = _createOutputWriter(output, finalOptions);
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
      (err as Error).message = `${getInfoStr(context)}\n${
        (err as Error).message
      }`;
      return Promise.reject(err);
    }
  };

  return fileStreamWrapper<TFileLineContext>(proc);
};

export const createMapLineMachineRxjs = (
  observableDecorator: (obs: Observable<string>) => Observable<string>,
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
    const writeOutput = _createOutputWriter(output, finalOptions);
    const context: TFileLineContext = {
      ...fileContext,
      lineNumber: 0,
    };
    const initialObservable: Observable<string> = from(r).pipe(
      tap(() => context.lineNumber++)
    );

    return new Promise((reject, resolve) =>
      observableDecorator(initialObservable).subscribe({
        next: writeOutput,
        error: err => {
          (err as Error).message = `${getInfoStr(context)}\n${
            (err as Error).message
          }`;
          reject(err);
        },
        complete: () => resolve(context),
      })
    );
  };

  return fileStreamWrapper<TFileLineContext>(proc);
};
