import React, { FC, PropsWithChildren } from 'react';
import { IFormDataSubmitter } from './interfaces';
import { useGqlSubmitter } from './gqlSubmitter';
import { createNamedContext } from '@/utils/react';

export interface IFormDataSubmittersContext {
    getFormDataSubmitter: (type: string) => IFormDataSubmitter;
}

export const FormDataSubmittersContext = createNamedContext<IFormDataSubmittersContext>(undefined, "FormDataSubmittersContext");

export const FormDataSubmittersProvider: FC<PropsWithChildren> = ({ children }) => {
    const gqlSubmitter = useGqlSubmitter();

    const getFormDataSubmitter = (type: string): IFormDataSubmitter => {
        switch (type) {
            case 'gql':
                return gqlSubmitter;
            // case 'custom':
            //     return customSubmitter;
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

export const useFormDataSubmitters = () => {
    return React.useContext(FormDataSubmittersContext);
};