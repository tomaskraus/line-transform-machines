import {createLineMachine} from '../src/line_machine';
import {stdout} from 'node:process';

const toUpperAndNonEmptyIndexed = (s: string, lineNumber: number) => {
  if (s.trim().length === 0) {
    return null; // removes line from output
  }
  return `${lineNumber}: ${s.toUpperCase()}`;
};
const lineMachine = createLineMachine(toUpperAndNonEmptyIndexed);

const runner = () => {
  const prom = lineMachine('./examples/input.txt', stdout);
  prom
    .then(stats => console.log('\nstats:', stats))
    .catch(err => console.error(err));
  console.log('after a lineMachine call');
};
runner();
