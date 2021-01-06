import {contentHandlerType, ctxType, urlType} from './server.type';
import {helloHandler} from './content_handler/hello';
import {IncomingMessage, ServerResponse} from 'http';
import {sessionInit, sessionSet} from './session';
import {gauthContinueCheck, gauthInit} from './gauth';
import {userSet} from './user';

const contentHandlerArray: contentHandlerType[] = [
  helloHandler,
];

function parseUrl(rawUrl: string): urlType {
  const m = rawUrl.match(/^\/?(?<path>([^\/?]\/?)*)(\?(?<params>.*$))?/);
  const path = '/' + m?.groups?.path || '';
  let params: string[][] = [];
  if (m?.groups?.params) {
    params = m?.groups?.params.split('&').map(p => {
      const x = p.split('=');
      return [decodeURIComponent(x[0] || ''), decodeURIComponent(x[1] || '')];
    });
  }
  return {path, params};
}

function parseCookie(cookie: string | undefined): string[][] {
  if (!cookie) {
    return [];
  }
  return cookie.split(';').map(p => {
    const x = p.split('=');
    return [decodeURIComponent(x[0] || ''), decodeURIComponent(x[1] || '')];
  });
}

function createCtx(req: IncomingMessage, res: ServerResponse): ctxType {
  const url = parseUrl(req?.url?.toString() || '/');
  const cookie = parseCookie(req.headers.cookie);
  return {req, res, url, session: {}, user: undefined, sessionId: '', cookie};
}

function handleNotFound(res: ServerResponse) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain');
  res.end('404 No route found');
}

async function handleContent(ctx: ctxType) {
  for (const handler of contentHandlerArray) {
    await handler(ctx);
    if (ctx.res.writableEnded) {
      return;
    }
  }
}

function handleServerError(res: ServerResponse, e: Error) {
  res.statusCode = 500;
  res.setHeader('Content-Type', 'text/plain');
  res.end(`500 Server Error:\n${e}`);
}

export async function requestHandler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  try {
    const ctx = createCtx(req, res);

    // every request gets a sessionId
    await sessionInit(ctx);

    // REDIRECTIONS ALLOWED

    // handle auth
    if (await gauthInit(ctx)) {
      return;
    }

    if (await gauthContinueCheck(ctx)) {
      return;
    }

    // REDIRECTION NO LONGER ALLOWED

    // set session cookie
    await sessionSet(ctx);

    // set user data in ctx from session
    await userSet(ctx);

    // handle first content request
    await handleContent(ctx);

    if (!res.writableEnded) {
      handleNotFound(res);
    }
  } catch (e) {
    console.error(e);
    if (!res.writableEnded) {
      handleServerError(res, e);
    }
  }
}
