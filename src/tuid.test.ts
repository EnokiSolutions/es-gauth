import * as assert from 'assert';
import {isTuid, tuidCtor} from './tuid';

describe('tuid', () => {
  it('increase', () => {
    const a = [
      tuidCtor(), tuidCtor(), tuidCtor(), tuidCtor(),
      tuidCtor(), tuidCtor(), tuidCtor(), tuidCtor(),
      tuidCtor(), tuidCtor(), tuidCtor(), tuidCtor(),
      tuidCtor(), tuidCtor(), tuidCtor(), tuidCtor(),
    ];

    a.forEach(v => {
      assert(isTuid(v));
    });

    for (let i = 0; i < a.length - 1; ++i) {
      if (a[i] >= a[i + 1]) {
        console.error(a[i], a[i + 1]);
      }
      assert(a[i] < a[i + 1], `${a[i]} < ${a[i + 1]}`);
    }
  });
});
