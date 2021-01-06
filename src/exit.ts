
let exitResolve: (value: unknown) => void | undefined;
export const exitPromise = new Promise((r: (value: unknown) => void) => {
  exitResolve = r;
});

process.on('SIGINT', () => {
  exitResolve?.(0);
});
