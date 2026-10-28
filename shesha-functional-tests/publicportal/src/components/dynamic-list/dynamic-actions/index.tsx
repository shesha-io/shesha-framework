import React, { FC, PropsWithChildren } from 'react';
import { OrganisationActions } from './get-organisations';

export const OrganisationsActionsProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <OrganisationActions>
      {children}
    </OrganisationActions>
  );
};
