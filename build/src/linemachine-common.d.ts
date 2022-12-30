/**
 * common stuff for all lineMachines
 */
import stream from 'stream';
import type { TFileStreamContext } from './utils/filestreamwrapper';
export type TFileLineContext = TFileStreamContext & {
    lineNumber: number;
};
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
export declare const createOutputWriter: (output: stream.Writable, options: TLineMachineOptions) => (line: string | null) => Promise<void>;
export declare const getLineContextInfo: (context: TFileLineContext) => string;
