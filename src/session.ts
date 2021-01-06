import {ctxType, sessionStoreType, sessionType} from './server.type';
import {settings} from './settings';
import {resolvedVoid} from './resolved';
import {stuidCtor} from './stuid';
import {vivify} from './vivify';

const sessionStore: sessionStoreType = {};

export function sessionInit(ctx: ctxType): Promise<void> {
  const sessionIdFromCookie = ctx.cookie.find(e => e[0] === 'SessionId');
  if (sessionIdFromCookie) {
    ctx.sessionId = sessionIdFromCookie[1];
  }

  ctx.sessionId ||= stuidCtor();
  ctx.session = vivify(sessionStore, ctx.sessionId, {} as sessionType);

  return resolvedVoid;
}

export function sessionSet(ctx: ctxType): Promise<void> {
  // SameSite=Lax is required for the redirect from GoogleAuth back to our server to send cookies in Chrome.
  ctx.res.setHeader('Set-Cookie', `SessionId=${ctx.sessionId}; HttpOnly; Path=/; SameSite=Lax; Domain=${settings.host}; Max-Age=3600${settings.schema === 'https' ? '; Secure' : ''}`);
  return resolvedVoid;
}
