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
describe('transform - async', () => {
    let input;
    let output;
    beforeEach(() => {
        input = fs.createReadStream(`${PATH_PREFIX}/my-file.txt`);
        output = new mStream.WritableStream();
    });
    test('async fn', async () => {
        const asyncFn = async (line) => new Promise(resolve => {
            setTimeout(() => {
                resolve(`(${line})`);
            }, 0);
        });
        const lnMachine = (0, async_line_machine_1.createAsyncLineMachine)(asyncFn, {
            rememberEndOfLines: false,
        });
        const res = await lnMachine(input, output);
        expect(res.lineNumber).toEqual(2);
        expect(output.toString()).toEqual('(Hello, )(World!)');
    });
    test('transfers Fn Error - async', async () => {
        const asyncfnWithErr = async (line, lineNumber) => {
            if (lineNumber === 2) {
                throw new Error('line is 2!');
                // return Promise.reject(new Error('line is 2!'));
            }
            return `-\n${line}`;
        };
        const lnMachine = (0, async_line_machine_1.createAsyncLineMachine)(asyncfnWithErr);
        await expect(lnMachine(input, output)).rejects.toThrow('line is 2!');
    });
});
//# sourceMappingURL=line_machine_transform_async.test.js.map