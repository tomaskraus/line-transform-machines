import mock from 'mock-fs';

import {fileStreamWrapper} from '../../src/utils/file_stream_wrapper';
import type {
  TStreamProcessor,
  TFileStreamContext,
} from '../../src/utils/file_stream_wrapper';
import stream from 'stream';

import * as mStream from 'memory-streams';
import * as fs from 'fs';

const copyStreamProcessor: TStreamProcessor<TFileStreamContext> = (
  input: stream.Readable,
  output: stream.Writable,
  context: TFileStreamContext
) => {
  return new Promise<TFileStreamContext>((resolve, reject) => {
    input.pipe(output, {end: true});
    input.on('end', () => resolve(context));
    input.on('error', err => reject(err));
  });
};

const copyProcessor = fileStreamWrapper(copyStreamProcessor);

const errorStreamProcessor: TStreamProcessor<TFileStreamContext> = () =>
  Promise.reject(new Error('Err in process'));

const errorProcessor = fileStreamWrapper(errorStreamProcessor);

beforeEach(() => {
  mock({
    'my-dir': {
      'my-file.txt': 'Hello, \nWorld!',
      'read-only.txt': mock.file({
        content: 'read only...',
        mode: 0o0444,
      }),
      readOnlyDir: mock.directory({
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

describe('input stream', () => {
  let inputFileStream: stream.Readable;
  beforeEach(() => {
    inputFileStream = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
  });

  test('output as stream', async () => {
    const outMemStream = new mStream.WritableStream();
    const res = await copyProcessor(inputFileStream, outMemStream);

    expect(res.outputFileName).toBeUndefined();
    expect(outMemStream.toString()).toEqual('Hello, \nWorld!');
  });

  test('output as file - error in the stream processor', async () => {
    await expect(
      errorProcessor(inputFileStream, `${PATH_PREFIX}/out.txt`)
    ).rejects.toThrow('Err in process');
  });

  test('output as a new file - ok', async () => {
    const res = await copyProcessor(inputFileStream, `${PATH_PREFIX}/out.txt`);

    expect(res.outputFileName).toContain('out.txt');
    const buff = fs.readFileSync(`${PATH_PREFIX}/out.txt`);
    expect(buff.toString()).toEqual('Hello, \nWorld!');
  });

  test('output as a new file at the root directory - ok', async () => {
    const res = await copyProcessor(inputFileStream, 'out.txt');

    expect(res.outputFileName).toContain('out.txt');
    const buff = fs.readFileSync('out.txt');
    expect(buff.toString()).toEqual('Hello, \nWorld!');
  });

  test('output as file - read-only error', async () => {
    await expect(
      copyProcessor(inputFileStream, `${PATH_PREFIX}/read-only.txt`)
    ).rejects.toThrow('permission');
  });

  test('output as a new file within a new directory structure - ok', async () => {
    const res = await copyProcessor(
      inputFileStream,
      `${PATH_PREFIX}/newDir/newDir2/out.txt`
    );

    expect(res.outputFileName).toContain('out.txt');
    const buff = fs.readFileSync(`${PATH_PREFIX}/newDir/newDir2/out.txt`);
    expect(buff.toString()).toEqual('Hello, \nWorld!');
  });

  test('output as file within a new directory structure - read-only directory error', async () => {
    await expect(
      copyProcessor(
        inputFileStream,
        `${PATH_PREFIX}/readOnlyDir/newDir2/read-only.txt`
      )
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
    expect(outMemStream.toString()).toEqual('Hello, \nWorld!');
  });

  test('output as file - ok', async () => {
    const res = await copyProcessor(inputFileName, `${PATH_PREFIX}/out2.txt`);

    expect(res.inputFileName).toContain('my-file.txt');
    expect(res.outputFileName).toContain('out2.txt');
    const buff = fs.readFileSync(`${PATH_PREFIX}/out2.txt`);
    expect(buff.toString()).toEqual('Hello, \nWorld!');
  });
});
