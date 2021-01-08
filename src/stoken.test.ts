import {generateSecureToken, verifySecureToken} from './stoken';
import * as assert from 'assert';
import {stuidZero} from './stuid';

describe('stoken', () => {
  it('basics', () => {
    const token = generateSecureToken('bob');
    const t = verifySecureToken(token, 'bob');
    assert(t);
    assert(token.startsWith(t));
  });
  it('invalid', () => {
    assert(!verifySecureToken(undefined, 'bob'));
    assert(!verifySecureToken(stuidZero, 'bob'));
  });
});
