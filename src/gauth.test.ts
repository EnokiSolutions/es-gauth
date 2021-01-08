import * as sinon from 'sinon';
import {gauthContinueCtor, gauthInitCtor} from './gauth';
import {gauthUserInfoType} from './server.type';
import * as assert from 'assert';

const settings = {
  sessionSecret: 'ss',
  appUrl: '/app',
  google: {
    id: 'gid',
    secret: 'gs',
    redirectUri: 'uri',
    initPath: '/init',
    continuePath: '/continue',
  },
};

describe('gauthInit', () => {
  it('basics', async () => {
    const generateSecureToken = sinon.stub();
    generateSecureToken.returns('stoken');

    const subject = gauthInitCtor(settings, generateSecureToken);

    const ctx: any = {
      url: {
        path: '/init',
      },
      res: {
        writeHead: sinon.stub(),
        end: sinon.stub(),
      },
    };

    await subject(ctx);

    sinon.assert.calledOnce(ctx.res.end);
    sinon.assert.calledOnceWithExactly(
      ctx.res.writeHead,
      303,
      {
        Location: 'https://accounts.google.com/o/oauth2/v2/auth?'
          + 'client_id=gid'
          + '&redirect_uri=uri'
          + '&response_type=code'
          + '&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile'
          + '&state=stoken'
          + '&access_type=offline'
          + '&include_granted_scopes=true'
          + '&prompt=select_account%20consent'
        ,
      });
  });

  it('ignores others paths', async () => {
    const generateSecureToken = sinon.stub();

    const subject = gauthInitCtor(settings, generateSecureToken);

    const ctx: any = {
      url: {
        path: '/asdf',
      },
      res: {
        writeHead: sinon.stub(),
        end: sinon.stub(),
      },
    };

    await subject(ctx);

    sinon.assert.notCalled(generateSecureToken);
    sinon.assert.notCalled(ctx.res.end);
    sinon.assert.notCalled(ctx.res.writeHead);
  });
});

describe('gauthContinue', () => {
  it('basics', async () => {
    const verifySecureToken = sinon.stub();
    const vivifyUser = sinon.stub();

    const axios: any = {
      post: sinon.stub(),
    };

    const idTokenJson: gauthUserInfoType = {
      email: 'a@example.com',
      email_verified: true,
      family_name: 'a',
      given_name: 'example',
      name: 'A Example',
      locale: 'en-us',
      picture: 'http://example.com/picture',
    };

    let axiosData = {
      id_token: '{}.' + Buffer.from(JSON.stringify(idTokenJson)).toString('base64') + '.sig',
      other: 'stuff',
    };

    axios.post.resolves({
      data: axiosData,
    });

    vivifyUser.resolves('user_id');
    verifySecureToken.returns('stoken');

    const subject = gauthContinueCtor(settings, verifySecureToken, vivifyUser, axios);

    const ctx: any = {
      url: {
        path: '/continue',
        params: [['state', 'stoken'], ['code', '4code']],
      },
      res: {
        writeHead: sinon.stub(),
        end: sinon.stub(),
      },
      session: {},
    };

    await subject(ctx);

    sinon.assert.calledOnceWithExactly(
      axios.post,
      'https://oauth2.googleapis.com/token',
      'code=4code'
      + '&client_id=gid'
      + '&redirect_uri=uri'
      + '&client_secret=gs'
      + '&grant_type=authorization_code'
      ,
      {headers: {'Content-Type': 'application/x-www-form-urlencoded'}},
    );

    sinon.assert.calledOnceWithExactly(
      vivifyUser,
      idTokenJson,
      axiosData,
    );

    assert.strictEqual(ctx.session.userId, 'user_id');

    sinon.assert.calledOnceWithExactly(
      ctx.res.writeHead,
      303,
      {Location: settings.appUrl},
    );

    sinon.assert.calledOnce(ctx.res.end);
  });

  it('handles invalid jwt', async () => {
    const verifySecureToken = sinon.stub();
    const vivifyUser = sinon.stub();

    const axios: any = {
      post: sinon.stub(),
    };

    let axiosData = {
      id_token: '{}.invalid.sig',
      other: 'stuff',
    };

    axios.post.resolves({
      data: axiosData,
    });

    verifySecureToken.returns('stoken');

    const subject = gauthContinueCtor(settings, verifySecureToken, vivifyUser, axios);

    const ctx: any = {
      url: {
        path: '/continue',
        params: [['state', 'stoken'], ['code', '4code']],
      },
      res: {
        writeHead: sinon.stub(),
        end: sinon.stub(),
      },
      session: {},
    };

    await subject(ctx);

    sinon.assert.calledOnceWithExactly(
      axios.post,
      'https://oauth2.googleapis.com/token',
      'code=4code'
      + '&client_id=gid'
      + '&redirect_uri=uri'
      + '&client_secret=gs'
      + '&grant_type=authorization_code'
      ,
      {headers: {'Content-Type': 'application/x-www-form-urlencoded'}},
    );

    sinon.assert.notCalled(vivifyUser);
    assert.strictEqual(ctx.session.userId, undefined);
    sinon.assert.notCalled(ctx.res.writeHead);
    assert.strictEqual(ctx.res.statusCode, 400);
    sinon.assert.calledOnceWithExactly(ctx.res.end, "Invalid Request");
  });

  it('handles invalid stoken', async () => {
    const verifySecureToken = sinon.stub();
    const vivifyUser = sinon.stub();
    const axios: any = {
      post: sinon.stub(),
    };

    verifySecureToken.returns(undefined);

    const subject = gauthContinueCtor(settings, verifySecureToken, vivifyUser, axios);

    const ctx: any = {
      url: {
        path: '/continue',
        params: [['state', 'stoken'], ['code', '4code']],
      },
      res: {
        writeHead: sinon.stub(),
        end: sinon.stub(),
      },
      session: {},
    };

    await subject(ctx);

    sinon.assert.notCalled(axios.post);
    sinon.assert.notCalled(vivifyUser);
    assert.strictEqual(ctx.session.userId, undefined);
    sinon.assert.notCalled(ctx.res.writeHead);
    assert.strictEqual(ctx.res.statusCode, 400);
    sinon.assert.calledOnceWithExactly(ctx.res.end, "Invalid Request");
  });

  it('ignores other paths', async () => {
    const verifySecureToken = sinon.stub();
    const vivifyUser = sinon.stub();

    const axios: any = {
      post: sinon.stub(),
    };

    const subject = gauthContinueCtor(settings, verifySecureToken, vivifyUser, axios);

    const ctx: any = {
      url: {
        path: '/asdf',
        params: [],
      },
      res: {
        writeHead: sinon.stub(),
        end: sinon.stub(),
      },
      session: {},
    };

    await subject(ctx);

    sinon.assert.notCalled(axios.post);
    sinon.assert.notCalled(vivifyUser);
    assert.strictEqual(ctx.session.userId, undefined);
    sinon.assert.notCalled(ctx.res.writeHead);
    assert.strictEqual(ctx.res.statusCode, undefined);
    sinon.assert.notCalled(ctx.res.end);
  });
});
