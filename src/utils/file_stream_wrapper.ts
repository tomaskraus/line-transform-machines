/**
 * adds file capability to stream processor
 */

import stream from 'stream';
import * as fsp from 'node:fs/promises';
import * as pth from 'node:path';

export type TFileStreamContext = {
  inputFileName?: string;
  outputFileName?: string;
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

const _createOutputFile = async (fileName: string): Promise<fsp.FileHandle> => {
  const dirPath = pth.dirname(fileName);
  if (dirPath !== '.') {
    return fsp
      .mkdir(dirPath, {recursive: true})
      .then(() => fsp.open(fileName, 'w'));
  }
  return fsp.open(fileName, 'w');
};

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
            .then(inputFileHandle =>
              continueWithInStreamReady(
                inputFileHandle.createReadStream(),
                outStream,
                {
                  ...context,
                  inputFileName: inputFileNameOrStream,
                }
              )
            )
            .catch(err => reject(err));
        } else {
          continueWithInStreamReady(inputFileNameOrStream, outStream, context);
        }
      };

      const context: TFileStreamContext = {};
      if (typeof outputFileNameOrStream === 'string') {
        _createOutputFile(outputFileNameOrStream)
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
