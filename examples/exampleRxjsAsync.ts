import {createRxjsLineMachine} from '../src/rxjs_line_machine';
import type {TLineItem, TObservableDecorator} from '../src/rxjs_line_machine';
import {stdout} from 'node:process';
import {map, filter, concatMap, Observable} from 'rxjs';

const toUpperAsync = (s: string): Promise<string> => {
  return new Promise(resolve =>
    setTimeout(() => resolve(s.toUpperCase()), 1000)
  );
};

const nonEmptyLinesToUpper: TObservableDecorator = (
  source: Observable<TLineItem>
): Observable<string> => {
  return source.pipe(
    map(x => x.value),
    filter(v => v.trim().length > 0),
    concatMap(s => toUpperAsync(s))
  );
};

const lineMachine = createRxjsLineMachine(nonEmptyLinesToUpper);

const runner = () => {
  const prom = lineMachine('./examples/input.txt', stdout);
  prom
    .then(stats => console.log('\nstats:', stats))
    .catch(err => console.error(err));
  console.log('after a lineMachine call');
};
runner();
