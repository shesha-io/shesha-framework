export interface IWebStorageApi {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  length: number;
  [key: string]: any;
}

export interface IWebStorage {
  local: IWebStorageApi;
  session: IWebStorageApi;
}
