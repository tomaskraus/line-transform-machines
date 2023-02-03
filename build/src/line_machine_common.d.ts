/**
 * common stuff for all lineMachines
 */
import ReadlineTransform from 'readline-transform';
import type { TFileStreamContext } from './utils/file_stream_wrapper';
import type { TFileProcessor } from './utils/file_stream_wrapper';
export type TFileLineContext = TFileStreamContext & {
    value?: string;
    lineNumber: number;
};
export declare const getFileLineInfo: (context: TFileLineContext) => string | undefined;
/**
 * Options
 */
export type TLineMachineOptions = {
    /**
     * remembers...
     */
    rememberEndOfLines: boolean;
};
export declare const DEFAULT_LINEMACHINE_OPTIONS: TLineMachineOptions;
export type TLineStreamCallback = (lineStream: ReadlineTransform, writeOutput: (line: string | null) => Promise<void>, fileLineContext: TFileLineContext, options: TLineMachineOptions) => Promise<TFileLineContext>;
export declare const fileLineProcessorWrapper: (lineStreamCallback: TLineStreamCallback, options?: Partial<TLineMachineOptions>) => TFileProcessor<TFileLineContext>;
/**
 * Provides additional LineMachine info, such as input line number, line content and input file name
 */
export declare class LineMachineError extends Error {
    /**
     * Combination of input file and line number. Is empty if a stream is an input.
     */
    at: string;
    /**
     * Input line content.
     */
    lineValue: string;
    /**
     * Input line number. From Stream or File.
     */
    lineNumber: Number;
    /**
     * Is empty if a stream is an input.
     */
    inputFileName: string;
    constructor(context: TFileLineContext, err: Error, callerFn?: CallableFunction);
}
