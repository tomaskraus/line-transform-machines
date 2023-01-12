import {stdout} from 'node:process';
import {createLineMachine} from '../src/line_machine';

const toUpperIgnoreEmptyLinesNumbered = (s: string, lineNum: number) => {
  if (s.trim().length === 0) return null; // returning null removes that line from output
  return `${lineNum}: ${s.toUpperCase()}`; // can 'insert' new lines using newline characters in the string returned
};

const lineMachine = createLineMachine(toUpperIgnoreEmptyLinesNumbered);

const runner = async () => {
  try {
    await lineMachine('./examples/input.txt', stdout);
  } catch (err) {
    console.error(err);
  }
};
runner();
