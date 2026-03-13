import React, { FC, PropsWithChildren, useContext, useState } from 'react';
import { IFormDataSubmitter } from './interfaces';
import { useGqlSubmitter } from './gqlSubmitter';
import { createNamedContext } from '@/utils/react';
import { CustomSubmitter } from './customSubmitter';
import { throwError } from '@/utils/errors';

export interface IFormDataSubmittersContext {
  getFormDataSubmitter: <Values extends object = object>(type: string) => IFormDataSubmitter<Values> | undefined;
}

export const FormDataSubmittersContext = createNamedContext<IFormDataSubmittersContext | undefined>(undefined, "FormDataSubmittersContext");

export const FormDataSubmittersProvider: FC<PropsWithChildren> = ({ children }) => {
  const gqlSubmitter = useGqlSubmitter();
  const [customSubmitter] = useState(() => new CustomSubmitter());

  const getFormDataSubmitter = (type: string): IFormDataSubmitter | undefined => {
    switch (type) {
      case 'gql':
        return gqlSubmitter;
      case 'custom':
        return customSubmitter;
      default:
        return undefined;
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

export const useFormDataSubmitters = (): IFormDataSubmittersContext => useContext(FormDataSubmittersContext) ?? throwError("useFormDataSubmitters must be used within a FormDataSubmittersProvider");
