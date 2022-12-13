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
const fileStreamWrapper = (proc) => {
    return (inputFileNameOrStream, outputFileNameOrStream
    // options?: TOptions
    ) => {
        return new Promise((resolve, reject) => {
            const continueWithInStreamReady = (inStream, outStream) => {
                inStream.on('error', err => reject(err));
                proc(inStream, outStream)
                    .then((res) => {
                    // outStream.end();   // closes also stdout
                    resolve(res);
                })
                    .catch(err => reject(err));
            };
            const continueWithOutStreamReady = (outStream) => {
                outStream.on('error', err => reject(err));
                if (typeof inputFileNameOrStream === 'string') {
                    fsp
                        .open(inputFileNameOrStream)
                        .then(fhi => continueWithInStreamReady(fhi.createReadStream(), outStream))
                        .catch(err => reject(err));
                }
                else {
                    continueWithInStreamReady(inputFileNameOrStream, outStream);
                }
            };
            if (typeof outputFileNameOrStream === 'string') {
                fsp
                    .open(outputFileNameOrStream, 'w')
                    .then(fho => continueWithOutStreamReady(fho.createWriteStream()))
                    .catch(err => reject(err));
            }
            else {
                continueWithOutStreamReady(outputFileNameOrStream);
            }
        });
    };
};
exports.fileStreamWrapper = fileStreamWrapper;
//# sourceMappingURL=filestreamwrapper.js.map