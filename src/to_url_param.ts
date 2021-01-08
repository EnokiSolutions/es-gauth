export function toUrlParam(paramArray: [string, unknown][]) {
  return paramArray.map(
    (e) => `${encodeURIComponent(e[0])}=${encodeURIComponent(`${e[1]}`)}`,
  ).join('&');
}
