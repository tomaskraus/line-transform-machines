import {createMapLineMachine} from '../src/maplinemachine';
import {stdout} from 'node:process';

const toUpper = (s: string) => s.toUpperCase();
const lineMachine = createMapLineMachine(toUpper);

const runner = async () => {
  try {
    const stats = await lineMachine('./examples/input.txt', stdout);
    console.log('\nstats:', stats);
  } catch (err) {
    console.error(err);
  }
};
runner();
