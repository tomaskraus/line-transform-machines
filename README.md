# line-transform-machines

Process text input stream/file line by line. Takes care of I/O &amp; Errors. Great for CLI apps.

### Example

```ts
import {createMapLineMachine} from 'line-transform-machines';
import {stdout} from 'node:process';

const toUpper = (s: string) => s.toUpperCase();
const lineMachine = createMapLineMachine(toUpper);

const runner = async () => {
  const res = await lineMachine('./examples/input.txt', stdout);
  console.log(res);
};
runner();
```
