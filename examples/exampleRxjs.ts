import {createRxJSLineMachine} from '../src/rxjs-line-machine';
import {stdout} from 'node:process';
import {map, filter, reduce, Observable} from 'rxjs';

const nonEmptyLinesCount = (obs: Observable<string>) => {
  return obs.pipe(
    // map((v, i) => {
    //   if (i === 3) {
    //     throw new Error('i is 3!');
    //   }
    //   return `${i}: ${v}`;
    // }),
    filter(v => v.trim().length > 0),
    reduce((count: number) => count + 1, 0),
    map(x => x.toString())
  );
};

const lineMachine = createRxJSLineMachine(nonEmptyLinesCount);

const runner = () => {
  const prom = lineMachine('./examples/input.txt', stdout);
  prom
    .then(stats => console.log('\nstats:', stats))
    .catch(err => console.error(err));
  console.log('after a lineMachine call');
};
runner();