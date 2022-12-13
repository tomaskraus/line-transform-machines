import stream from 'stream';
export type TLineStats = {
    linesRead: number;
};
export type TLineMapFn = (line: string) => Promise<string>;
export declare const streamLineTransformer: (asyncLineMapFn: TLineMapFn) => (input: stream.Readable, output: stream.Writable) => Promise<TLineStats>;
