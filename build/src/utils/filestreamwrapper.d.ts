/**
 * adds file capability to stream processor
 */
/// <reference types="node" />
import stream from 'stream';
export type TFileStreamStats = {
    inputFileName?: string;
    outputFileName?: string;
    linesRead: number;
};
export type TStreamProcessor<TResult> = (input: stream.Readable, output: stream.Writable, fileStats: TFileStreamStats) => Promise<TResult>;
export type TFileProcessor<TResult> = (inputFileNameOrStream: stream.Readable | string, outputFileNameOrStream: stream.Writable | string) => Promise<TResult>;
export declare const fileStreamWrapper: <TResult>(proc: TStreamProcessor<TResult>) => TFileProcessor<TResult>;
