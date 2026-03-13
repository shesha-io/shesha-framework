import React, { FC, PropsWithChildren, createContext, useContext, useState, useCallback } from 'react';
import { nanoid } from '@/utils/uuid';

interface FormLoaderInstance {
  id: string;
  message: string;
}

export interface FormLoaderContextValue {
  activeLoaders: FormLoaderInstance[];
  showLoader: (message?: string) => string;
  hideLoaders: () => void;
}

const FormLoaderContext = createContext<FormLoaderContextValue | undefined>(undefined);

export const useFormLoader = (): FormLoaderContextValue => {
  const context = useContext(FormLoaderContext);
  if (!context) {
    // Return a no-op implementation if provider is not found
    return {
      activeLoaders: [],
      showLoader: () => '',
      hideLoaders: () => { /* no-op */ },
    };
  }
  return context;
};

export const FormLoaderProvider: FC<PropsWithChildren<{}>> = ({ children }) => {
  const [activeLoaders, setActiveLoaders] = useState<FormLoaderInstance[]>([]);

  const showLoader = useCallback((message?: string) => {
    const loaderId = nanoid();
    const loaderInstance: FormLoaderInstance = {
      id: loaderId,
      message: message || 'Loading...',
    };

    setActiveLoaders((prev) => [...prev, loaderInstance]);
    return loaderId;
  }, []);

  const hideLoaders = useCallback(() => {
    setActiveLoaders([]);
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
