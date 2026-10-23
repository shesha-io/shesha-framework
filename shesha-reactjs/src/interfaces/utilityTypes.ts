export type StringSubtype<T extends readonly string[]> = T[number];

export type FirstArgument<T> = T extends (arg: infer A, ...args: unknown[]) => unknown ? A : never;

export type Promisify<T> = T extends (...args: infer Args) => infer Return
  ? (...args: Args) => Promise<Awaited<Return>>
  : never;

export type WithRequiredStrict<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: Exclude<T[P], undefined>;
};

// Optional: A more detailed diff that also goes deep recursively
/** @public */
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
