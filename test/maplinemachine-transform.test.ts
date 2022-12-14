import mock from 'mock-fs';

import {createMapLineMachine} from '../src/maplinemachine';
import type {TMapLineFn} from '../src/maplinemachine';
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
  const lineNumberFn: TMapLineFn = (
    line: string,
    lineNumber: number
  ): string => {
    return `${lineNumber}: ${line}`;
  };

  const noDollyFn: TMapLineFn = (line: string) => {
    if (line.trim() === 'Dolly') {
      return null;
    }
    return line;
  };

  test('line numbers', async () => {
    const lnMachine = createMapLineMachine(lineNumberFn);

    const res = await lnMachine(input, output);

    expect(res.linesRead).toEqual(2);
    expect(output.toString()).toEqual('1: Hello, \n2: World!');
  });

  test('outputs less lines if fn returns null', async () => {
    const inputWithDolly = fs.createReadStream(`${PATH_PREFIX}/dolly-text.txt`);

    const lnMachine = createMapLineMachine(noDollyFn);

    const res = await lnMachine(inputWithDolly, output);

    expect(res.linesRead).toEqual(4); //line read count remains the same
    expect(output.toString()).toEqual('hello\n nwelcome \n');
  });

  test('outputs more lines if fn returns a string with newLine(s)', async () => {
    const nlFn: TMapLineFn = (line: string) => `-\n${line}`;

    const lnMachine = createMapLineMachine(nlFn);

    const res = await lnMachine(input, output);
    expect(res.linesRead).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
  });

  test('transfers this in Fn', async () => {
    function fnWithThis(line: string, lineNumber: number) {
      if (lineNumber === this?.lineNum) {
        return null;
      }
      return line;
    }

    const lnMachine = createMapLineMachine(fnWithThis, {
      thisArg: {lineNum: 2},
    });
    // same as:
    // const lnMachine = mapLineMachine(fnWithThis.bind({lineNum: 2}));

    const res = await lnMachine(input, output);
    expect(res.linesRead).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('Hello, ');
  });
});

describe('transform - error handling', () => {
  const fnWithErr: TMapLineFn = (line: string, lineNumber: number) => {
    if (lineNumber === 2) {
      throw new Error('line2 err!');
      // return Promise.reject(new Error('line is 2!'));
    }
    return `-\n${line}`;
  };

  test('transfers Fn Error - include error message', async () => {
    const lnMachine = createMapLineMachine(fnWithErr);
    await expect(lnMachine(input, output)).rejects.toThrow('line2 err!');
  });

  test('transfers Fn Error - include input stream line info', async () => {
    const lnMachine = createMapLineMachine(fnWithErr);
    await expect(lnMachine(input, output)).rejects.toThrow('line [2]');
  });

  test('transfers Fn Error - include file & line info', async () => {
    const lnMachine = createMapLineMachine(fnWithErr);
    await expect(
      lnMachine(`${PATH_PREFIX}/dolly-text.txt`, output)
    ).rejects.toThrow('/dolly-text.txt:2');
  });
});
