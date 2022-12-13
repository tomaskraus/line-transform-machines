import mock from 'mock-fs';

import {mapLineMachine} from '../src/maplinemachine';
import type {TAsyncMapLineFn} from '../src/maplinemachine';
import stream from 'stream';

import * as mStream from 'memory-streams';
import * as fs from 'fs';

beforeEach(() => {
  mock({
    'my-dir': {
      'empty.txt': '',
      'one-eol.txt': '\n',
      'two-eols.txt': '\n\n',
      'one-line.txt': 'one line',
      'my-file.txt': 'Hello, \nWorld!',
      'my-file-eol-end.txt': 'Hello, \nWorld!\n',
    },
  });
  mock.file();
});
const PATH_PREFIX = './my-dir';

afterEach(() => {
  mock.restore();
});

const copyFn: TAsyncMapLineFn = async (
  line: string
  //   lineNumber: number
): Promise<string> => {
  return Promise.resolve(line);
};

describe('lines & EOLs', () => {
  let output: stream.Writable;
  beforeEach(() => {
    output = new mStream.WritableStream();
  });

  test('empty input file', async () => {
    const inputEmpty = fs.createReadStream(`${PATH_PREFIX}/empty.txt`);
    const lnMachine = mapLineMachine(copyFn);

    const res = await lnMachine(inputEmpty, output);
    expect(res.linesRead).toEqual(0);
    expect(output.toString()).toEqual('');
  });

  test('one line without EOL means one line', async () => {
    const oneLine = fs.createReadStream(`${PATH_PREFIX}/one-line.txt`);
    const lnMachine = mapLineMachine(copyFn);

    const res = await lnMachine(oneLine, output);
    expect(res.linesRead).toEqual(1);
    expect(output.toString()).toEqual('one line');
  });

  test('one EOL means two lines', async () => {
    const oneEOL = fs.createReadStream(`${PATH_PREFIX}/one-eol.txt`);

    const lnMachine = mapLineMachine(copyFn);

    const res = await lnMachine(oneEOL, output);

    expect(res.linesRead).toEqual(2);
    expect(output.toString()).toEqual('\n');
  });

  test('preserves empty lines', async () => {
    const inputEmptyLines = fs.createReadStream(`${PATH_PREFIX}/two-eols.txt`);

    const lnMachine = mapLineMachine(copyFn);

    const res = await lnMachine(inputEmptyLines, output);

    expect(res.linesRead).toEqual(3); //two EOLs means three lines
    expect(output.toString()).toEqual('\n\n');
  });

  test('exclude EOLs', async () => {
    const withoutEOLSMachine = mapLineMachine(copyFn, {
      rememberEndOfLines: false,
    });
    const input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
    const res = await withoutEOLSMachine(input, output);

    expect(res.linesRead).toEqual(2);
    expect(output.toString()).toEqual('Hello, World!');
  });

  test('EOL at the end of file', async () => {
    const input = fs.createReadStream(`${PATH_PREFIX}/my-file-eol-end.txt`);
    const lnMachine = mapLineMachine(copyFn);

    const res = await lnMachine(input, output);

    expect(res.linesRead).toEqual(3);
    expect(output.toString()).toEqual('Hello, \nWorld!\n');
  });
});
