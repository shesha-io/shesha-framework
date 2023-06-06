import { IComponentSettings } from "@shesha/reactjs/dist/providers/appConfigurator/models";
import { useState } from "react";

interface IIndexedDBParams<S> {
  dbName: string;
  storeName: string;
  recordName?: string;
  defaultValue: S;
  onError?: (ev: Event) => any;
}

interface IIndexedDB<P> {
  getAll: () => void;
  item: P;
}

export const useIndexedDB = <T = unknown>(
  params: IIndexedDBParams<T>
): IIndexedDB<T> => {
  const { dbName, defaultValue, onError, recordName, storeName } = params;

  const [{ item }, setState] = useState({ item: defaultValue });

  const getAll = () => {
    const request = indexedDB.open(dbName, 3);

    request.onsuccess = function () {
      const db = request.result;
      const transaction = db.transaction(storeName, "readonly");
      const objectStore = transaction.objectStore(storeName);

      if ("getAll" in objectStore) {
        objectStore.getAll().onsuccess = function (event) {
          setState((s) => ({
            ...s,
            item: getIndexItem(recordName, event) as T,
          }));
        };
      }
    };

    request.onerror = function (e) {
      if (onError) onError(e);
    };
  };

  const getIndexItem = (name: string, event: Event) => {
    const result = (event.target as { [key in string]: any })
      ?.result as IComponentSettings[];

    if (name) {
      return (result || []).find((i) => i?.name === recordName)?.settings;
    }

    if (result?.length) {
      return result[0]?.settings;
    }

    if (result && typeof result === "object") {
      return result;
    }

    return {};
  };

  return { getAll, item };
};
