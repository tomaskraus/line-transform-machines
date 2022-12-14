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
            'empty.txt': '',
            'one-eol.txt': '\n',
            'two-eols.txt': '\n\n',
            'one-line.txt': 'one line',
            'my-file.txt': 'Hello, \nWorld!',
            'my-file-eol-end.txt': 'Hello, \nWorld!\n',
        },
    });
    mock_fs_1.default.file();
});
const PATH_PREFIX = './my-dir';
afterEach(() => {
    mock_fs_1.default.restore();
});
const copyFn = (line
//   lineNumber: number
) => line;
describe('lines & EOLs', () => {
    let output;
    beforeEach(() => {
        output = new mStream.WritableStream();
    });
    test('empty input file', async () => {
        const inputEmpty = fs.createReadStream(`${PATH_PREFIX}/empty.txt`);
        const lnMachine = (0, maplinemachine_1.createMapLineMachine)(copyFn);
        const res = await lnMachine(inputEmpty, output);
        expect(res.linesRead).toEqual(0);
        expect(output.toString()).toEqual('');
    });
    test('one line without EOL means one line', async () => {
        const oneLine = fs.createReadStream(`${PATH_PREFIX}/one-line.txt`);
        const lnMachine = (0, maplinemachine_1.createMapLineMachine)(copyFn);
        const res = await lnMachine(oneLine, output);
        expect(res.linesRead).toEqual(1);
        expect(output.toString()).toEqual('one line');
    });
    test('one EOL means two lines', async () => {
        const oneEOL = fs.createReadStream(`${PATH_PREFIX}/one-eol.txt`);
        const lnMachine = (0, maplinemachine_1.createMapLineMachine)(copyFn);
        const res = await lnMachine(oneEOL, output);
        expect(res.linesRead).toEqual(2);
        expect(output.toString()).toEqual('\n');
    });
    test('preserves empty lines', async () => {
        const inputEmptyLines = fs.createReadStream(`${PATH_PREFIX}/two-eols.txt`);
        const lnMachine = (0, maplinemachine_1.createMapLineMachine)(copyFn);
        const res = await lnMachine(inputEmptyLines, output);
        expect(res.linesRead).toEqual(3); //two EOLs means three lines
        expect(output.toString()).toEqual('\n\n');
    });
    test('exclude EOLs', async () => {
        const withoutEOLSMachine = (0, maplinemachine_1.createMapLineMachine)(copyFn, {
            rememberEndOfLines: false,
        });
        const input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
        const res = await withoutEOLSMachine(input, output);
        expect(res.linesRead).toEqual(2);
        expect(output.toString()).toEqual('Hello, World!');
    });
    test('EOL at the end of file', async () => {
        const input = fs.createReadStream(`${PATH_PREFIX}/my-file-eol-end.txt`);
        const lnMachine = (0, maplinemachine_1.createMapLineMachine)(copyFn);
        const res = await lnMachine(input, output);
        expect(res.linesRead).toEqual(3);
        expect(output.toString()).toEqual('Hello, \nWorld!\n');
    });
    test('Deletion of line at the end of file decreases number of lines written', async () => {
        const input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
        const deleteLastLineFn = (line, lineNumber) => lineNumber === 2 ? null : line;
        const lnMachine = (0, maplinemachine_1.createMapLineMachine)(deleteLastLineFn);
        const res = await lnMachine(input, output);
        expect(res.linesRead).toEqual(2);
        expect(output.toString()).toEqual('Hello, ');
    });
    test('Delete the first line of file', async () => {
        const input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
        const deleteLastLineFn = (line, lineNumber) => lineNumber === 1 ? null : line;
        const lnMachine = (0, maplinemachine_1.createMapLineMachine)(deleteLastLineFn);
        const res = await lnMachine(input, output);
        expect(res.linesRead).toEqual(2);
        expect(output.toString()).toEqual('World!');
    });
});
//# sourceMappingURL=maplinemachine-line-eol.test.js.map