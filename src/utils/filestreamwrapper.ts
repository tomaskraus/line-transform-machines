/**
 * adds file capability to stream processor
 */

import stream from 'stream';
import * as fsp from 'node:fs/promises';

export type TFileStreamContext = {
  inputFileName?: string;
  outputFileName?: string;
  linesRead: number;
};

export const getContextInfoStr = (context: TFileStreamContext): string => {
  if (context.inputFileName) {
    return `[${context.inputFileName}:${context.linesRead}]`;
  }
  return `line [${context.linesRead}]`;
};

export type TStreamProcessor<TResult> = (
  input: stream.Readable,
  output: stream.Writable,
  context: TFileStreamContext
) => Promise<TResult>;

export type TFileProcessor<TResult> = (
  inputFileNameOrStream: stream.Readable | string,
  outputFileNameOrStream: stream.Writable | string
  // options?: TOptions
) => Promise<TResult>;

export const fileStreamWrapper = <TResult>(
  proc: TStreamProcessor<TResult>
): TFileProcessor<TResult> => {
  return (
    inputFileNameOrStream: stream.Readable | string,
    outputFileNameOrStream: stream.Writable | string
    // options?: TOptions
  ) => {
    return new Promise<TResult>((resolve, reject) => {
      const continueWithInStreamReady = (
        inStream: stream.Readable,
        outStream: stream.Writable,
        context: TFileStreamContext
      ) => {
        inStream.on('error', err => reject(err));
        proc(inStream, outStream, context)
          .then((res: TResult) => {
            // outStream.end();   // closes also stdout
            resolve(res);
          })
          .catch(err => reject(err));
      };

      const continueWithOutStreamReady = (
        outStream: stream.Writable,
        context: TFileStreamContext
      ): void => {
        outStream.on('error', err => reject(err));
        if (typeof inputFileNameOrStream === 'string') {
          fsp
            .open(inputFileNameOrStream)
            .then(fhi =>
              continueWithInStreamReady(fhi.createReadStream(), outStream, {
                ...context,
                inputFileName: inputFileNameOrStream,
              })
            )
            .catch(err => reject(err));
        } else {
          continueWithInStreamReady(inputFileNameOrStream, outStream, context);
        }
      };

      const context: TFileStreamContext = {linesRead: 0};
      if (typeof outputFileNameOrStream === 'string') {
        fsp
          .open(outputFileNameOrStream, 'w')
          .then(fho =>
            continueWithOutStreamReady(fho.createWriteStream(), {
              ...context,
              outputFileName: outputFileNameOrStream,
            })
          )
          .catch(err => reject(err));
      } else {
        continueWithOutStreamReady(outputFileNameOrStream, context);
      }
    });
  };
};
