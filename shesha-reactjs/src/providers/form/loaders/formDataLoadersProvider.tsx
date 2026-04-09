import React, { FC, PropsWithChildren, useContext, useState } from 'react';
import { IFormDataLoader } from './interfaces';
import { useGqlLoader } from './gqlLoader';
import { createNamedContext } from '@/utils/react';
import { CustomLoader } from './customLoader';
import { throwError } from '@/utils/errors';

export interface IFormDataLoadersContext {
  getFormDataLoader: (type: string) => IFormDataLoader | undefined;
}

export const FormDataLoadersContext = createNamedContext<IFormDataLoadersContext | undefined>(undefined, "FormDataLoadersContext");

export const FormDataLoadersProvider: FC<PropsWithChildren> = ({ children }) => {
  const gqlLoader = useGqlLoader();
  const [customLoader] = useState(() => new CustomLoader());

  const getFormDataLoader = (type: string): IFormDataLoader | undefined => {
    switch (type) {
      case 'gql':
        return gqlLoader;
      case 'custom':
        return customLoader;
      default:
        return undefined;
    }
  };

  return (
    <FormDataLoadersContext.Provider
      value={{ getFormDataLoader }}
    >
      {children}
    </FormDataLoadersContext.Provider>
  );
};

export const useFormDataLoaders = (): IFormDataLoadersContext => useContext(FormDataLoadersContext) ?? throwError("useFormDataLoaders must be used within a FormDataLoadersProvider");
