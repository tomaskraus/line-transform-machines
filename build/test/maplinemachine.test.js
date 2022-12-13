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
const maplinemachine_1 = require("../src/maplinemachine");
const mStream = __importStar(require("memory-streams"));
const fs = __importStar(require("fs"));
beforeEach(() => {
    (0, mock_fs_1.default)({
        'my-dir': {
            'one-line.txt': 'one line',
            'my-file.txt': 'Hello, \nWorld!',
            'my-file-empty-line-end.txt': 'Hello, \nWorld!\n',
            'read-only.txt': mock_fs_1.default.file({
                content: 'read only...',
                mode: 0o0444,
            }),
            'empty.txt': '',
            'one-eol.txt': '\n',
            'two-eols.txt': '\n\n',
            'dolly-text.txt': '\nhello\n\nDolly\n \nwelcome\n',
        },
    });
    mock_fs_1.default.file();
});
const PATH_PREFIX = './my-dir';
afterEach(() => {
    mock_fs_1.default.restore();
});
const copyFn = async (line
//   lineNumber: number
) => {
    return Promise.resolve(line);
};
const copyProcessor = (0, maplinemachine_1.mapLineMachine)(copyFn, true);
// -----------------------------------------------------------------------
describe('input stream', () => {
    let inputFileStream;
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
        await expect(copyProcessor(inputFileStream, `${PATH_PREFIX}/read-only.txt`)).rejects.toThrow('permission');
    });
});
describe('input file', () => {
    const inputFileName = `${PATH_PREFIX}/my-file.txt`;
    test('output as stream', async () => {
        const outMemStream = new mStream.WritableStream();
        const res = await copyProcessor(inputFileName, outMemStream);
        expect(res).toHaveProperty('linesRead');
        expect(outMemStream.toString()).toEqual('Hello, \nWorld!');
    });
    test('output as file - ok', async () => {
        const res = await copyProcessor(inputFileName, `${PATH_PREFIX}/out2.txt`);
        expect(res).toHaveProperty('linesRead');
        const buff = fs.readFileSync(`${PATH_PREFIX}/out2.txt`);
        expect(buff.toString()).toEqual('Hello, \nWorld!');
    });
    test('output as file - nonexistent input file', async () => {
        await expect(copyProcessor('nonexistent', `${PATH_PREFIX}/out2.txt`)).rejects.toThrow('ENOENT');
    });
});
//----------------------------------------------------------------------------
describe('lines & EOLs', () => {
    const lineNumberFn = async (line, lineNumber) => {
        return Promise.resolve(`${lineNumber}: ${line}`);
    };
    const noDollyFn = async (line) => {
        if (line.trim() === 'Dolly') {
            return Promise.resolve(null);
        }
        return Promise.resolve(line);
    };
    let input;
    let output;
    beforeEach(() => {
        input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
        output = new mStream.WritableStream();
    });
    test('empty input file', async () => {
        const inputEmpty = fs.createReadStream(`${PATH_PREFIX}/empty.txt`);
        const lnMachine = (0, maplinemachine_1.mapLineMachine)(copyFn, true);
        const res = await lnMachine(inputEmpty, output);
        expect(res.linesRead).toEqual(0);
        expect(output.toString()).toEqual('');
    });
    test('one line without EOL means one line', async () => {
        const oneLine = fs.createReadStream(`${PATH_PREFIX}/one-line.txt`);
        const lnMachine = (0, maplinemachine_1.mapLineMachine)(copyFn, true);
        const res = await lnMachine(oneLine, output);
        expect(res.linesRead).toEqual(1);
        expect(output.toString()).toEqual('one line');
    });
    test('one EOL means two lines', async () => {
        const inputEmptyLines = fs.createReadStream(`${PATH_PREFIX}/one-eol.txt`);
        const lnMachine = (0, maplinemachine_1.mapLineMachine)(copyFn, true);
        const res = await lnMachine(inputEmptyLines, output);
        expect(res.linesRead).toEqual(2);
        expect(output.toString()).toEqual('\n');
    });
    test('preserves empty lines', async () => {
        const inputEmptyLines = fs.createReadStream(`${PATH_PREFIX}/two-eols.txt`);
        const lnMachine = (0, maplinemachine_1.mapLineMachine)(copyFn, true);
        const res = await lnMachine(inputEmptyLines, output);
        expect(res.linesRead).toEqual(3); //two EOLs means three lines
        expect(output.toString()).toEqual('\n\n');
    });
    test('exclude EOLs', async () => {
        const withoutEOLSMachine = (0, maplinemachine_1.mapLineMachine)(copyFn, false);
        const res = await withoutEOLSMachine(input, output);
        expect(res.linesRead).toEqual(2);
        expect(output.toString()).toEqual('Hello, World!');
    });
    //   test('input line count', async () => {
    //     const input = fs.createReadStream(
    //       `${PATH_PREFIX}/my-file-empty-line-end.txt`
    //     );
    //     const lnMachine = mapLineMachine(copyFn, true);
    //     const res = await lnMachine(input, output);
    //     expect(res.linesRead).toEqual(3);
    //     expect(output.toString()).toEqual('Hello, \nWorld!\n');
    //   });
    test('line numbers', async () => {
        const lnMachine = (0, maplinemachine_1.mapLineMachine)(lineNumberFn, true);
        const res = await lnMachine(input, output);
        expect(res.linesRead).toEqual(2);
        expect(output.toString()).toEqual('1: Hello, \n2: World!');
    });
    //   test('outputs less lines if fn returns null', async () => {
    //     const inputWithDolly = fs.createReadStream(`${PATH_PREFIX}/dolly-text.txt`);
    //     const lnMachine = mapLineMachine(copyFn, true);
    //     const res = await lnMachine(inputWithDolly, output);
    //     expect(res.linesRead).toEqual(7);
    //     expect(output.toString()).toEqual('\nhello\n\nDolly\n \nwelcome\n');
    //   });
});
//# sourceMappingURL=maplinemachine.test.js.map