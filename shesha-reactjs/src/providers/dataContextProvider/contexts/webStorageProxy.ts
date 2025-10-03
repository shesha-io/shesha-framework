import { isDefined } from "@/utils/nullables";

export interface IWebStorageProxy {
  updateOnChangeHandler: (func: () => void) => void;
};

export type webStorageType = 'localStorage' | 'sessionStorage';

export class WebStorageProxy {
  private _onChangeHandler?: () => void;

  private _storage: webStorageType;

  private _prefix: string;

  private serialize(value: unknown): string {
    return JSON.stringify(value); // undefined ans null will be serialized as 'undefined' and 'null'
  }

  private deserialize(value: string | null | undefined): unknown {
    return isDefined(value)
      ? value === 'undefined'
        ? undefined
        : value === 'null'
          ? null
          : JSON.parse(value)
      : value;
  }

  setItem(key: string, value: unknown): void {
    window[this._storage].setItem(`${this._prefix}${key}`, this.serialize(value));
    if (this._onChangeHandler)
      this._onChangeHandler();
  }

  removeItem(key: string): void {
    window[this._storage].removeItem(`${this._prefix}${key}`);
    if (this._onChangeHandler)
      this._onChangeHandler();
  }

  clear(): void {
    window[this._storage].clear();
    if (this._onChangeHandler)
      this._onChangeHandler();
  }

  getItem(key: string): unknown {
    const value = window[this._storage].getItem(`${this._prefix}${key}`);
    return this.deserialize(value);
  }

  key(index: number): string | null {
    return window[this._storage].key(index);
  }

  updateOnChangeHandler(func: () => void): void {
    this._onChangeHandler = func;
  }

  constructor(storage: webStorageType = 'localStorage', prefix: string = '') {
    this._storage = storage;
    this._prefix = prefix;
    return new Proxy(this, {
      get(target, name) {
        if (name in target) {
          const result = target[name as keyof IWebStorageProxy];
          return typeof result === 'function'
            ? result.bind(target)
            : result;
        } else
          return target.getItem(name.toString());
      },
      set(target, name, newValue) {
        target.setItem(name.toString(), newValue);
        return true;
      },
    });
  }
}
