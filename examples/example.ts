import {createLineMachine} from '../src/line_machine';
import {stdout} from 'node:process';

// our callback
const toUpperIgnoreEmptyLinesNumbered = (s: string, lineNum: number) => {
  if (s.trim().length === 0) return null; // returning null removes that line from output
  return `${lineNum}:\n    ${s.toUpperCase()}`; // can 'insert' new lines using newline characters in the string returned
};
const lineMachine = createLineMachine(toUpperIgnoreEmptyLinesNumbered);

const runner = async () => {
  try {
    const stats = await lineMachine('./examples/input.txt', stdout);
    console.log('\nstats:', stats);
  } catch (err) {
    console.error(err);
  }
};
runner();
