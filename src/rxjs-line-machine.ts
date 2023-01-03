import {Observable, from, tap} from 'rxjs';

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

export const createRxJSLineMachine = (
  observableDecorator: (obs: Observable<string>) => Observable<string>,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileLineContext> => {
  const lineStreamCallback: TLineStreamCallback = async (
    lineStream,
    writeOutput,
    context //, opts
  ): Promise<TFileLineContext> => {
    const initialObservable: Observable<string> = from(lineStream).pipe(
      tap(() => context.lineNumber++)
    );

    return new Promise((resolve, reject) =>
      observableDecorator(initialObservable).subscribe({
        next: line => writeOutput(line),
        error: err => {
          reject(addLineInfoToErrorObj(context)(err as Error));
        },
        complete: () => resolve(context),
      })
    );
  };

  return fileLineProcessorWrapper(lineStreamCallback, options);
};
