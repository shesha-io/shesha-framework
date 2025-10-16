import React, { FC, PropsWithChildren, useState } from 'react';
import { IFormDataSubmitter } from './interfaces';
import { useGqlSubmitter } from './gqlSubmitter';
import { createNamedContext } from '@/utils/react';
import { CustomSubmitter } from './customSubmitter';

export interface IFormDataSubmittersContext {
  getFormDataSubmitter: (type: string) => IFormDataSubmitter;
}

export const FormDataSubmittersContext = createNamedContext<IFormDataSubmittersContext>(undefined, "FormDataSubmittersContext");

export const FormDataSubmittersProvider: FC<PropsWithChildren> = ({ children }) => {
  const gqlSubmitter = useGqlSubmitter();
  const [customSubmitter] = useState(() => new CustomSubmitter());

  const getFormDataSubmitter = (type: string): IFormDataSubmitter => {
    switch (type) {
      case 'gql':
        return gqlSubmitter;
      case 'custom':
        return customSubmitter;
      default:
        return null;
    }
  };

  return (
    <FormDataSubmittersContext.Provider
      value={{ getFormDataSubmitter }}
    >
      {children}
    </FormDataSubmittersContext.Provider>
  );
};

export const useFormDataSubmitters = (): IFormDataSubmittersContext => {
  return React.useContext(FormDataSubmittersContext);
};
