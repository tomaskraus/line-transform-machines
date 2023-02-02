import mock from 'mock-fs';

import {createLineMachine} from '../src/line_machine';
import type {TLineCallback} from '../src/line_machine';
import {LineMachineError} from '../src/line_machine_common';
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
  const lineNumberFn: TLineCallback = (
    line: string,
    lineNumber: number
  ): string => {
    return `${lineNumber}: ${line}`;
  };

  const noDollyFn: TLineCallback = (line: string) => {
    if (line.trim() === 'Dolly') {
      return null;
    }
    return line;
  };

  test('line numbers', async () => {
    const lnMachine = createLineMachine(lineNumberFn);

    const res = await lnMachine(input, output);

    expect(res.lineNumber).toEqual(2);
    expect(output.toString()).toEqual('1: Hello, \n2: World!');
  });

  test('outputs less lines if fn returns null', async () => {
    const inputWithDolly = fs.createReadStream(`${PATH_PREFIX}/dolly-text.txt`);

    const lnMachine = createLineMachine(noDollyFn);

    const res = await lnMachine(inputWithDolly, output);

    expect(res.lineNumber).toEqual(4); //line read count remains the same
    expect(output.toString()).toEqual('hello\n nwelcome \n');
  });

  test('outputs more lines if fn returns a string with newLine(s)', async () => {
    const nlFn: TLineCallback = (line: string) => `-\n${line}`;

    const lnMachine = createLineMachine(nlFn);

    const res = await lnMachine(input, output);
    expect(res.lineNumber).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
  });
});

describe('transform - error handling', () => {
  const fnWithErr: TLineCallback = (line: string, lineNumber: number) => {
    if (lineNumber === 2) {
      throw new Error('line2 err!');
      // return Promise.reject(new Error('line is 2!'));
    }
    return `-\n${line}`;
  };

  test('input stream line Error: include line value, input stream line number and Error message', async () => {
    expect.assertions(6);
    const lnMachine = createLineMachine(fnWithErr);
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

  test('input file line Error: include line value, file name & line number and Error message', async () => {
    expect.assertions(6);
    const lnMachine = createLineMachine(fnWithErr);
    try {
      await lnMachine(`${PATH_PREFIX}/dolly-text.txt`, output);
    } catch (e) {
      expect(e).toBeInstanceOf(LineMachineError);
      const lerr = e as LineMachineError;
      expect(lerr.lineNumber).toEqual(2);
      expect(lerr.inputFileName).toContain('/dolly-text.txt');
      expect(lerr.at).toContain('/dolly-text.txt:2');
      expect(lerr.lineValue).toContain('Dolly');
      expect(lerr.message).toContain('line2 err!');
    }
  });
});
