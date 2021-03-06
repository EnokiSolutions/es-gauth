import {_internal_, createCtx} from './create_ctx';
import * as assert from 'assert';
import {ctxType} from './server.type';

function commonChecks(ctx: ctxType, res: any, req: any) {
  assert.strictEqual(ctx.sessionId, '');
  assert.strictEqual(ctx.user, undefined);
  assert.deepStrictEqual(ctx.session, {});
  assert.strictEqual(ctx.res, res);
  assert.strictEqual(ctx.req, req);
}

describe('createCtx', () => {
  it('basics', async () => {
    const req: any = {
      url: '/hello?a=1&b=2',
      headers: {
        cookie: 'c=3; d=4',
      },
    };
    const res: any = {};
    const ctx = createCtx(req, res);
    commonChecks(ctx, res, req);
    assert.deepStrictEqual(ctx.url, {path: '/hello', params: [['a', '1'], ['b', '2']]});
    assert.deepStrictEqual(ctx.cookie, [['c', '3'], ['d', '4']]);
  });


  it('no url', async () => {
    const req: any = {
      url: undefined,
      headers: {
        cookie: '',
      },
    };
    const res: any = {};
    const ctx = createCtx(req, res);

    commonChecks(ctx, res, req);
    assert.deepStrictEqual(ctx.url, {path: '/', params: []});
    assert.deepStrictEqual(ctx.cookie, []);
  });

  it('no query params', async () => {
    assert.deepStrictEqual(_internal_.parseUrl('/hello'), {path: '/hello', params: []});
  });

  it('no cookie', async () => {
    assert.deepStrictEqual(_internal_.parseCookie(''), []);
  });

  it ('bad cookie', () =>{
    assert.deepStrictEqual(_internal_.parseCookie('a=; b; '), [['a', ''], ['b', ''], ['', '']]);
  });

  it ('bad params', () => {
    assert.deepStrictEqual(_internal_.parseUrl('?c&d=&'), {path: '/', params: [['c', ''], ['d', ''], ['', '']]});
  });
})
;
