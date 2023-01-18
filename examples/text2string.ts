/**
 * TLDR: reads input text and prints a JS string that represents that input text.
 *
 * Reads the text from a standard input. (let's call that text INPUT-TEXT)
 * Prints a piece of JS code to standard output.
 *   That JS code consists of string (or concatenation of strings) - call it OUT-STRING.
 * OUT-STRING represents an INPUT-TEXT in such a form,
 * that when OUT-STRING is printed by some JS script, its output should contain the INPUT-TEXT.
 *
 * Try it by running on this file:)
 *   cat examples/text2string.ts | node build/examples/text2string.js
 */

import {createRxjsLineMachine} from '../src/rxjs_line_machine';
import type {TLineItem} from '../src/rxjs_line_machine';
import {stdin, stdout} from 'node:process';
import {map, Observable} from 'rxjs';

const jsStringLiteralFromLine = (
  obs: Observable<TLineItem>
): Observable<string> => {
  return obs.pipe(
    map(x => ({
      value: x.value.replace(/\\/g, '\\\\').replace(/'/g, "\\'"),
      lineNumber: x.lineNumber,
    })),
    map(x => (x.lineNumber === 1 ? `'${x.value}'` : `+ '\\n${x.value}'`))
  );
};

const lineMachine = createRxjsLineMachine(jsStringLiteralFromLine);

const runner = () => {
  const process = lineMachine(stdin, stdout);
  process.catch(err => console.error(err));
};
runner();
