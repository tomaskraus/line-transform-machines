import {createMapLineMachine} from '../src/maplinemachine';
import {stdout} from 'node:process';

const toUpper = (s: string) => s.toUpperCase();
const lineMachine = createMapLineMachine(toUpper);

const runner = async () => {
  const res = await lineMachine('./examples/input.txt', stdout);
  console.log(res);
};
runner();
