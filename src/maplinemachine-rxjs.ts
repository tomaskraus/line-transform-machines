import stream from 'stream';
import ReadlineTransform from 'readline-transform';
import {fileStreamWrapper} from './utils/filestreamwrapper';
import {Observable, from, tap} from 'rxjs';
import type {TFileStreamContext} from './utils/filestreamwrapper';
import type {TStreamProcessor, TFileProcessor} from './utils/filestreamwrapper';

import type {TLineMachineOptions, TFileLineContext} from './linemachine-common';
import {
  DEFAULT_LINEMACHINE_OPTIONS,
  createOutputWriter,
  getLineContextInfo,
} from './linemachine-common';

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
    const initialObservable: Observable<string> = from(r).pipe(
      tap(() => context.lineNumber++)
    );

    return new Promise((reject, resolve) =>
      observableDecorator(initialObservable).subscribe({
        next: writeOutput,
        error: err => {
          (err as Error).message = `${getLineContextInfo(context)}\n${
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
