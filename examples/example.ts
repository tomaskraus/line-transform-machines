import {createMapLineMachine} from '../src/maplinemachine';
import {stdout} from 'node:process';

const toUpperIgnoreEmptyLinesNumbered = (s: string, lineNum: number) => {
  if (s.trim().length === 0) return null;
  return `${lineNum}: ${s.toUpperCase()}`;
};
const lineMachine = createMapLineMachine(toUpperIgnoreEmptyLinesNumbered);

const runner = async () => {
  try {
    const stats = await lineMachine('./examples/input.txt', stdout);
    console.log('\nstats:', stats);
  } catch (err) {
    console.error(err);
  }
};
runner();
