import {stdout} from 'node:process';
import {Observable, map, filter} from 'rxjs';
import {createRxjsLineMachine} from '../src/rxjs_line_machine';

const toUpperIgnoreEmptyLinesNumbered = (
  obs: Observable<{value: string; lineNumber: number}>
): Observable<string> => {
  return obs.pipe(
    filter(x => x.value.trim().length > 0),
    map(x => `${x.lineNumber}: ${x.value.toLocaleUpperCase()}`)
  );
};

const lineMachine = createRxjsLineMachine(toUpperIgnoreEmptyLinesNumbered);

const runner = async () => {
  try {
    await lineMachine('./examples/input.txt', stdout);
  } catch (err) {
    console.error(err);
  }
};
runner();
