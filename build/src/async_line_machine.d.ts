import type { TFileProcessor } from './utils/file_stream_wrapper';
import type { TLineMachineOptions, TFileLineContext } from './line_machine_common';
export type TAsyncMapLineCallback = (line: string, lineNumber: number) => Promise<string | null>;
export declare const createAsyncLineMachine: (callback: TAsyncMapLineCallback, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileLineContext>;
