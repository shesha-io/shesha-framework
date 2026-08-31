export interface StorageApi {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  key(index: number): string | null;
  length: number;
  [key: string]: unknown;
}

export interface Storage {
  local: StorageApi;
  session: StorageApi;
}
