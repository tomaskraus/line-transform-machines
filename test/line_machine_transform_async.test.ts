import mock from 'mock-fs';

import {createAsyncLineMachine} from '../src/async_line_machine';
import type {TAsyncMapLineCallback} from '../src/async_line_machine';
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
    const lnMachine = createAsyncLineMachine(asyncFn, {
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

    const lnMachine = createAsyncLineMachine(asyncfnWithErr);
    await expect(lnMachine(input, output)).rejects.toThrow('line is 2!');
  });
});
