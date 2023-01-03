import mock from 'mock-fs';

import {createLineMachine} from '../src/line_machine';
import type {TAsyncMapLineCallback} from '../src/line_machine';
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

describe('transform - async', () => {
  let input: stream.Readable;
  let output: stream.Writable;
  beforeEach(() => {
    input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
    output = new mStream.WritableStream();
  });

  test('async fn', async () => {
    const asyncFn = async (line: string) =>
      new Promise<string>(resolve => {
        setTimeout(() => {
          resolve(`(${line})`);
        }, 0);
      });
    const lnMachine = createLineMachine(asyncFn, {
      useAsyncFn: true,
      rememberEndOfLines: false,
    });

    const res = await lnMachine(input, output);

    expect(res.lineNumber).toEqual(2);
    expect(output.toString()).toEqual('(Hello, )(World!)');
  });

  test('transfers Fn Error - async', async () => {
    const asyncfnWithErr: TAsyncMapLineCallback = async (
      line: string,
      lineNumber: number
    ) => {
      if (lineNumber === 2) {
        throw new Error('line is 2!');
        // return Promise.reject(new Error('line is 2!'));
      }
      return `-\n${line}`;
    };

    const lnMachine = createLineMachine(asyncfnWithErr, {useAsyncFn: true});
    await expect(lnMachine(input, output)).rejects.toThrow('line is 2!');
  });

  test('transfers this in Fn - async', async () => {
    async function asyncFnWithThis(line: string, lineNumber: number) {
      if (lineNumber === this?.lineNum) {
        return null;
      }
      return line;
    }

    const lnMachine = createLineMachine(asyncFnWithThis, {
      thisArg: {lineNum: 2},
      useAsyncFn: true,
    });
    // same as:
    // const lnMachine = mapLineMachine(asyncFnWithThis.bind({lineNum: 2}));

    const res = await lnMachine(input, output);
    expect(res.lineNumber).toEqual(2); //line read count remains the same
    expect(output.toString()).toEqual('Hello, ');
  });
});
