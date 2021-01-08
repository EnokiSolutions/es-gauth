// istanbul ignore file
// -- will be replaced with DB based session storage

import {ctxType, handlerType, sessionStoreType, sessionType} from './server.type';
import {resolvedVoid} from './resolved';
import {stuidCtor} from './stuid';
import {vivify} from './vivify';

const sessionStore: sessionStoreType = {};

export function sessionInitCtor(): handlerType {
  function sessionInit(ctx: ctxType): Promise<void> {
    const sessionIdFromCookie = ctx.cookie.find(e => e[0] === 'SessionId');
    if (sessionIdFromCookie) {
      ctx.sessionId = sessionIdFromCookie[1];
    }

    ctx.sessionId ||= stuidCtor();
    ctx.session = vivify(sessionStore, ctx.sessionId, {} as sessionType);

    return resolvedVoid;
  }

  return sessionInit;
}

export function sessionSetCtor(
  settings: {
    schema: string;
    host: string;
  }): handlerType {
  function sessionSet(ctx: ctxType): Promise<void> {
    // SameSite=Lax is required for the redirect from GoogleAuth back to our server to send cookies in Chrome.
    ctx.res.setHeader('Set-Cookie', `SessionId=${ctx.sessionId}; HttpOnly; Path=/; SameSite=Lax; Domain=${settings.host}; Max-Age=3600${settings.schema === 'https' ? '; Secure' : ''}`);
    return resolvedVoid;
  }
  return sessionSet;
}
