/**
 * common stuff for all lineMachines
 */
import stream from 'stream';
import ReadlineTransform from 'readline-transform';
import type { TFileStreamContext } from './utils/file_stream_wrapper';
import type { TFileProcessor } from './utils/file_stream_wrapper';
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
export declare const DEFAULT_LINEMACHINE_OPTIONS: TLineMachineOptions;
export declare const createOutputWriter: (output: stream.Writable, options: TLineMachineOptions) => (line: string | null) => Promise<void>;
export type TLineStreamCallback = (lineStream: ReadlineTransform, writeOutput: (line: string | null) => Promise<void>, fileLineContext: TFileLineContext, options: TLineMachineOptions) => Promise<TFileLineContext>;
export declare const fileLineProcessorWrapper: (lineStreamCallback: TLineStreamCallback, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileLineContext>;
export declare const getLineContextInfo: (context: TFileLineContext) => string;
export declare const addLineInfoToErrorObj: (context: TFileLineContext) => (err: Error) => Error;
