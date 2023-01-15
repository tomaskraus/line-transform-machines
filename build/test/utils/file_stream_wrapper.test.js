"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mock_fs_1 = __importDefault(require("mock-fs"));
const file_stream_wrapper_1 = require("../../src/utils/file_stream_wrapper");
const mStream = __importStar(require("memory-streams"));
const fs = __importStar(require("fs"));
const copyStreamProcessor = (input, output, context) => {
    return new Promise((resolve, reject) => {
        input.pipe(output, { end: true });
        input.on('end', () => resolve(context));
        input.on('error', err => reject(err));
    });
};
const copyProcessor = (0, file_stream_wrapper_1.fileStreamWrapper)(copyStreamProcessor);
const errorStreamProcessor = () => Promise.reject(new Error('Err in process'));
const errorProcessor = (0, file_stream_wrapper_1.fileStreamWrapper)(errorStreamProcessor);
beforeEach(() => {
    (0, mock_fs_1.default)({
        'my-dir': {
            'my-file.txt': 'Hello, \nWorld!',
            'read-only.txt': mock_fs_1.default.file({
                content: 'read only...',
                mode: 0o0444,
            }),
            readOnlyDir: mock_fs_1.default.directory({
                mode: 0o0444,
            }),
        },
    });
    mock_fs_1.default.file();
});
const PATH_PREFIX = './my-dir';
afterEach(() => {
    mock_fs_1.default.restore();
});
describe('input stream', () => {
    let inputFileStream;
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
        await expect(errorProcessor(inputFileStream, `${PATH_PREFIX}/out.txt`)).rejects.toThrow('Err in process');
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
        await expect(copyProcessor(inputFileStream, `${PATH_PREFIX}/read-only.txt`)).rejects.toThrow('permission');
    });
    test('output as a new file within a new directory structure - ok', async () => {
        const res = await copyProcessor(inputFileStream, `${PATH_PREFIX}/newDir/newDir2/out.txt`);
        expect(res.outputFileName).toContain('out.txt');
        const buff = fs.readFileSync(`${PATH_PREFIX}/newDir/newDir2/out.txt`);
        expect(buff.toString()).toEqual('Hello, \nWorld!');
    });
    test('output as file within a new directory structure - read-only directory error', async () => {
        await expect(copyProcessor(inputFileStream, `${PATH_PREFIX}/readOnlyDir/newDir2/read-only.txt`)).rejects.toThrow('permission');
    });
});
describe('input file', () => {
    const inputFileName = `${PATH_PREFIX}/my-file.txt`;
    test('nonexistent input file', async () => {
        await expect(copyProcessor('nonexistent', `${PATH_PREFIX}/out2.txt`)).rejects.toThrow('ENOENT');
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
//# sourceMappingURL=file_stream_wrapper.test.js.map