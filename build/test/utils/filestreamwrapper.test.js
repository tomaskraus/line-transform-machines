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
const filestreamwrapper_1 = require("../../src/utils/filestreamwrapper");
const mStream = __importStar(require("memory-streams"));
const fs = __importStar(require("fs"));
const copyStreamProcessor = (input, output, fileStats) => {
    return new Promise((resolve, reject) => {
        input.pipe(output, { end: true });
        input.on('end', () => resolve(fileStats));
        input.on('error', err => reject(err));
    });
};
beforeEach(() => {
    (0, mock_fs_1.default)({
        'my-dir': {
            'my-file.txt': 'Hello, \nWorld!',
            'read-only.txt': mock_fs_1.default.file({
                content: 'read only...',
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
const copyProcessor = (0, filestreamwrapper_1.fileStreamWrapper)(copyStreamProcessor);
describe('input stream', () => {
    let inputFileStream;
    beforeEach(() => {
        inputFileStream = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
    });
    test('output as stream', async () => {
        const outMemStream = new mStream.WritableStream();
        const res = await copyProcessor(inputFileStream, outMemStream);
        expect(res).toHaveProperty('linesRead');
        expect(res.outputFileName).toBeUndefined();
        expect(outMemStream.toString()).toEqual('Hello, \nWorld!');
    });
    test('output as file - ok', async () => {
        const res = await copyProcessor(inputFileStream, `${PATH_PREFIX}/out.txt`);
        expect(res).toHaveProperty('linesRead');
        expect(res.outputFileName).toContain('out.txt');
        const buff = fs.readFileSync(`${PATH_PREFIX}/out.txt`);
        expect(buff.toString()).toEqual('Hello, \nWorld!');
    });
    test('output as file - read-only error', async () => {
        await expect(copyProcessor(inputFileStream, `${PATH_PREFIX}/read-only.txt`)).rejects.toThrow('permission');
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
        expect(res).toHaveProperty('linesRead');
        expect(res.inputFileName).toContain('my-file.txt');
        expect(outMemStream.toString()).toEqual('Hello, \nWorld!');
    });
    test('output as file - ok', async () => {
        const res = await copyProcessor(inputFileName, `${PATH_PREFIX}/out2.txt`);
        expect(res).toHaveProperty('linesRead');
        expect(res.inputFileName).toContain('my-file.txt');
        expect(res.outputFileName).toContain('out2.txt');
        const buff = fs.readFileSync(`${PATH_PREFIX}/out2.txt`);
        expect(buff.toString()).toEqual('Hello, \nWorld!');
    });
});
//# sourceMappingURL=filestreamwrapper.test.js.map