import {Observable, from, tap, map} from 'rxjs';

import {
  addLineInfoToErrorObj,
  fileLineProcessorWrapper,
} from './line_machine_common';
import type {TFileProcessor} from './utils/file_stream_wrapper';
import type {
  TLineMachineOptions,
  TFileLineContext,
  TLineStreamCallback,
} from './line_machine_common';

export type TLineItem = {
  value: string;
  lineNumber: number;
};

export const createRxjsLineMachine = (
  observableDecorator: (
    obs: Observable<{value: string; lineNumber: number}>
  ) => Observable<string>,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileLineContext> => {
  const lineStreamCallback: TLineStreamCallback = async (
    lineStream,
    writeOutput,
    context //, opts
  ): Promise<TFileLineContext> => {
    const initialObservable: Observable<TLineItem> = from(lineStream).pipe(
      tap(() => context.lineNumber++),
      map(s => ({value: s, lineNumber: context.lineNumber}))
    );

    return new Promise((resolve, reject) =>
      observableDecorator(initialObservable).subscribe({
        next: line => writeOutput(line), // more obvious than just "next: writeOutput"
        error: err => {
          reject(addLineInfoToErrorObj(context)(err as Error));
        },
        complete: () => resolve(context),
      })
    );
  };

  return fileLineProcessorWrapper(lineStreamCallback, options);
};
