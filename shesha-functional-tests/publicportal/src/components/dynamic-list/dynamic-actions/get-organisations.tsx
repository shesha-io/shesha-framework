import React, { PropsWithChildren, useMemo } from 'react';
import { FC } from 'react';
import {
    DynamicActionsProvider,
    ButtonGroupItemProps,
    DynamicItemsEvaluationHook,
    IButtonItem,
} from '@shesha-io/reactjs';
import { useOrganisationalAccounts } from '../hooks';
import { makeActionConfig } from 'utils/configurabeleActions';

export interface IOrganisationActionsProps {

}

const useOrganisationsActions: DynamicItemsEvaluationHook = (args) => {
    const { data, isLoading, error } = useOrganisationalAccounts();

    // fetch definitions. Dependencies: current user, CF mode
    const operations = useMemo<ButtonGroupItemProps[]>(() => {
        if (!data || isLoading || error)
            return [];

        const result = data?.map<IButtonItem>(p => ({
            id: p.id,
            name: p.name,
            label: p.name,
            tooltip: p.description,
            itemType: 'item',
            itemSubType: 'button',
            sortOrder: 0,
            actionConfiguration: makeActionConfig({
                actionName: "Navigate",
                actionOwner: "shesha.common",
                actionArguments: {
                    navigationType: 'url',
                    url: `/dynamic/Shesha/organisation-details?id=${p.id}`
                }
            })
        }));

        return result;
    }, [args.item, data]);

    return operations;
};

export const OrganisationActions: FC<PropsWithChildren<IOrganisationActionsProps>> = ({ children }) => {
    return (
        <DynamicActionsProvider
            id='get-organisations'
            name='Get Organisations'
            useEvaluator={ useOrganisationsActions }
        >
        { children }
        </DynamicActionsProvider>
    );
};