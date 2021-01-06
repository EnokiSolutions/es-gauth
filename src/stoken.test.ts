import {generateSecureToken, verifySecureToken} from './stoken';
import * as assert from 'assert';

describe('stoken', () => {
  it('basic', () => {
    const token = generateSecureToken('bob');
    const t = verifySecureToken(token, 'bob');
    assert(t);
    assert(token.startsWith(t));
  });
});
