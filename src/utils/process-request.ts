export type Result<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      ok: false;
      error: unknown;
    };

export const ProcessRequest = <TArgs extends any[], TReturn>(
  func: (...args: TArgs) => TReturn,
  ...args: TArgs
): Result<TReturn> => {
  try {
    return {
      value: func(...args),
      ok: true,
    };
  } catch (e) {
    return {
      error: e,
      ok: false,
    };
  }
};

export const ProcessRequestAsync = async <TArgs extends any[], TReturn>(
  func: (...args: TArgs) => Promise<TReturn>,
  ...args: TArgs
): Promise<Result<TReturn>> => {
  try {
    return {
      value: await func(...args),
      ok: true,
    };
  } catch (e) {
    return {
      error: e,
      ok: false,
    };
  }
};
