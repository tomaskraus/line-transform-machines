import type { TFileStreamContext } from './utils/filestreamwrapper';
import type { TFileProcessor } from './utils/filestreamwrapper';
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
export declare const mapLineMachine: (asyncMapFn: TAsyncMapLineFn, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileStreamContext>;
