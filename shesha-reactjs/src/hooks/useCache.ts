import { IDictionary } from '@/interfaces';
import { ICache, ICacheProvider } from '@/providers/metadataDispatcher/entities/models';
import localForage from 'localforage';
import { useEffect, useRef, useState } from 'react';

type LocalForage = ReturnType<typeof localForage.createInstance>;
type StoragesDictionary = IDictionary<LocalForage>;

export const useCache = (name: string) => {
  const [storage, setStorage] = useState(() => {
    return localForage.createInstance({ name: name });
  });
  useEffect(() => {
    if (storage.INDEXEDDB !== name) {
      const newStorage = localForage.createInstance({ name: name });
      setStorage(newStorage);
    }
  }, [name, storage.INDEXEDDB]);

  return storage;
};

export const useCacheProvider = (): ICacheProvider => {
  const storages = useRef<StoragesDictionary>({});

  const [provider] = useState<ICacheProvider>(() => {
    const getCache = (name: string): ICache => {
      if (!storages.current[name]) {
        storages.current[name] = localForage.createInstance({ name: name });
      }

      return storages.current[name];
    };
    return { getCache } as ICacheProvider;
  });

  return provider;
};
