import { Observable } from 'rxjs';
import type { TFileStreamContext } from './utils/filestreamwrapper';
import type { TFileProcessor } from './utils/filestreamwrapper';
export type TMapLineCallback = (line: string, lineNumber: number) => string | null;
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
export declare const createMapLineMachine: (callback: TMapLineCallback | TAsyncMapLineFn, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileStreamContext>;
export declare const createMapLineMachineRxjs: (observableDecorator: (obs: Observable<string>) => Observable<string>, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileStreamContext>;
