import mock from 'mock-fs';

import {Observable, map, filter, reduce, concatMap} from 'rxjs';

import {createRxjsLineMachine} from '../src/rxjs_line_machine';
import type {TLineItem, TLineMachineDecorator} from '../src/rxjs_line_machine';
import stream from 'stream';

import * as mStream from 'memory-streams';
import * as fs from 'fs';

let input: stream.Readable;
let output: stream.Writable;
beforeEach(() => {});

beforeEach(() => {
  mock({
    'my-dir': {
      'my-file.txt': 'Hello, \nWorld!',
      'dolly-text.txt': 'hello\nDolly\n nwelcome \n',
    },
  });
  mock.file();

  input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
  output = new mStream.WritableStream();
});
const PATH_PREFIX = './my-dir';

afterEach(() => {
  mock.restore();
});

describe('transform', () => {
  const lineNumberFn = (item: TLineItem): string => {
    return `${item.lineNumber}: ${item.value}`;
  };
  const lineNumberDecorator: TLineMachineDecorator = (
    source: Observable<TLineItem>
  ): Observable<string> => source.pipe(map(lineNumberFn));

  const noDollyFn = (item: TLineItem): boolean => {
    return item.value.trim() !== 'Dolly';
  };
  const noDollyDecorator = (source: Observable<TLineItem>) =>
    source.pipe(
      filter(noDollyFn),
      map(x => x.value)
    );

  test('line numbers', async () => {
    const lnMachine = createRxjsLineMachine(lineNumberDecorator);

    const res = await lnMachine(input, output);

    expect(res.lineNumber).toEqual(2);
    expect(output.toString()).toEqual('1: Hello, \n2: World!');
  });

  test('outputs less lines if decorator filters', async () => {
    const inputWithDolly = fs.createReadStream(`${PATH_PREFIX}/dolly-text.txt`);

    const lnMachine = createRxjsLineMachine(noDollyDecorator);

    const res = await lnMachine(inputWithDolly, output);

    expect(res.lineNumber).toEqual(4); //line read count remains the same
    expect(output.toString()).toEqual('hello\n nwelcome \n');
  });

  test('outputs more lines if decorator returns a string with newLine(s)', async () => {
    const nlDeco: TLineMachineDecorator = (src: Observable<TLineItem>) =>
      src.pipe(map(({value}) => `-\n${value}`));

    const lnMachine = createRxjsLineMachine(nlDeco);
    const res = await lnMachine(input, output);
    expect(res.lineNumber).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
  });

  test('does "reduce" well', async () => {
    const lineCountDeco: TLineMachineDecorator = (src: Observable<TLineItem>) =>
      src.pipe(
        reduce((count: number) => count + 1, 0),
        map((n: number) => `Line count: ${n}`)
      );

    const lnMachine = createRxjsLineMachine(lineCountDeco);
    const res = await lnMachine(input, output);
    expect(res.lineNumber).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('Line count: 2');
  });

  test('does "async fn" well (use RxJS concatMap)', async () => {
    const toUpperAsync = (s: string): Promise<string> => {
      return new Promise(resolve =>
        setTimeout(() => resolve(s.toUpperCase()), 0)
      );
    };

    const nonEmptyLinesToUpper: TLineMachineDecorator = (
      source: Observable<TLineItem>
    ): Observable<string> => {
      return source.pipe(
        map(x => x.value),
        concatMap(s => toUpperAsync(s))
      );
    };

    const lnMachine = createRxjsLineMachine(nonEmptyLinesToUpper);
    const res = await lnMachine(input, output);
    expect(res.lineNumber).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('HELLO, \nWORLD!');
  });
});

describe('transform - error handling', () => {
  const fnWithErr: (x: TLineItem) => string = ({value, lineNumber}) => {
    if (lineNumber === 2) {
      throw new Error('line2 err!');
    }
    return `-\n${value}`;
  };

  const decoWithErr: TLineMachineDecorator = source =>
    source.pipe(map(fnWithErr));

  test('input stream line Error: include line value, input stream line number and Error message', async () => {
    expect.assertions(3);
    const lnMachine = createRxjsLineMachine(decoWithErr);
    try {
      await lnMachine(input, output);
    } catch (e) {
      expect((e as Error).message).toContain('World!'); //line
      expect((e as Error).message).toContain('line [2]'); //line info
      expect((e as Error).message).toContain('line2 err!'); //err
    }
  });

  test('input file line Error: include line value, file name & line number and Error message', async () => {
    expect.assertions(3);
    const lnMachine = createRxjsLineMachine(decoWithErr);
    try {
      await lnMachine(`${PATH_PREFIX}/dolly-text.txt`, output);
    } catch (e) {
      expect((e as Error).message).toContain('Dolly'); //line
      expect((e as Error).message).toContain('/dolly-text.txt:2'); //file&line info
      expect((e as Error).message).toContain('line2 err!'); //err
    }
  });
});
