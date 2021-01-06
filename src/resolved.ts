function resolvedPromise<T>(t: T): Promise<T> {
  return new Promise<T>(r => {
    r(t);
  });
}

export const resolvedVoid = resolvedPromise<void>(void (0));
export const resolvedTrue = resolvedPromise(true);
export const resolvedFalse = resolvedPromise(false);
