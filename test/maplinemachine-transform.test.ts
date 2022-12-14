import mock from 'mock-fs';

import {mapLineMachine} from '../src/maplinemachine';
import type {TAsyncMapLineFn} from '../src/maplinemachine';
import stream from 'stream';

import * as mStream from 'memory-streams';
import * as fs from 'fs';

beforeEach(() => {
  mock({
    'my-dir': {
      'my-file.txt': 'Hello, \nWorld!',
      'dolly-text.txt': 'hello\nDolly\n nwelcome \n',
    },
  });
  mock.file();
});
const PATH_PREFIX = './my-dir';

afterEach(() => {
  mock.restore();
});

describe('transform', () => {
  const lineNumberFn: TAsyncMapLineFn = async (
    line: string,
    lineNumber: number
  ): Promise<string> => {
    return `${lineNumber}: ${line}`;
  };

  const noDollyFn: TAsyncMapLineFn = async (line: string) => {
    if (line.trim() === 'Dolly') {
      return null;
    }
    return line;
  };

  let input: stream.Readable;
  let output: stream.Writable;
  beforeEach(() => {
    input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
    output = new mStream.WritableStream();
  });

  test('line numbers', async () => {
    const lnMachine = mapLineMachine(lineNumberFn);

    const res = await lnMachine(input, output);

    expect(res.linesRead).toEqual(2);
    expect(output.toString()).toEqual('1: Hello, \n2: World!');
  });

  test('outputs less lines if fn returns null', async () => {
    const inputWithDolly = fs.createReadStream(`${PATH_PREFIX}/dolly-text.txt`);

    const lnMachine = mapLineMachine(noDollyFn);

    const res = await lnMachine(inputWithDolly, output);

    expect(res.linesRead).toEqual(4); //line read count remains the same
    expect(output.toString()).toEqual('hello\n nwelcome \n');
  });

  test('outputs more lines if fn returns a string with newLine(s)', async () => {
    const nlFn: TAsyncMapLineFn = async (line: string) => `-\n${line}`;

    const lnMachine = mapLineMachine(nlFn);

    const res = await lnMachine(input, output);
    expect(res.linesRead).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
  });

  test('transfers Fn Error - async', async () => {
    const fnWithErr: TAsyncMapLineFn = async (
      line: string,
      lineNumber: number
    ) => {
      if (lineNumber === 2) {
        throw new Error('line is 2!');
        // return Promise.reject(new Error('line is 2!'));
      }
      return `-\n${line}`;
    };

    const lnMachine = mapLineMachine(fnWithErr);
    await expect(lnMachine(input, output)).rejects.toThrow('line is 2!');
  });

  test('transfers this in Fn - async', async () => {
    async function fnWithThis(line: string, lineNumber: number) {
      if (lineNumber === this?.lineNum) {
        return null;
      }
      return line;
    }

    const lnMachine = mapLineMachine(fnWithThis.bind({lineNum: 2}));
    const res = await lnMachine(input, output);
    expect(res.linesRead).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('Hello, ');
  });

  // test('sync fn', async () => {
  //   const syncFn = async (line: string) => `(${line})`;
  //   const lnMachine = mapLineMachine(syncFn, {rememberEndOfLines: false});

  //   const res = await lnMachine(input, output);

  //   expect(res.linesRead).toEqual(2);
  //   expect(output.toString()).toEqual('(Hello, )(World1!)');
  // });
});
