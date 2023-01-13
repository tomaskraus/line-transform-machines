import {createRxjsLineMachine} from '../src/index';
import {Observable, map, filter} from 'rxjs';
import {stdout} from 'node:process';

const toUpperIgnoreEmptyLinesNumbered = (
  obs: Observable<{value: string; lineNumber: number}>
): Observable<string> => {
  return obs.pipe(
    filter(x => x.value.trim().length > 0),
    map(x => `${x.lineNumber}: ${x.value.toLocaleUpperCase()}`)
  );
};

const lineMachine = createRxjsLineMachine(toUpperIgnoreEmptyLinesNumbered);

// ...the same code as in solution 1
const runner = async () => {
  try {
    await lineMachine('./examples/input.txt', stdout);
  } catch (err) {
    console.error(err);
  }
};
runner();
