import {ctxType, urlType} from './server.type';
import {IncomingMessage, ServerResponse} from 'http';

function parseUrl(rawUrl: string): urlType {
  const m = rawUrl.match(/^\/?(?<path>([^\/?]\/?)*)(\?(?<params>.*$))?/);
  // @ts-ignore
  const path = '/' + m.groups.path;
  let params: [string, string][] = [];
  // @ts-ignore
  if (m.groups.params) {
    // @ts-ignore
    params = m.groups.params.split('&').map(p => {
      const x = p.split('=');
      return [decodeURIComponent(x[0]), decodeURIComponent(x[1]||'')];
    });
  }
  return {path, params};
}

function parseCookie(cookie: string | undefined): [string,string][] {
  if (!cookie) {
    return [];
  }
  return cookie.split('; ').map(p => {
    const x = p.split('=');
    return [decodeURIComponent(x[0]), decodeURIComponent(x[1]||'')];
  });
}

export function createCtx(req: IncomingMessage, res: ServerResponse): ctxType {
  const url = parseUrl(req.url?.toString() || '/');
  const cookie = parseCookie(req.headers.cookie);
  return {req, res, url, session: {}, user: undefined, sessionId: '', cookie};
}

export type createCtxType = typeof createCtx;

export const _internal_ = { parseUrl, parseCookie };
