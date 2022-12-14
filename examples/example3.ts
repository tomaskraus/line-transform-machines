import {createMapLineMachine} from '../src/maplinemachine';
import {stdout} from 'node:process';

const normalizeNumbers = (s: string) => {
  const s2 = s.trim();
  if (s2 === '') {
    return null;
  }
  const s3 = parseInt(s2);
  if (isNaN(s3)) {
    throw new Error(`Not a number: ${s2}`);
  }
  return s2;
};
const lineMachine = createMapLineMachine(normalizeNumbers);

const runner = async () => {
  try {
    await lineMachine('./examples/nums.txt', stdout);
  } catch (err) {
    console.error(err);
  }
};
runner();
