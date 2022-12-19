# line-transform-machines

Processes text input stream/file line by line. Takes care of I/O &amp; Errors. Great for CLI apps.

Maps/filters input lines by calling a (sync/async) callback on them.

### Examples

#### Example 1: line add, delete & transform

```ts
import {createMapLineMachine} from 'line-transform-machines';
import {stdout} from 'node:process';

// our callback
const toUpperIgnoreEmptyLinesNumbered = (s: string, lineNum: number) => {
  if (s.trim().length === 0) return null; // returning null removes that line from output
  return `${lineNum}:\n    ${s.toUpperCase()}`; // can 'insert' new lines using newline characters in the string returned
};
const lineMachine = createMapLineMachine(toUpperIgnoreEmptyLinesNumbered);

const runner = async () => {
  try {
    const stats = await lineMachine('./examples/input.txt', stdout);
    console.log('\nstats:', stats);
  } catch (err) {
    console.error(err);
  }
};
runner();
```

Input file (`'./examples/input.txt'`):

```

"name": "line-transform-machines",

  "version": "0.1.0",
  "description": "Process text input stream/file line by line. Takes care of I/O & Errors. Great for CLI apps.",

  "types": "build/src/index.d.ts",
  "main": "build/src/index.js",

  "files": [
    "build/src"
  ],


```

Output:

```
2:
    "NAME": "LINE-TRANSFORM-MACHINES",
4:
      "VERSION": "0.1.0",
5:
      "DESCRIPTION": "PROCESS TEXT INPUT STREAM/FILE LINE BY LINE. TAKES CARE OF I/O & ERRORS. GREAT FOR CLI APPS.",
7:
      "TYPES": "BUILD/SRC/INDEX.D.TS",
8:
      "MAIN": "BUILD/SRC/INDEX.JS",
10:
      "FILES": [
11:
        "BUILD/SRC"
12:
      ],
stats: { linesRead: 14, inputFileName: './examples/input.txt' }
```

#### Example 2: error handling

```ts
import {createMapLineMachine} from 'line-transform-machines';

// our callback that can throw error
const normalizeNumbers = (s: string) => {
  const num = parseInt(s);
  if (isNaN(num)) throw new Error(`Not a number: ${s}`);
  return num.toString();
};
const lineMachine = createMapLineMachine(normalizeNumbers);

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
