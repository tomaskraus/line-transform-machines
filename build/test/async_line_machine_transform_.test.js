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
const async_line_machine_1 = require("../src/async_line_machine");
const mStream = __importStar(require("memory-streams"));
const fs = __importStar(require("fs"));
let input;
let output;
beforeEach(() => { });
beforeEach(() => {
    (0, mock_fs_1.default)({
        'my-dir': {
            'my-file.txt': 'Hello, \nWorld!',
            'dolly-text.txt': 'hello\nDolly\n nwelcome \n',
        },
    });
    mock_fs_1.default.file();
    input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
    output = new mStream.WritableStream();
});
const PATH_PREFIX = './my-dir';
afterEach(() => {
    mock_fs_1.default.restore();
});
describe('transform', () => {
    const lineNumberAsyncFn = (line, lineNumber) => {
        return Promise.resolve(`${lineNumber}: ${line}`);
    };
    const noDollyAsyncFn = (line) => {
        if (line.trim() === 'Dolly') {
            return Promise.resolve(null);
        }
        return Promise.resolve(line);
    };
    test('line numbers', async () => {
        const lnMachine = (0, async_line_machine_1.createAsyncLineMachine)(lineNumberAsyncFn);
        const res = await lnMachine(input, output);
        expect(res.lineNumber).toEqual(2);
        expect(output.toString()).toEqual('1: Hello, \n2: World!');
    });
    test('outputs less lines if fn returns null', async () => {
        const inputWithDolly = fs.createReadStream(`${PATH_PREFIX}/dolly-text.txt`);
        const lnMachine = (0, async_line_machine_1.createAsyncLineMachine)(noDollyAsyncFn);
        const res = await lnMachine(inputWithDolly, output);
        expect(res.lineNumber).toEqual(4); //line read count remains the same
        expect(output.toString()).toEqual('hello\n nwelcome \n');
    });
    test('outputs more lines if fn returns a string with newLine(s)', async () => {
        const nlFn = (line) => Promise.resolve(`-\n${line}`);
        const lnMachine = (0, async_line_machine_1.createAsyncLineMachine)(nlFn);
        const res = await lnMachine(input, output);
        expect(res.lineNumber).toEqual(2); //line read count remains the same
        expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
    });
});
describe('transform - error handling', () => {
    const fnWithErr = (line, lineNumber) => {
        if (lineNumber === 2) {
            return Promise.reject(new Error('line2 err!'));
        }
        return Promise.resolve(`-\n${line}`);
    };
    test('input stream line Error: include line value, input stream line number and Error message', async () => {
        expect.assertions(3);
        const lnMachine = (0, async_line_machine_1.createAsyncLineMachine)(fnWithErr);
        try {
            await lnMachine(input, output);
        }
        catch (e) {
            expect(e.message).toContain('World!'); //line
            expect(e.message).toContain('line [2]'); //line info
            expect(e.message).toContain('line2 err!'); //err
        }
    });
    test('input file line Error: include line value, file name & line number and Error message', async () => {
        expect.assertions(3);
        const lnMachine = (0, async_line_machine_1.createAsyncLineMachine)(fnWithErr);
        try {
            await lnMachine(`${PATH_PREFIX}/dolly-text.txt`, output);
        }
        catch (e) {
            expect(e.message).toContain('Dolly'); //line
            expect(e.message).toContain('/dolly-text.txt:2'); //file&line info
            expect(e.message).toContain('line2 err!'); //err
        }
    });
});
//# sourceMappingURL=async_line_machine_transform_.test.js.map