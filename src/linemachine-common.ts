/**
 * common stuff for all lineMachines
 */

import stream from 'stream';
import {once} from 'events';

import type {TFileStreamContext} from './utils/filestreamwrapper';

export type TFileLineContext = TFileStreamContext & {lineNumber: number};

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

export const createOutputWriter = (
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

export const getLineContextInfo = (context: TFileLineContext): string => {
  if (context.inputFileName) {
    return `[${context.inputFileName}:${context.lineNumber}]`;
  }
  return `line [${context.lineNumber}]`;
};
