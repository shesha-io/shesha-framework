export interface IWebStorageProx {
  updateOnChangeHandler: (func: () => void) => void;
};

export type webStorageType = 'localStorage' | 'sessionStorage';

export class WebStorageProxy {
  private _onChangeHandler: () => void;

  private _storage: webStorageType;

  private _prefix: string;

  setItem(key: string, value: any) {
    window[this._storage].setItem(`${this._prefix}${key}`, value);
    if (this._onChangeHandler)
      this._onChangeHandler();
  }

  removeItem(key: string) {
    window[this._storage].removeItem(`${this._prefix}${key}`);
    if (this._onChangeHandler)
      this._onChangeHandler();
  }

  clear() {
    window[this._storage].clear();
    if (this._onChangeHandler)
      this._onChangeHandler();
  }

  getItem(key: string) {
    return window[this._storage].getItem(`${this._prefix}${key}`);
  }

  key(index: number) {
    window[this._storage].key(index);
  }

  updateOnChangeHandler(func: () => void) {
    this._onChangeHandler = func;
  }

  constructor(storage: webStorageType = 'localStorage', prefix: string = '') {
    this._storage = storage;
    this._prefix = prefix;
    return new Proxy(this, {
      get(target, name) {
        const propName = name.toString();
        return propName in target
          ? typeof target[propName] === 'function' ? target[propName].bind(target) : target[propName]
          : target.getItem(propName);
      },
      set(target, name, newValue) {
        target.setItem(name.toString(), newValue);
        return true;
      },
    });
  }
}
