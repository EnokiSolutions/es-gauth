import {createHmac} from 'crypto';
import {stuidCtor} from './stuid';

export function generateSecureToken(secret: string): string {
  const s = stuidCtor();
  const x = createHmac('sha256', secret);
  x.update(s);
  return s + '|' + x.digest('hex');
}

export function verifySecureToken(token: string | undefined, secret: string): string | undefined {
  if (!token) {
    return;
  }
  const [s, e] = token.split('|');
  const x = createHmac('sha256', secret);
  x.update(s);
  if (x.digest('hex') === e) {
    return s;
  }
}
