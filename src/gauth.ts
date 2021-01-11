import {ctxType, gauthUserInfoType, handlerType} from './server.type';
import {resolvedVoid} from './resolved';
import {generateSecureTokenType, verifySecureTokenType} from './stoken';
import {toUrlParam} from './to_url_param';
import {kvpArrayToObject} from './kvp_array_to_object';
import {AxiosStatic} from 'axios';
import {vivifyUserType} from './user';

export function gauthInitCtor(
  settings: {
    sessionSecret: string;
    google: {
      redirectUri: string;
      id: string;
      initPath: string,
    },
  },
  generateSecureToken: generateSecureTokenType,
): handlerType {

  function gauthInit(ctx: ctxType): Promise<void> {
    if (ctx.url.path !== settings.google.initPath) {
      return resolvedVoid;
    }
    const token = generateSecureToken(settings.sessionSecret);
    const params: [string, string][] = [
      ['client_id', settings.google.id],
      ['redirect_uri', settings.google.redirectUri],
      ['response_type', 'code'],
      ['scope', 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile'],
      ['state', token],
      ['access_type', 'offline'],
      ['include_granted_scopes', 'true'],
      ['prompt', 'select_account consent'],
    ];
    const location = 'https://accounts.google.com/o/oauth2/v2/auth?' + toUrlParam(params);

    ctx.res.writeHead(
      303,
      {
        Location: location,
      });
    ctx.res.end();
    return resolvedVoid;
  }

  return gauthInit;
}

export function gauthContinueCtor(
  settings: {
    appUrl: string;
    sessionSecret: string;
    google: {
      secret: string;
      redirectUri: string;
      id: string;
      continuePath: string;
    },
  },
  verifySecureToken: verifySecureTokenType,
  vivifyUser: vivifyUserType,
  axios: AxiosStatic,
): handlerType {
  function jwtTrustedDecode(data: string) {
    // doesn't check the signature, as we already trust the source.
    return JSON.parse(Buffer.from(data.split('.')[1], 'base64').toString('utf-8'));
  }

  async function gauthContinue(ctx: ctxType): Promise<void> {
    if (ctx.url.path != settings.google.continuePath) {
      return resolvedVoid;
    }
    const {state, code} = kvpArrayToObject(ctx.url.params) as { state: string, code: string };
    const stuid = verifySecureToken(state, settings.sessionSecret);
    // check age of stuid, reject if older than X mins.
    if (!state || !code || !stuid) {
      ctx.res.statusCode = 400;
      ctx.res.end('Invalid Request');
      return resolvedVoid;
    }
    try {
      const r = await axios.post<Record<string, unknown>>(
        'https://oauth2.googleapis.com/token',
        toUrlParam([
          ['code', code],
          ['client_id', settings.google.id],
          ['redirect_uri', settings.google.redirectUri],
          ['client_secret', settings.google.secret],
          ['grant_type', 'authorization_code'],
        ]),
        {headers: {'Content-Type': 'application/x-www-form-urlencoded'}},
      );
      const userData = jwtTrustedDecode(r.data.id_token as string) as gauthUserInfoType;
      ctx.session.userId = await vivifyUser(userData, r.data);
      ctx.res.writeHead(303, {Location: settings.appUrl});
      ctx.res.end();
    } catch (e) {
      ctx.res.statusCode = 400;
      ctx.res.end('Invalid Request');
    }
    return resolvedVoid;
  }

  return gauthContinue;
}
