/**
 * common stuff for all lineMachines
 */

import stream from 'stream';

import {once} from 'events';
import ReadlineTransform from 'readline-transform';
import {fileStreamWrapper} from './utils/file_stream_wrapper';
import type {TFileStreamContext} from './utils/file_stream_wrapper';
import type {
  TStreamProcessor,
  TFileProcessor,
} from './utils/file_stream_wrapper';

export type TFileLineContext = TFileStreamContext & {
  value?: string;
  lineNumber: number;
};

/**
 * Options
 */
export type TLineMachineOptions = {
  /**
   * remembers...
   */
  rememberEndOfLines: boolean;
};

export const DEFAULT_LINEMACHINE_OPTIONS: TLineMachineOptions = {
  rememberEndOfLines: true,
};

const createOutputWriter = (
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

export type TLineStreamCallback = (
  lineStream: ReadlineTransform,
  writeOutput: (line: string | null) => Promise<void>,
  fileLineContext: TFileLineContext,
  options: TLineMachineOptions
) => Promise<TFileLineContext>;

export const fileLineProcessorWrapper = (
  lineStreamCallback: TLineStreamCallback,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileLineContext> => {
  const streamProc: TStreamProcessor<TFileLineContext> = async (
    input: stream.Readable,
    output: stream.Writable,
    fileContext: TFileStreamContext
  ): Promise<TFileLineContext> => {
    const finalOptions: TLineMachineOptions = {
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
    return lineStreamCallback(r, writeOutput, context, finalOptions);
  };
  return fileStreamWrapper<TFileLineContext>(streamProc);
};

export class LineMachineError extends Error {
  lineNumber: Number;
  inputFileName: string;
  at: string;
  lineValue: string;

  constructor(
    context: TFileLineContext,
    err: Error,
    callerFn?: CallableFunction
  ) {
    super(err.message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, callerFn || this.constructor);
    this.name = this.constructor.name;

    this.lineNumber = context.lineNumber;
    this.inputFileName = context.inputFileName || '';
    this.at = context.inputFileName
      ? `${context.inputFileName}:${context.lineNumber}`
      : '';
    this.lineValue = context.value || '';
  }
}
