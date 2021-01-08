import {IncomingMessage, ServerResponse} from 'http';

export type urlType = {
  path: string,
  params: [string,string][],
}
export type ctxType = {
  sessionId: string;
  req: IncomingMessage,
  res: ServerResponse,
  url: urlType,
  session: sessionType,
  user?: userType,
  cookie: [string,string][],
}
type userType = {
  userId: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
  rawAuthResponse: Record<string, unknown>;
};
export type userStoreType = {
  [userId: string]: userType
}
export type gauthUserInfoType = {
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale: string;
};
export type sessionType = {
  userId?: string;
  [key: string]: unknown;
};
export type sessionStoreType = {
  [sessionId: string]: sessionType;
};
export type handlerType = (ctx: ctxType) => Promise<void>;
