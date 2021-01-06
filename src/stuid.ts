import {pad} from './pad';
import {randomBytes} from 'crypto';

const rhc = function rhc(n: number): string {
  return randomBytes(n).toString('hex');
};

export function stuidCtor(): string {
  const now = Date.now() * 1000 + Math.floor(Math.random()*1000);
  const ts = pad('0000000000000000', now.toString(16));
  return ts + rhc(48);
}
