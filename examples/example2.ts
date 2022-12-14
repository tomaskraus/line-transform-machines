import {createMapLineMachine} from '../src/maplinemachine';
import {stdout} from 'node:process';

const toUpperAndNonEmptyIndexed = (s: string, lineNumber: number) => {
  if (s.trim().length === 0) {
    return null; // removes line from output
  }
  return `${lineNumber}: ${s.toUpperCase()}`;
};
const lineMachine = createMapLineMachine(toUpperAndNonEmptyIndexed);

const runner = async () => {
  const res = await lineMachine('./examples/input.txt', stdout);
  console.log('\n', res);
};
runner();
