import {createLineMachine} from '../src/linemachine';

// our callback that can throw error
const normalizeNumbers = (s: string) => {
  const num = parseInt(s);
  if (isNaN(num)) throw new Error(`Not a number: ${s}`);
  return num.toString();
};
const lineMachine = createLineMachine(normalizeNumbers);

const runner = async () => {
  try {
    await lineMachine('./examples/nums.txt', './examples/normalized.txt');
  } catch (err) {
    console.error(err);
  }
};
runner();
