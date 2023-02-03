import { Observable } from 'rxjs';
import type { TFileProcessor } from './utils/file_stream_wrapper';
import type { TLineMachineOptions, TFileLineContext } from './line_machine_common';
export type TLineItem = {
    value: string;
    lineNumber: number;
    fileLineInfo?: string;
};
export type TLineMachineDecorator = (source: Observable<TLineItem>) => Observable<string>;
export declare const createRxjsLineMachine: (observableDecorator: (source: Observable<{
    value: string;
    lineNumber: number;
    fileLineInfo?: string;
}>) => Observable<string>, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileLineContext>;
