export type StringSubtype<T extends readonly string[]> = T[number];

export type FirstArgument<T> = T extends (arg: infer A, ...args: unknown[]) => unknown ? A : never;

export type Promisify<T> = T extends (...args: infer Args) => infer Return
  ? (...args: Args) => Promise<Awaited<Return>>
  : never;

export type WithRequired<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type WithNonUndefined<T, K extends keyof T> = Omit<T, K> & {
  [P in K]: Required<Exclude<T[P], undefined>>;
};

export type WithRequiredStrict<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: Exclude<T[P], undefined>;
};

export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Basic diff: shows differences between two types T and U
export type Diff<T, U> = {
  onlyInT?: {
    [K in Exclude<keyof T, keyof U>]: T[K];
  };
  onlyInU?: {
    [K in Exclude<keyof U, keyof T>]: U[K];
  };
  diff?: {
    [K in Extract<keyof T, keyof U> as T[K] extends U[K] ? never : K]: {
      left: T[K];
      right: U[K];
    };
  };
};

// Optional: A more detailed diff that also goes deep recursively
export type DeepDiff<T, U> = {
  onlyInT?: {
    [K in Exclude<keyof T, keyof U>]: T[K];
  };
  onlyInU?: {
    [K in Exclude<keyof U, keyof T>]: U[K];
  };
  diff?: {
    [K in Extract<keyof T, keyof U> as T[K] extends U[K] ? never : K]:
    // If both are objects, recurse; otherwise show simple left/right
    (T[K] extends object ? (U[K] extends object ? DeepDiff<T[K], U[K]> : { left: T[K]; right: U[K] }) : { left: T[K]; right: U[K] });
  };
};
