import { FC, PropsWithChildren, createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
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

/** Loader api as exposed to form scripts under the `loader` constant */
export interface IPublicLoaderApi {
  show: (message?: string, isBlocking?: boolean) => ILoaderInstance;
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

interface ActiveLoader {
  id: string;
  message: string;
  isBlocking: boolean;
}

export const GlobalLoaderProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeLoaders, setActiveLoaders] = useState<ActiveLoader[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const loadersRef = useRef<Map<string, ActiveLoader>>(new Map());

  const updateLoader = useCallback((id: string, updates: Partial<ActiveLoader>) => {
    setActiveLoaders((prev) => {
      const updated = prev.map((loader) =>
        loader.id === id ? { ...loader, ...updates } : loader,
      );
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
    const loaderInstance: ActiveLoader = {
      id: loaderId,
      message: message ?? 'Loading...',
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

  const loaderApi = useMemo<LoaderApi>(() => ({
    showLoader,
    hideLoaders,
  }), [showLoader, hideLoaders]);

  const contextValue = useMemo<GlobalLoaderContextValue>(() => ({ loaderApi }), [loaderApi]);

  // Get the most recent active loader's message and determine if any loader is blocking
  const currentLoader = activeLoaders.length > 0 ? activeLoaders[activeLoaders.length - 1] : null;
  const hasBlockingLoader = activeLoaders.some((loader) => loader.isBlocking);

  // Move focus into the overlay while blocking, and restore it to whatever was
  // focused before, so keyboard users aren't left interacting with the app underneath.
  useEffect(() => {
    if (hasBlockingLoader) {
      previouslyFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      overlayRef.current?.focus();
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  }, [hasBlockingLoader]);

  return (
    <GlobalLoaderContext.Provider value={contextValue}>
      {/* display: contents keeps this wrapper out of layout while still letting `inert`
          disable keyboard/pointer interaction with the app underneath a blocking loader. */}
      <div style={{ display: 'contents' }} inert={hasBlockingLoader}>
        {children}
      </div>
      {currentLoader && <LoaderOverlay ref={overlayRef} message={currentLoader.message} isBlocking={hasBlockingLoader} />}
    </GlobalLoaderContext.Provider>
  );
};
