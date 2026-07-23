declare module 'object-hash' {
  interface HashOptions {
    algorithm?: 'sha1' | 'md5' | 'passthrough';
    encoding?: 'buffer' | 'hex' | 'binary' | 'base64';
    excludeValues?: boolean;
    ignoreUnknown?: boolean;
    replacer?: (value: unknown) => unknown;
    respectFunctionProperties?: boolean;
    respectFunctionNames?: boolean;
    respectType?: boolean;
    unorderedArrays?: boolean;
    unorderedSets?: boolean;
    unorderedObjects?: boolean;
    excludeKeys?: (key: string) => boolean;
  }

  const hash: (value: unknown, options?: HashOptions) => string;

  export default hash;
}
