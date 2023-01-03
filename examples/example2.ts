import {createLineMachine} from '../src/linemachine';
import {stdout} from 'node:process';

const toUpperAndNonEmptyIndexed = (s: string, lineNumber: number) => {
  if (s.trim().length === 0) {
    return null; // removes line from output
  }
  return `${lineNumber}: ${s.toUpperCase()}`;
};
const lineMachine = createLineMachine(toUpperAndNonEmptyIndexed);

const runner = async () => {
  try {
    const stats = await lineMachine('./examples/input.txt', stdout);
    console.log('\nstats:', stats);
    console.log('after a lineMachine call');
  } catch (err) {
    console.error(err);
  }
};
runner();
