import * as assert from 'assert';
import {isStuid, stuidCtor} from './stuid';

describe('stuid', () => {
  it('increase', () => {
    const a = [
      stuidCtor(), stuidCtor(), stuidCtor(), stuidCtor(),
      stuidCtor(), stuidCtor(), stuidCtor(), stuidCtor(),
      stuidCtor(), stuidCtor(), stuidCtor(), stuidCtor(),
      stuidCtor(), stuidCtor(), stuidCtor(), stuidCtor(),
    ];

    a.forEach(v => {
      assert(isStuid(v));
    });

    for (let i = 0; i < a.length - 1; ++i) {
      if (a[i] >= a[i + 1]) {
        console.error(a[i], a[i + 1]);
      }
      assert(a[i] < a[i + 1], `${a[i]} < ${a[i + 1]}`);
    }
  });
});
