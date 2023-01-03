import type { TFileProcessor } from './utils/filestreamwrapper';
import type { TLineMachineOptions, TFileLineContext } from './line_machine_common';
export type TMapLineCallback = (line: string, lineNumber: number) => string | null;
export type TAsyncMapLineCallback = (line: string, lineNumber: number) => Promise<string | null>;
export declare const createLineMachine: (callback: TMapLineCallback | TAsyncMapLineCallback, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileLineContext>;
