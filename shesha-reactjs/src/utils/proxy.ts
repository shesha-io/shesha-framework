export type ProxyArgs = {
  onGetProperty?: (name: string) => unknown;
};
export const createProxy = <T extends object>(target: T, args: ProxyArgs): T => {
  return new Proxy(target, {
    get(obj, name) {
      if (name in obj) {
        const result = obj[name as keyof T];
        return typeof result === 'function' ? result.bind(obj) : result;
      }

      if (typeof name === 'string' && args.onGetProperty) {
        return args.onGetProperty(name as string);
      }
      return undefined;
    },

    set(obj, name, value: T[keyof T]) {
      if (name in obj) {
        obj[name as keyof T] = value; // Fully typed assignment
        return true;
      }
      return false;
    },
  });
};
