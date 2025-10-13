import React, { FC, PropsWithChildren } from 'react';
import { DocumentInstanceContext } from './contexts';
import { IDocumentInstance } from '../models';

export interface IDocumentInstanceProviderProps extends PropsWithChildren {
  documentInstance: IDocumentInstance;
}

export const DocumentInstanceProvider: FC<IDocumentInstanceProviderProps> = ({ children, documentInstance }) => {
  return (
    <DocumentInstanceContext.Provider value={documentInstance}>
      {children}
    </DocumentInstanceContext.Provider>
  );
};
