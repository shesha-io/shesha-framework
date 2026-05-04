import React, { FC, PropsWithChildren, createContext, useContext, useState, useCallback, useRef } from 'react';
import { nanoid } from '@/utils/uuid';

/**
 * Loader instance with methods for progressive feedback
 */
export interface IFormLoaderInstance {
  /**
   * Updates the message displayed in the loader
   */
  updateMessage(message: string): void;
  /**
   * Closes and removes this specific loader instance
   */
  close(): void;
}

interface InternalFormLoaderInstance {
  id: string;
  message: string;
}

export interface FormLoaderContextValue {
  activeLoaders: InternalFormLoaderInstance[];
  showLoader: (message?: string) => IFormLoaderInstance;
  hideLoaders: () => void;
}

const FormLoaderContext = createContext<FormLoaderContextValue | undefined>(undefined);

export const useFormLoader = (): FormLoaderContextValue => {
  const context = useContext(FormLoaderContext);
  if (!context) {
    // Return a no-op implementation if provider is not found
    const noOpInstance: IFormLoaderInstance = {
      updateMessage: () => { /* no-op */ },
      close: () => { /* no-op */ },
    };
    return {
      activeLoaders: [],
      showLoader: () => noOpInstance,
      hideLoaders: () => { /* no-op */ },
    };
  }
  return context;
};

export const FormLoaderProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeLoaders, setActiveLoaders] = useState<InternalFormLoaderInstance[]>([]);
  const loadersRef = useRef<Map<string, InternalFormLoaderInstance>>(new Map());

  const updateLoader = useCallback((id: string, updates: Partial<InternalFormLoaderInstance>) => {
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

  const showLoader = useCallback((message?: string): IFormLoaderInstance => {
    const loaderId = nanoid();
    const loaderInstance: InternalFormLoaderInstance = {
      id: loaderId,
      message: message || 'Loading...',
    };

    setActiveLoaders((prev) => [...prev, loaderInstance]);
    loadersRef.current.set(loaderId, loaderInstance);

    // Return the loader instance with control methods
    const instance: IFormLoaderInstance = {
      updateMessage: (newMessage: string) => {
        updateLoader(loaderId, { message: newMessage });
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

  const value: FormLoaderContextValue = {
    activeLoaders,
    showLoader,
    hideLoaders,
  };

  return (
    <FormLoaderContext.Provider value={value}>
      {children}
    </FormLoaderContext.Provider>
  );
};
