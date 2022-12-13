import stream from 'stream';
import ReadlineTransform from 'readline-transform';
import {once} from 'events';
import {fileStreamWrapper} from './utils/filestreamwrapper';
import type {TStreamProcessor, TFileProcessor} from './utils/filestreamwrapper';

export type TInputStats = {
  fileName?: string;
  linesRead: number;
};

export type TAsyncMapLineFn = (
  line: string,
  lineNumber: number
) => Promise<string | null>;

export const mapLineMachine = (
  asyncMapFn: TAsyncMapLineFn,
  includeLineEnds = false
): TFileProcessor<TInputStats> => {
  const proc: TStreamProcessor<TInputStats> = async (
    input: stream.Readable,
    output: stream.Writable
  ): Promise<TInputStats> => {
    const transformToLines = new ReadlineTransform({ignoreEndOfBreak: false});
    const r = input.pipe(transformToLines);
    let linesRead = 0;
    for await (const line of r) {
      linesRead++;
      let lineResult = await asyncMapFn(line, linesRead);
      if (lineResult !== null && includeLineEnds && linesRead > 1) {
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
    return Promise.resolve({linesRead});
  };

  return fileStreamWrapper<TInputStats>(proc);
};
