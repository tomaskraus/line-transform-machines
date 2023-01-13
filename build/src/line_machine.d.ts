import type { TFileProcessor } from './utils/file_stream_wrapper';
import type { TLineMachineOptions, TFileLineContext } from './line_machine_common';
export type TLineCallback = (line: string, lineNumber: number) => string | null;
export declare const createLineMachine: (callback: TLineCallback, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileLineContext>;
