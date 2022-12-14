"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maplinemachine_1 = require("../src/maplinemachine");
const node_process_1 = require("node:process");
const toUpper = (s) => s.toUpperCase();
const lineMachine = (0, maplinemachine_1.mapLineMachine)(toUpper);
const runner = async () => {
    const res = await lineMachine('./examples/input.txt', node_process_1.stdout);
    console.log(res);
};
runner();
//# sourceMappingURL=example.js.map