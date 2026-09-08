import { FC, PropsWithChildren, createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { nanoid } from '@/utils/uuid';
import { LoaderOverlay } from './loaderOverlay';

export type LoaderMode = 'blocking' | 'non-blocking';

export interface LoaderApi {
  showLoader: (message?: string, mode?: LoaderMode) => string;
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
    return {
      showLoader: () => '',
      hideLoaders: () => { /* no-op */ },
    };
  }
  return context.loaderApi;
};

interface LoaderInstance {
  id: string;
  message: string;
  dismissed: boolean;
  mode: LoaderMode;
}

export const GlobalLoaderProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeLoaders, setActiveLoaders] = useState<LoaderInstance[]>([]);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  const showLoader = useCallback((message?: string, mode: LoaderMode = 'non-blocking') => {
    const loaderId = nanoid();
    const loaderInstance: LoaderInstance = {
      id: loaderId,
      message: message || 'Loading...',
      dismissed: false,
      mode,
    };

    setActiveLoaders((prev) => [...prev, loaderInstance]);
    return loaderId;
  }, []);

  const hideLoaders = useCallback(() => {
    setActiveLoaders([]);
  }, []);

  const loaderApi: LoaderApi = {
    showLoader,
    hideLoaders,
  };

  // Get the most recent active loader's message and determine if any loader is blocking
  const currentLoader = activeLoaders.length > 0 ? activeLoaders[activeLoaders.length - 1] : null;
  const hasBlockingLoader = activeLoaders.some((loader) => loader.mode === 'blocking');
  const effectiveMode = hasBlockingLoader ? 'blocking' : 'non-blocking';

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
    <GlobalLoaderContext.Provider value={{ loaderApi }}>
      {/* display: contents keeps this wrapper out of layout while still letting `inert`
          disable keyboard/pointer interaction with the app underneath a blocking loader. */}
      <div style={{ display: 'contents' }} inert={hasBlockingLoader}>
        {children}
      </div>
      {currentLoader && <LoaderOverlay ref={overlayRef} message={currentLoader.message} mode={effectiveMode} />}
    </GlobalLoaderContext.Provider>
  );
};
