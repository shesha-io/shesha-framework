import React, { FC, PropsWithChildren, createContext, useContext, useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
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
      show: () => () => { /* no-op */ },
      hide: () => { /* no-op */ },
    };
  }
  return context.loaderApi;
};

interface LoaderInstance {
  id: string;
  message: string;
  dismissed: boolean;
}

export const GlobalLoaderProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [activeLoaders, setActiveLoaders] = useState<LoaderInstance[]>([]);

  const show = useCallback((message?: string) => {
    const loaderId = nanoid();
    const loaderInstance: LoaderInstance = {
      id: loaderId,
      message: message || 'Loading...',
      dismissed: false,
    };

    setActiveLoaders((prev) => [...prev, loaderInstance]);

    // Return cleanup function for this specific instance
    return () => {
      setActiveLoaders((prev) =>
        prev.map((loader) =>
          loader.id === loaderId ? { ...loader, dismissed: true } : loader
        ).filter((loader) => !loader.dismissed)
      );
    };
  }, []);

  const hide = useCallback(() => {
    setActiveLoaders([]);
  }, []);

  const loaderApi: LoaderApi = {
    show,
    hide,
  };

  // Get the most recent active loader's message
  const currentLoader = activeLoaders.length > 0 ? activeLoaders[activeLoaders.length - 1] : null;

  return (
    <GlobalLoaderContext.Provider value={{ loaderApi }}>
      {children}
      {currentLoader && <LoaderOverlay message={currentLoader.message} />}
    </GlobalLoaderContext.Provider>
  );
};
