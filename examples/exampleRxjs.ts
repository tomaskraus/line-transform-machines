import {createMapLineMachineRxjs} from '../src/maplinemachine';
import {stdout} from 'node:process';
import {map, filter, reduce, Observable} from 'rxjs';

// const toUpperAndNonEmptyIndexed = (s: string, lineNumber: number) => {
//   if (s.trim().length === 0) {
//     return null; // removes line from output
//   }
//   return `${lineNumber}: ${s.toUpperCase()}`;
// };

const deco = (obs: Observable<string>) => {
  return obs.pipe(
    filter(v => v.trim().length > 0),
    // map((v, i) => {
    //   if (i === 3) {
    //     throw new Error('i is 3!');
    //   }
    //   return `${i}: ${v}`;
    // }),
    reduce((count: number, _: string) => count + 1, 0),
    map(x => x.toString())
  );
};

const lineMachine = createMapLineMachineRxjs(deco);

const runner = () => {
  const prom = lineMachine('./examples/input.txt', stdout);
  prom
    .then(stats => console.log('\nstats:', stats))
    .catch(err => console.error(err));
  console.log('after a lineMachine call');
};
runner();
