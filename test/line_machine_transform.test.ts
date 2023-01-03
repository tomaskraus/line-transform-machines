import mock from 'mock-fs';

import {createLineMachine} from '../src/line_machine';
import type {TMapLineCallback} from '../src/line_machine';
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
  const lineNumberFn: TMapLineCallback = (
    line: string,
    lineNumber: number
  ): string => {
    return `${lineNumber}: ${line}`;
  };

  const noDollyFn: TMapLineCallback = (line: string) => {
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
    const nlFn: TMapLineCallback = (line: string) => `-\n${line}`;

    const lnMachine = createLineMachine(nlFn);

    const res = await lnMachine(input, output);
    expect(res.lineNumber).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
  });

  test('transfers this in Fn', async () => {
    function fnWithThis(line: string, lineNumber: number) {
      if (lineNumber === this?.lineNum) {
        return null;
      }
      return line;
    }

    const lnMachine = createLineMachine(fnWithThis, {
      thisArg: {lineNum: 2},
    });
    // same as:
    // const lnMachine = mapLineMachine(fnWithThis.bind({lineNum: 2}));

    const res = await lnMachine(input, output);
    expect(res.lineNumber).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('Hello, ');
  });
});

describe('transform - error handling', () => {
  const fnWithErr: TMapLineCallback = (line: string, lineNumber: number) => {
    if (lineNumber === 2) {
      throw new Error('line2 err!');
      // return Promise.reject(new Error('line is 2!'));
    }
    return `-\n${line}`;
  };

  test('transfers Fn Error - include error message', async () => {
    const lnMachine = createLineMachine(fnWithErr);
    await expect(lnMachine(input, output)).rejects.toThrow('line2 err!');
  });

  test('transfers Fn Error - include input stream line info', async () => {
    const lnMachine = createLineMachine(fnWithErr);
    await expect(lnMachine(input, output)).rejects.toThrow('line [2]');
  });

  test('transfers Fn Error - include file & line info', async () => {
    const lnMachine = createLineMachine(fnWithErr);
    await expect(
      lnMachine(`${PATH_PREFIX}/dolly-text.txt`, output)
    ).rejects.toThrow('/dolly-text.txt:2');
  });
});
