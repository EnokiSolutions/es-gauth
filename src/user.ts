import {ctxType, gauthUserInfoType, userStoreType} from './server.type';
import {tuidCtor} from './tuid';
import {resolvedVoid} from './resolved';

const userStore: userStoreType = {};

export async function vivifyUser({
    email,
    email_verified,
    name,
    picture,
    given_name,
    family_name,
    locale,
  }: gauthUserInfoType,
  rawAuthResponse: Record<string, unknown>,
): Promise<string> {
  let u = Object.values(userStore).find(us => us.email === email);
  if (!u) {
    const userId = tuidCtor();
    u = {userId, email, email_verified, name, picture, given_name, family_name, locale, rawAuthResponse};
    userStore[userId] = u;
  }
  return u.userId;
}

export function userSet(ctx: ctxType): Promise<void> {
  if (ctx.session.userId) {
    ctx.user = userStore[ctx.session.userId];
  }
  return resolvedVoid;
}
