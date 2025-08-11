type StorageValue = string | number | boolean | object | null;

export interface IAsyncStorage {
    getAsync<T extends StorageValue>(key: string): Promise<T | null>;
    setAsync(key: string, value: StorageValue): Promise<void>;
    removeAsync(key: string): Promise<void>;
    clearAsync(): Promise<void>;
    hasAsync(key: string): Promise<boolean>;
    getKeysAsync(): Promise<string[]>;
}

class AsyncLocalStorage implements IAsyncStorage {
    private static instance: AsyncLocalStorage;

    private constructor() {
        //
    }

    public static getInstance(): IAsyncStorage {
        if (!AsyncLocalStorage.instance) {
            AsyncLocalStorage.instance = new AsyncLocalStorage();
        }
        return AsyncLocalStorage.instance;
    }

    public getAsync<T extends StorageValue>(key: string): Promise<T | null> {
        return new Promise((resolve) => {
            try {
                const item = localStorage.getItem(key);
                if (item === null) {
                    resolve(null);
                    return;
                }

                try {
                    resolve(JSON.parse(item) as T);
                } catch {
                    resolve(item as unknown as T);
                }
            } catch (error) {
                console.error(`Error getting item from localStorage: ${error}`);
                resolve(null);
            }
        });
    }

    public setAsync(key: string, value: StorageValue): Promise<void> {
        return new Promise((resolve) => {
            try {
                if (value === null || value === undefined) {
                    this.removeAsync(key).then(resolve);
                    return;
                }

                const serialized = typeof value === 'string' ? value : JSON.stringify(value);
                localStorage.setItem(key, serialized);
                resolve();
            } catch (error) {
                console.error(`Error setting item in localStorage: ${error}`);
                resolve();
            }
        });
    }

    public removeAsync(key: string): Promise<void> {
        return new Promise((resolve) => {
            try {
                localStorage.removeItem(key);
                resolve();
            } catch (error) {
                console.error(`Error removing item from localStorage: ${error}`);
                resolve();
            }
        });
    }

    public clearAsync(): Promise<void> {
        return new Promise((resolve) => {
            try {
                localStorage.clear();
                resolve();
            } catch (error) {
                console.error(`Error clearing localStorage: ${error}`);
                resolve();
            }
        });
    }

    public async hasAsync(key: string): Promise<boolean> {
        const value = await this.getAsync(key);
        return value !== null;
    }

    public getKeysAsync(): Promise<string[]> {
        return new Promise((resolve) => {
            try {
                resolve(Object.keys(localStorage));
            } catch (error) {
                console.error(`Error getting localStorage keys: ${error}`);
                resolve([]);
            }
        });
    }
}

// Singleton instance
export const asyncStorage = AsyncLocalStorage.getInstance();