import mock from 'mock-fs';

import {createAsyncLineMachine} from '../src/async_line_machine';
import type {TAsyncLineCallback} from '../src/async_line_machine';
import stream from 'stream';

import * as mStream from 'memory-streams';
import * as fs from 'fs';
import {LineMachineError} from '../src/line_machine_common';

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
  const lineNumberAsyncFn: TAsyncLineCallback = (
    line: string,
    lineNumber: number,
    fileLineInfo?: string
  ): Promise<string> => {
    if (fileLineInfo) {
      return Promise.resolve(`${fileLineInfo}: ${line}`);
    }
    return Promise.resolve(`${lineNumber}: ${line}`);
  };

  const noDollyAsyncFn: TAsyncLineCallback = (line: string) => {
    if (line.trim() === 'Dolly') {
      return Promise.resolve(null);
    }
    return Promise.resolve(line);
  };

  test('line numbers', async () => {
    const lnMachine = createAsyncLineMachine(lineNumberAsyncFn);

    const res = await lnMachine(input, output);

    expect(res.lineNumber).toEqual(2);
    expect(output.toString()).toEqual('1: Hello, \n2: World!');
  });

  test('if input from file, contains fileLine info', async () => {
    const lnMachine = createAsyncLineMachine(lineNumberAsyncFn);

    const res = await lnMachine(`${PATH_PREFIX}/my-file.txt`, output);

    expect(res.lineNumber).toEqual(2);
    expect(output.toString()).toEqual(
      `${PATH_PREFIX}/my-file.txt:1: Hello, \n${PATH_PREFIX}/my-file.txt:2: World!`
    );
  });

  test('outputs less lines if fn returns null', async () => {
    const inputWithDolly = fs.createReadStream(`${PATH_PREFIX}/dolly-text.txt`);

    const lnMachine = createAsyncLineMachine(noDollyAsyncFn);

    const res = await lnMachine(inputWithDolly, output);

    expect(res.lineNumber).toEqual(4); //line read count remains the same
    expect(output.toString()).toEqual('hello\n nwelcome \n');
  });

  test('outputs more lines if fn returns a string with newLine(s)', async () => {
    const nlFn: TAsyncLineCallback = (line: string) =>
      Promise.resolve(`-\n${line}`);

    const lnMachine = createAsyncLineMachine(nlFn);

    const res = await lnMachine(input, output);
    expect(res.lineNumber).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
  });
});

describe('transform - error handling', () => {
  const fnWithErr: TAsyncLineCallback = (line: string, lineNumber: number) => {
    if (lineNumber === 2) {
      return Promise.reject(new Error('line2 err!'));
    }
    return Promise.resolve(`-\n${line}`);
  };

  test('input stream line Error: include line value, input stream line number and Error message', async () => {
    expect.assertions(6);
    const lnMachine = createAsyncLineMachine(fnWithErr);
    try {
      await lnMachine(input, output);
    } catch (e) {
      expect(e).toBeInstanceOf(LineMachineError);
      const lerr = e as LineMachineError;
      expect(lerr.lineNumber).toEqual(2);
      expect(lerr.inputFileName).toEqual('');
      expect(lerr.at).toEqual('');
      expect(lerr.lineValue).toContain('World!');
      expect(lerr.message).toContain('line2 err!');
    }
  });

  test('input file line Error, custom resourceDir: include line value, file name & line number and Error message', async () => {
    expect.assertions(6);
    const lnMachine = createAsyncLineMachine(fnWithErr);
    try {
      await lnMachine(`${PATH_PREFIX}/dolly-text.txt`, output);
    } catch (e) {
      expect(e).toBeInstanceOf(LineMachineError);
      const lerr = e as LineMachineError;
      expect(lerr.lineNumber).toEqual(2);
      expect(lerr.inputFileName).toEqual(`${PATH_PREFIX}/dolly-text.txt`);
      expect(lerr.at).toEqual(`${PATH_PREFIX}/dolly-text.txt:2`);
      expect(lerr.lineValue).toContain('Dolly');
      expect(lerr.message).toContain('line2 err!');
    }
  });
});
