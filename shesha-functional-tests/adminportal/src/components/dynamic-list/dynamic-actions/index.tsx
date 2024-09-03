import React, { FC, PropsWithChildren } from 'react';
import { OrganisationActions } from './get-organisations';

export interface IOrganisationActionsProviderProps {

}

export const OrganisationsActionsProvider: FC<PropsWithChildren<IOrganisationActionsProviderProps>> = ({ children }) => {
    return (
        <OrganisationActions>
                    {children}
        </OrganisationActions>
    );
};