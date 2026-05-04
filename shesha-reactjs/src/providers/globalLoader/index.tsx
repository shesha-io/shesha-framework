import React, { FC, PropsWithChildren, createContext, useContext, useState, useCallback, useRef } from 'react';
import { nanoid } from '@/utils/uuid';
import { LoaderOverlay } from './loaderOverlay';

/**
 * Loader instance with methods for progressive feedback and control
 */
export interface ILoaderInstance {
  /**
   * Updates the message displayed in the loader
   */
  updateMessage(message: string): void;
  /**
   * Switches the loader to blocking mode (prevents user interaction)
   */
  block(): void;
  /**
   * Switches the loader to non-blocking mode (allows user interaction)
   */
  unblock(): void;
  /**
   * Closes and removes this specific loader instance
   */
  close(): void;
}

export interface LoaderApi {
  showLoader: (message?: string, isBlocking?: boolean) => ILoaderInstance;
  hideLoaders: () => void;
}

interface GlobalLoaderContextValue {
  loaderApi: LoaderApi;
}

const GlobalLoaderContext = createContext<GlobalLoaderContextValue | undefined>(undefined);

export const useGlobalLoader = (): LoaderApi => {
  const context = useContext(GlobalLoaderContext);
  if (!context) {
    // Return a no-op implementation if provider is not found
    const noOpInstance: ILoaderInstance = {
      updateMessage: () => { /* no-op */ },
      block: () => { /* no-op */ },
      unblock: () => { /* no-op */ },
      close: () => { /* no-op */ },
    };
    return {
      showLoader: () => noOpInstance,
      hideLoaders: () => { /* no-op */ },
    };
  }
  return context.loaderApi;
};

interface InternalLoaderInstance {
  id: string;
  message: string;
  isBlocking: boolean;
}

export const GlobalLoaderProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeLoaders, setActiveLoaders] = useState<InternalLoaderInstance[]>([]);
  const loadersRef = useRef<Map<string, InternalLoaderInstance>>(new Map());

  const updateLoader = useCallback((id: string, updates: Partial<InternalLoaderInstance>) => {
    setActiveLoaders((prev) => {
      const updated = prev.map((loader) =>
        loader.id === id ? { ...loader, ...updates } : loader,
      );
      // Update ref
      const loader = updated.find((l) => l.id === id);
      if (loader) {
        loadersRef.current.set(id, loader);
      }
      return updated;
    });
  }, []);

  const removeLoader = useCallback((id: string) => {
    setActiveLoaders((prev) => prev.filter((loader) => loader.id !== id));
    loadersRef.current.delete(id);
  }, []);

  const showLoader = useCallback((message?: string, isBlocking: boolean = true): ILoaderInstance => {
    const loaderId = nanoid();
    const loaderInstance: InternalLoaderInstance = {
      id: loaderId,
      message: message || 'Loading...',
      isBlocking,
    };

    setActiveLoaders((prev) => [...prev, loaderInstance]);
    loadersRef.current.set(loaderId, loaderInstance);

    // Return the loader instance with control methods
    const instance: ILoaderInstance = {
      updateMessage: (newMessage: string) => {
        updateLoader(loaderId, { message: newMessage });
      },
      block: () => {
        updateLoader(loaderId, { isBlocking: true });
      },
      unblock: () => {
        updateLoader(loaderId, { isBlocking: false });
      },
      close: () => {
        removeLoader(loaderId);
      },
    };

    return instance;
  }, [updateLoader, removeLoader]);

  const hideLoaders = useCallback(() => {
    setActiveLoaders([]);
    loadersRef.current.clear();
  }, []);

  const loaderApi: LoaderApi = {
    showLoader,
    hideLoaders,
  };

  // Get the most recent active loader's message and determine if any loader is blocking
  const currentLoader = activeLoaders.length > 0 ? activeLoaders[activeLoaders.length - 1] : null;
  const hasBlockingLoader = activeLoaders.some((loader) => loader.isBlocking);
  const isBlocking = hasBlockingLoader;

  return (
    <GlobalLoaderContext.Provider value={{ loaderApi }}>
      {children}
      {currentLoader && <LoaderOverlay message={currentLoader.message} isBlocking={isBlocking} />}
    </GlobalLoaderContext.Provider>
  );
};
