import {tuidCtor} from './tuid';

export const settings = {
  host: process.env.HOST || '127.0.0.1',
  port: +(process.env.PORT || '3000'),
  schema: 'http://',
  sessionSecret: process.env.SESSION_SECRET || tuidCtor(),
  google: {
    id: process.env.GOOGLE_AUTH_CLIENT_ID || '',
    secret: process.env.GOOGLE_AUTH_CLIENT_SECRET || '',
    redirectUri: '',
    initPath: '/api/gauth/init',
    continuePath: '/api/gauth/continue',
  },
};

settings.google.redirectUri = settings.schema + settings.host + ':' + settings.port + settings.google.continuePath;
