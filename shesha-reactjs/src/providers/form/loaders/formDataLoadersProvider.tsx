import React, { FC, PropsWithChildren, useState } from 'react';
import { IFormDataLoader } from './interfaces';
import { useGqlLoader } from './gqlLoader';
import { createNamedContext } from '@/utils/react';
import { CustomLoader } from './customLoader';

export interface IFormDataLoadersContext {
  getFormDataLoader: (type: string) => IFormDataLoader;
}

export const FormDataLoadersContext = createNamedContext<IFormDataLoadersContext>(undefined, "FormDataLoadersContext");

export const FormDataLoadersProvider: FC<PropsWithChildren> = ({ children }) => {
  const gqlLoader = useGqlLoader();
  const [customLoader] = useState(() => new CustomLoader());

  const getFormDataLoader = (type: string): IFormDataLoader => {
    switch (type) {
      case 'gql':
        return gqlLoader;
      case 'custom':
        return customLoader;
      default:
        return null;
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

export const useFormDataLoaders = (): IFormDataLoadersContext => {
  return React.useContext(FormDataLoadersContext);
};
