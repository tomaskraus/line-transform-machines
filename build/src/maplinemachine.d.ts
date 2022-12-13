import type { TFileProcessor } from './utils/filestreamwrapper';
export type TInputStats = {
    fileName?: string;
    linesRead: number;
};
export type TAsyncMapLineFn = (line: string, lineNumber: number) => Promise<string | null>;
export declare const mapLineMachine: (asyncMapFn: TAsyncMapLineFn, includeLineEnds?: boolean) => TFileProcessor<TInputStats>;
