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
const rxjs_1 = require("rxjs");
const rxjs_line_machine_1 = require("../src/rxjs_line_machine");
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
    const lineNumberFn = (item) => {
        return `${item.lineNumber}: ${item.value}`;
    };
    const lineNumberDecorator = (source) => source.pipe((0, rxjs_1.map)(lineNumberFn));
    const noDollyFn = (item) => {
        return item.value.trim() !== 'Dolly';
    };
    const noDollyDecorator = (source) => source.pipe((0, rxjs_1.filter)(noDollyFn), (0, rxjs_1.map)(x => x.value));
    test('line numbers', async () => {
        const lnMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(lineNumberDecorator);
        const res = await lnMachine(input, output);
        expect(res.lineNumber).toEqual(2);
        expect(output.toString()).toEqual('1: Hello, \n2: World!');
    });
    test('outputs less lines if decorator filters', async () => {
        const inputWithDolly = fs.createReadStream(`${PATH_PREFIX}/dolly-text.txt`);
        const lnMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(noDollyDecorator);
        const res = await lnMachine(inputWithDolly, output);
        expect(res.lineNumber).toEqual(4); //line read count remains the same
        expect(output.toString()).toEqual('hello\n nwelcome \n');
    });
    test('outputs more lines if decorator returns a string with newLine(s)', async () => {
        const nlDeco = (src) => src.pipe((0, rxjs_1.map)(({ value }) => `-\n${value}`));
        const lnMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(nlDeco);
        const res = await lnMachine(input, output);
        expect(res.lineNumber).toEqual(2); //line read count remains the same
        expect(output.toString()).toEqual('-\nHello, \n-\nWorld!');
    });
    test('does "reduce" well', async () => {
        const lineCountDeco = (src) => src.pipe((0, rxjs_1.reduce)((count) => count + 1, 0), (0, rxjs_1.map)((n) => `Line count: ${n}`));
        const lnMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(lineCountDeco);
        const res = await lnMachine(input, output);
        expect(res.lineNumber).toEqual(2); //line read count remains the same
        expect(output.toString()).toEqual('Line count: 2');
    });
    test('does "async fn" well (use RxJS concatMap)', async () => {
        const toUpperAsync = (s) => {
            return new Promise(resolve => setTimeout(() => resolve(s.toUpperCase()), 0));
        };
        const nonEmptyLinesToUpper = (source) => {
            return source.pipe((0, rxjs_1.map)(x => x.value), (0, rxjs_1.concatMap)(s => toUpperAsync(s)));
        };
        const lnMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(nonEmptyLinesToUpper);
        const res = await lnMachine(input, output);
        expect(res.lineNumber).toEqual(2); //line read count remains the same
        expect(output.toString()).toEqual('HELLO, \nWORLD!');
    });
});
describe('transform - error handling', () => {
    const fnWithErr = ({ value, lineNumber }) => {
        if (lineNumber === 2) {
            throw new Error('line2 err!');
        }
        return `-\n${value}`;
    };
    const decoWithErr = source => source.pipe((0, rxjs_1.map)(fnWithErr));
    test("transfers decorator's Fn Error - include error message", async () => {
        expect.assertions(1);
        const lnMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(decoWithErr);
        try {
            await lnMachine(input, output);
        }
        catch (e) {
            expect(e.message).toContain('line2 err!');
        }
    });
    test("transfers decorator's Fn Error - include input stream line info", async () => {
        const lnMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(decoWithErr);
        await expect(lnMachine(input, output)).rejects.toThrow('line [2]');
    });
    test("transfers decorator's Fn Error - include file & line info", async () => {
        const lnMachine = (0, rxjs_line_machine_1.createRxjsLineMachine)(decoWithErr);
        await expect(lnMachine(`${PATH_PREFIX}/dolly-text.txt`, output)).rejects.toThrow('/dolly-text.txt:2');
    });
});
//# sourceMappingURL=rxjs_line_machine_transform_.test.js.map