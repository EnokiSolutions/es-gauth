import {ctxType, gauthUserInfoType} from './server.type';
import {settings} from './settings';
import {resolvedFalse, resolvedTrue} from './resolved';
import {generateSecureToken, verifySecureToken} from './stoken';
import {toUrlParam} from './to_url_param';
import {paramArrayToObject} from './param_array_to_object';
import axios from 'axios';
import {vivifyUser} from './user';

export function gauthInit(ctx: ctxType): Promise<boolean> {
  if (ctx.url.path != settings.google.initPath) {
    return resolvedFalse;
  }
  const token = generateSecureToken(settings.sessionSecret);
  const params = [
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
  return resolvedTrue;
}

function jwtDecode(data: string) {
  return JSON.parse(Buffer.from(data.split('.')[1], 'base64').toString('utf-8'));
}

export async function gauthContinueCheck(ctx: ctxType): Promise<boolean> {
  if (ctx.url.path != settings.google.continuePath) {
    return resolvedFalse;
  }
  const {state, code} = paramArrayToObject(ctx.url.params);
  if (!state || !code || !verifySecureToken(state, settings.sessionSecret)) {
    ctx.res.statusCode = 400;
    ctx.res.end('Invalid Request');
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
    const data = jwtDecode(r.data.id_token as string);
    ctx.session.userId = await vivifyUser(data as gauthUserInfoType, r.data);
    ctx.res.writeHead(303, {Location: '/hello'});
    ctx.res.end();
    return resolvedTrue;
  } catch (e) {
    ctx.res.statusCode = 400;
    ctx.res.end('Invalid Request');
  }
  return resolvedFalse;
}
