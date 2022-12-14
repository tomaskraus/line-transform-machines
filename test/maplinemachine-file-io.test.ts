/*
duplicates filestreamwrapper tests
*/

import mock from 'mock-fs';

import {mapLineMachine} from '../src/maplinemachine';
import type {TMapLineFn} from '../src/maplinemachine';
import stream from 'stream';

import * as mStream from 'memory-streams';
import * as fs from 'fs';

beforeEach(() => {
  mock({
    'my-dir': {
      'my-file.txt': 'Hello, \nWorld!',
      'read-only.txt': mock.file({
        content: 'read only...',
        mode: 0o0444,
      }),
    },
  });
  mock.file();
});
const PATH_PREFIX = './my-dir';

afterEach(() => {
  mock.restore();
});

const copyFn: TMapLineFn = (
  line: string
  //   lineNumber: number
): string => line;

const copyProcessor = mapLineMachine(copyFn);

// -----------------------------------------------------------------------

describe('input stream', () => {
  let inputFileStream: stream.Readable;
  beforeEach(() => {
    inputFileStream = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
  });

  test('output as stream', async () => {
    const outMemStream = new mStream.WritableStream();
    const res = await copyProcessor(inputFileStream, outMemStream);

    expect(res).toHaveProperty('linesRead');
    expect(outMemStream.toString()).toEqual('Hello, \nWorld!');
  });

  test('output as file - ok', async () => {
    const res = await copyProcessor(inputFileStream, `${PATH_PREFIX}/out.txt`);

    expect(res).toHaveProperty('linesRead');
    const buff = fs.readFileSync(`${PATH_PREFIX}/out.txt`);
    expect(buff.toString()).toEqual('Hello, \nWorld!');
  });

  test('output as file - read-only error', async () => {
    await expect(
      copyProcessor(inputFileStream, `${PATH_PREFIX}/read-only.txt`)
    ).rejects.toThrow('permission');
  });
});

describe('input file', () => {
  const inputFileName = `${PATH_PREFIX}/my-file.txt`;

  test('nonexistent input file', async () => {
    await expect(
      copyProcessor('nonexistent', `${PATH_PREFIX}/out2.txt`)
    ).rejects.toThrow('ENOENT');
  });

  test('output as stream', async () => {
    const outMemStream = new mStream.WritableStream();
    const res = await copyProcessor(inputFileName, outMemStream);

    expect(res.inputFileName).toContain('my-file.txt');
    expect(res.outputFileName).toBeUndefined();
    expect(res).toHaveProperty('linesRead');
    expect(outMemStream.toString()).toEqual('Hello, \nWorld!');
  });

  test('output as file - ok', async () => {
    const res = await copyProcessor(inputFileName, `${PATH_PREFIX}/out2.txt`);

    expect(res).toHaveProperty('linesRead');
    expect(res.linesRead).toEqual(2);
    expect(res.inputFileName).toContain('my-file.txt');
    expect(res.outputFileName).toContain('out2.txt');
    const buff = fs.readFileSync(`${PATH_PREFIX}/out2.txt`);
    expect(buff.toString()).toEqual('Hello, \nWorld!');
  });
});
