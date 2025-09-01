import React, { FC, PropsWithChildren } from 'react';
import { DocumentEditorStateContext } from './contexts';

export interface IDocuementEditorStateProviderProps {

}

export const DocuementEditorStateProvider: FC<PropsWithChildren<IDocuementEditorStateProviderProps>> = ({ children }) => {
    return (
            <DocumentEditorStateContext.Provider value={undefined}>
                {children}
            </DocumentEditorStateContext.Provider>
        );
};
