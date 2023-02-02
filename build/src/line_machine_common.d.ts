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
export declare const getLineContextInfo: (context: TFileLineContext) => string;
export declare class LineMachineError extends Error {
    static getLineContextInfo(context: TFileLineContext): string;
    constructor(context: TFileLineContext, err: Error);
}
