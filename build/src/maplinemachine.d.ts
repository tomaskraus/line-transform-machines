import type { TFileStreamContext } from './utils/filestreamwrapper';
import type { TFileProcessor } from './utils/filestreamwrapper';
export type TMapLineFn = (line: string, lineNumber: number) => string | null;
export type TAsyncMapLineFn = (line: string, lineNumber: number) => Promise<string | null>;
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
export declare const mapLineMachine: (mapFn: TMapLineFn | TAsyncMapLineFn, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileStreamContext>;
