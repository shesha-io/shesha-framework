import React, { FC, PropsWithChildren, createContext, useContext, useState, useCallback } from 'react';
import { LoaderOverlay } from './loaderOverlay';

export interface LoaderApi {
  show: (message?: string) => () => void;
  hide: () => void;
}

interface GlobalLoaderContextValue {
  loaderApi: LoaderApi;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextValue | undefined>(undefined);

export const useGlobalLoader = (): LoaderApi => {
  const context = useContext(GlobalLoaderContext);
  if (!context) {
    // Return a no-op implementation if provider is not found
    return {
      show: () => () => {},
      hide: () => {},
    };
  }
  return context.loaderApi;
};

interface LoaderState {
  visible: boolean;
  message: string;
  count: number;
}

export const GlobalLoaderProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [loaderState, setLoaderState] = useState<LoaderState>({
    visible: false,
    message: 'Loading...',
    count: 0,
  });

  const show = useCallback((message?: string) => {
    setLoaderState((prev) => ({
      visible: true,
      message: message || 'Loading...',
      count: prev.count + 1,
    }));

    return () => {
      setLoaderState((prev) => {
        const newCount = Math.max(0, prev.count - 1);
        return {
          ...prev,
          visible: newCount > 0,
          count: newCount,
        };
      });
    };
  }, []);

  const hide = useCallback(() => {
    setLoaderState({
      visible: false,
      message: 'Loading...',
      count: 0,
    });
  }, []);

  const loaderApi: LoaderApi = {
    show,
    hide,
  };

  return (
    <GlobalLoaderContext.Provider value={{ loaderApi }}>
      {children}
      {loaderState.visible && <LoaderOverlay message={loaderState.message} />}
    </GlobalLoaderContext.Provider>
  );
};
