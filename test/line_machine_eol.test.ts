import mock from 'mock-fs';

import {createLineMachine} from '../src/line_machine';
import type {TLineCallback} from '../src/line_machine';
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

const copyFn: TLineCallback = (
  line: string
  //   lineNumber: number
): string => line;

describe('lines & EOLs', () => {
  let output: stream.Writable;
  beforeEach(() => {
    output = new mStream.WritableStream();
  });

  test('empty input file', async () => {
    const inputEmpty = fs.createReadStream(`${PATH_PREFIX}/empty.txt`);
    const lnMachine = createLineMachine(copyFn);

    const res = await lnMachine(inputEmpty, output);
    expect(res.lineNumber).toEqual(0);
    expect(output.toString()).toEqual('');
  });

  test('one line without EOL means one line', async () => {
    const oneLine = fs.createReadStream(`${PATH_PREFIX}/one-line.txt`);
    const lnMachine = createLineMachine(copyFn);

    const res = await lnMachine(oneLine, output);
    expect(res.lineNumber).toEqual(1);
    expect(output.toString()).toEqual('one line');
  });

  test('one EOL means two lines', async () => {
    const oneEOL = fs.createReadStream(`${PATH_PREFIX}/one-eol.txt`);

    const lnMachine = createLineMachine(copyFn);

    const res = await lnMachine(oneEOL, output);

    expect(res.lineNumber).toEqual(2);
    expect(output.toString()).toEqual('\n');
  });

  test('preserves empty lines', async () => {
    const inputEmptyLines = fs.createReadStream(`${PATH_PREFIX}/two-eols.txt`);

    const lnMachine = createLineMachine(copyFn);

    const res = await lnMachine(inputEmptyLines, output);

    expect(res.lineNumber).toEqual(3); //two EOLs means three lines
    expect(output.toString()).toEqual('\n\n');
  });

  test('exclude EOLs', async () => {
    const withoutEOLSMachine = createLineMachine(copyFn, {
      rememberEndOfLines: false,
    });
    const input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
    const res = await withoutEOLSMachine(input, output);

    expect(res.lineNumber).toEqual(2);
    expect(output.toString()).toEqual('Hello, World!');
  });

  test('EOL at the end of file', async () => {
    const input = fs.createReadStream(`${PATH_PREFIX}/my-file-eol-end.txt`);
    const lnMachine = createLineMachine(copyFn);

    const res = await lnMachine(input, output);

    expect(res.lineNumber).toEqual(3);
    expect(output.toString()).toEqual('Hello, \nWorld!\n');
  });

  test('Deletion of line at the end of file decreases number of lines written', async () => {
    const input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
    const deleteLastLineFn = (line: string, lineNumber: number) =>
      lineNumber === 2 ? null : line;
    const lnMachine = createLineMachine(deleteLastLineFn);

    const res = await lnMachine(input, output);

    expect(res.lineNumber).toEqual(2);
    expect(output.toString()).toEqual('Hello, ');
  });

  test('Delete the first line of file', async () => {
    const input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
    const deleteLastLineFn = (line: string, lineNumber: number) =>
      lineNumber === 1 ? null : line;
    const lnMachine = createLineMachine(deleteLastLineFn);

    const res = await lnMachine(input, output);

    expect(res.lineNumber).toEqual(2);
    expect(output.toString()).toEqual('World!');
  });
});
