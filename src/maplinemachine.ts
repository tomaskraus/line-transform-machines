import stream from 'stream';
import ReadlineTransform from 'readline-transform';
import {once} from 'events';
import {fileStreamWrapper} from './utils/filestreamwrapper';
import type {TFileStreamStats} from './utils/filestreamwrapper';
import type {TStreamProcessor, TFileProcessor} from './utils/filestreamwrapper';

export type TAsyncMapLineFn = (
  line: string,
  lineNumber: number
) => Promise<string | null>;

/**
 * Options
 */
export type TLineMachineOptions = {
  /**
   * remembers...
   */
  rememberEndOfLines: boolean;
  useAsyncFn: boolean;
};

export const DEFAULT_LTM_OPTIONS: TLineMachineOptions = {
  rememberEndOfLines: true,
  useAsyncFn: false,
};

export const mapLineMachine = (
  asyncMapFn: TAsyncMapLineFn,
  options?: Partial<TLineMachineOptions>
): TFileProcessor<TFileStreamStats> => {
  const proc: TStreamProcessor<TFileStreamStats> = async (
    input: stream.Readable,
    output: stream.Writable,
    fileStats: TFileStreamStats
  ): Promise<TFileStreamStats> => {
    const finalOptions = {
      ...DEFAULT_LTM_OPTIONS,
      ...options,
    };
    const transformToLines = new ReadlineTransform({ignoreEndOfBreak: false});
    const r = input.pipe(transformToLines);
    fileStats.linesRead = 0;
    for await (const line of r) {
      fileStats.linesRead++;
      let lineResult = await asyncMapFn(line, fileStats.linesRead);
      if (
        lineResult !== null &&
        finalOptions.rememberEndOfLines === true &&
        fileStats.linesRead > 1
      ) {
        lineResult = '\n' + lineResult;
      }
      if (lineResult !== null && lineResult !== '') {
        const canContinue = output.write(lineResult);
        // from https://www.nodejsdesignpatterns.com/blog/javascript-async-iterators/
        if (!canContinue) {
          // backpressure, now we stop and we need to wait for drain
          await once(output, 'drain');
          // ok now it's safe to resume writing
        }
      }
    }
    return Promise.resolve(fileStats);
  };

  return fileStreamWrapper<TFileStreamStats>(proc);
};
