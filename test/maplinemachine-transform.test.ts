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
    return Promise.resolve(`${lineNumber}: ${line}`);
  };

  const noDollyFn: TAsyncMapLineFn = async (line: string) => {
    if (line.trim() === 'Dolly') {
      return Promise.resolve(null);
    }
    return Promise.resolve(line);
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
    const nlFn: TAsyncMapLineFn = async (line: string) =>
      Promise.resolve(`-\n${line}`);

    const lnMachine = mapLineMachine(nlFn);

    const res = await lnMachine(input, output);
    expect(res.linesRead).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
  });
});
