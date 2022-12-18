# line-transform-machines

Processes text input stream/file line by line. Takes care of I/O &amp; Errors. Great for CLI apps.

Maps/filters input lines by calling a (sync/async) callback on them.

### Example

```ts
import {createMapLineMachine} from 'line-transform-machines';
import {stdout} from 'node:process';

const toUpperIgnoreEmptyLinesNumbered = (s: string, lineNum: number) => {
  if (s.trim().length === 0) return null;
  return `${lineNum}:\n    ${s.toUpperCase()}`;
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
