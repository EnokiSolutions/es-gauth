// istanbul ignore file
// -- bootstrap

import {ctxType, handlerType} from './server.type';
import {helloHandler} from './content_handler/hello';
import {IncomingMessage, ServerResponse} from 'http';
import {sessionInit, sessionSet} from './session';
import {gauthContinue, gauthInit} from './gauth';
import {userSet} from './user';
import {createCtx} from './create_ctx';

const contentHandlerArray: handlerType[] = [
  helloHandler,
];

const authHandlerArray: handlerType[] = [
  gauthInit,
  gauthContinue,
];

//----------------------

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

async function handleAuth(ctx: ctxType) {
  for (const handler of authHandlerArray) {
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

    await handleAuth(ctx);
    if (res.writableEnded) {
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
