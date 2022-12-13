/**
 * adds file capability to stream processor
 */
/// <reference types="node" />
import stream from 'stream';
export type TStreamProcessor<TResult> = (input: stream.Readable, output: stream.Writable) => Promise<TResult>;
export type TFileProcessor<TResult> = (inputFileNameOrStream: stream.Readable | string, outputFileNameOrStream: stream.Writable | string) => Promise<TResult>;
export declare const fileStreamWrapper: <TResult>(proc: TStreamProcessor<TResult>) => TFileProcessor<TResult>;
