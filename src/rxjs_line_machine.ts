import {Observable, from, tap, map} from 'rxjs';

import {
  LineMachineError,
  fileLineProcessorWrapper,
  getFileLineInfo,
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
  fileLineInfo?: string;
};

export type TLineMachineDecorator = (
  source: Observable<TLineItem>
) => Observable<string>;

export const createRxjsLineMachine = (
  observableDecorator: (
    source: Observable<{
      value: string;
      lineNumber: number;
      fileLineInfo?: string;
    }>
  ) => Observable<string>,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileLineContext> => {
  const lineStreamCallback: TLineStreamCallback = async (
    lineStream,
    writeOutput,
    context //, opts
  ): Promise<TFileLineContext> => {
    const initialObservable: Observable<TLineItem> = from(lineStream).pipe(
      tap((s: string) => {
        context.value = s;
        context.lineNumber++;
      }),
      map(s => ({
        value: s,
        lineNumber: context.lineNumber,
        fileLineInfo: getFileLineInfo(context),
      }))
    );

    return new Promise((resolve, reject) =>
      observableDecorator(initialObservable).subscribe({
        next: line => writeOutput(line), // more obvious than just "next: writeOutput"
        error: err => {
          reject(
            new LineMachineError(context, err as Error, lineStreamCallback)
          );
        },
        complete: () => resolve(context),
      })
    );
  };

  return fileLineProcessorWrapper(lineStreamCallback, options);
};
