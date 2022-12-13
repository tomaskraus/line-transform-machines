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
            'my-file.txt': 'Hello, \nWorld!',
            'dolly-text.txt': 'hello\nDolly\n nwelcome \n',
        },
    });
    mock_fs_1.default.file();
});
const PATH_PREFIX = './my-dir';
afterEach(() => {
    mock_fs_1.default.restore();
});
describe('transform', () => {
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
    test('line numbers', async () => {
        const lnMachine = (0, maplinemachine_1.mapLineMachine)(lineNumberFn);
        const res = await lnMachine(input, output);
        expect(res.linesRead).toEqual(2);
        expect(output.toString()).toEqual('1: Hello, \n2: World!');
    });
    test('outputs less lines if fn returns null', async () => {
        const inputWithDolly = fs.createReadStream(`${PATH_PREFIX}/dolly-text.txt`);
        const lnMachine = (0, maplinemachine_1.mapLineMachine)(noDollyFn);
        const res = await lnMachine(inputWithDolly, output);
        expect(res.linesRead).toEqual(4); //line read count remains the same
        expect(output.toString()).toEqual('hello\n nwelcome \n');
    });
    test('outputs more lines if fn returns a string with newLine(s)', async () => {
        const nlFn = async (line) => Promise.resolve(`-\n${line}`);
        const lnMachine = (0, maplinemachine_1.mapLineMachine)(nlFn);
        const res = await lnMachine(input, output);
        expect(res.linesRead).toEqual(2); //line read count remains the same
        expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
    });
});
//# sourceMappingURL=maplinemachine-transform.test.js.map