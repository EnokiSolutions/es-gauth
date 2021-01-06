import {ctxType} from '../server.type';
import {resolvedVoid} from '../resolved';

export function helloHandler(ctx: ctxType): Promise<void> {
  if (ctx.url.path !== '/hello') {
    return resolvedVoid;
  }

  ctx.res.statusCode = 200;
  ctx.res.setHeader('Content-Type', 'text/plain');
  ctx.res.end(`Hello\nsessionId:\n${ctx.sessionId}\nsession:\n${JSON.stringify(ctx.session, undefined, 2)}\nuser:\n${JSON.stringify(ctx.user, undefined, 2)}`);
  return resolvedVoid;
}
