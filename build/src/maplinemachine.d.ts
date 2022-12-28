import type { TFileStreamContext } from './utils/filestreamwrapper';
import type { TFileProcessor } from './utils/filestreamwrapper';
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
export declare const createMapLineMachine: (callback: TMapLineCallback | TAsyncMapLineCallback, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileStreamContext>;
