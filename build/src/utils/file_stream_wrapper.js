"use strict";
/**
 * adds file capability to stream processor
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileStreamWrapper = void 0;
const fsp = __importStar(require("node:fs/promises"));
const pth = __importStar(require("node:path"));
const _createOutputFile = async (fileName) => {
    const dirPath = pth.dirname(fileName);
    if (dirPath !== '.') {
        return fsp
            .mkdir(dirPath, { recursive: true })
            .then(() => fsp.open(fileName, 'w'));
    }
    return fsp.open(fileName, 'w');
};
const fileStreamWrapper = (proc) => {
    return (inputFileNameOrStream, outputFileNameOrStream
    // options?: TOptions
    ) => {
        return new Promise((resolve, reject) => {
            const continueWithInStreamReady = (inStream, outStream, context) => {
                inStream.on('error', err => reject(err));
                proc(inStream, outStream, context)
                    .then((res) => {
                    // outStream.end();   // closes also stdout
                    resolve(res);
                })
                    .catch(err => reject(err));
            };
            const continueWithOutStreamReady = (outStream, context) => {
                outStream.on('error', err => reject(err));
                if (typeof inputFileNameOrStream === 'string') {
                    fsp
                        .open(inputFileNameOrStream)
                        .then(fhi => continueWithInStreamReady(fhi.createReadStream(), outStream, {
                        ...context,
                        inputFileName: inputFileNameOrStream,
                    }))
                        .catch(err => reject(err));
                }
                else {
                    continueWithInStreamReady(inputFileNameOrStream, outStream, context);
                }
            };
            const context = {};
            if (typeof outputFileNameOrStream === 'string') {
                _createOutputFile(outputFileNameOrStream)
                    .then(fho => continueWithOutStreamReady(fho.createWriteStream(), {
                    ...context,
                    outputFileName: outputFileNameOrStream,
                }))
                    .catch(err => reject(err));
            }
            else {
                continueWithOutStreamReady(outputFileNameOrStream, context);
            }
        });
    };
};
exports.fileStreamWrapper = fileStreamWrapper;
//# sourceMappingURL=file_stream_wrapper.js.map