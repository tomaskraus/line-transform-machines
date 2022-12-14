import type { TFileStreamContext } from './utils/file_stream_wrapper';
import type { TFileProcessor } from './utils/file_stream_wrapper';
export type TFileLineContext = TFileStreamContext & {
    lineNumber: number;
};
export type TMapLineCallback = (line: string, lineNumber: number) => string | null;
export type TAsyncMapLineCallback = (line: string, lineNumber: number) => Promise<string | null>;
/**
 * Options
 */
export type TLineMachineOptions = {
    /**
     * remembers...
     */
    rememberEndOfLines: boolean;
    useAsyncFn: boolean;
    thisArg: any;
};
export declare const DEFAULT_LTM_OPTIONS: TLineMachineOptions;
export declare const createLineMachine: (callback: TMapLineCallback | TAsyncMapLineCallback, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileLineContext>;
