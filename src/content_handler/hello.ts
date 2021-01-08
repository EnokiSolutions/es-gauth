import {ctxType} from '../server.type';
import {resolvedVoid} from '../resolved';

export function helloHandler(ctx: ctxType): Promise<void> {
  if (ctx.url.path !== '/hello') {
    return resolvedVoid;
  }

  ctx.res.statusCode = 200;
  ctx.res.setHeader('Content-Type', 'text/plain');
  console.log(ctx.user);
  ctx.res.end("Hello");
  return resolvedVoid;
}
