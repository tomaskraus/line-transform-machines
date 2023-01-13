# line-transform-machines

Processes text input stream/file line by line. Takes care of I/O &amp; Errors. Great for CLI apps.

Maps/filters input lines by calling a (sync/async) callback on them.

### Example

From the input file `input.txt`, print lines, in uppercase, with its line number at the beginning of each line. Do it only for non-empty lines.  
So that:

```
Hello,

world!

```

Becomes:

```
1: HELLO,
3: WORLD!
```

#### Solution 1: use simple callback

```ts
import {createLineMachine} from 'line-transform-machines';
import {stdout} from 'node:process';

const toUpperIgnoreEmptyLinesNumbered = (s: string, lineNum: number) => {
  if (s.trim().length === 0) return null; // returning null removes that line from output
  return `${lineNum}: ${s.toUpperCase()}`;

const lineMachine = createLineMachine(toUpperIgnoreEmptyLinesNumbered);

const runner = async () => {
  try {
    await lineMachine('./examples/input.txt', stdout);
  } catch (err) {
    console.error(err);
  }
};
runner();
```

#### Solution 2: use RxJS

```ts
import {createLineMachine} from 'line-transform-machines';
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
```

#### Example 2: error handling

```ts
import {createLineMachine} from 'line-transform-machines';

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
```

Input (`./examples/nums.txt`):

```
45
62
 12
  6
hello
5
3
```

Console output:

```bash
Error: [./examples/nums.txt:5]
Not a number: hello
    at Object.normalizeNumbers ...
```

See that input file name & line is present in the error message automatically;)

By default, the saved output file contains values before error has been thrown:

Output file (`./examples/normalized.txt`):

```
45
62
12
6
```
