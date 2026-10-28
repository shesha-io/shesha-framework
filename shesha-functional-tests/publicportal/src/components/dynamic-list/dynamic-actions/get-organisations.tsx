import {
  ButtonGroupItemProps,
  DynamicActionsProvider,
  DynamicItemsEvaluationHook,
  IButtonItem,
} from '@shesha-io/reactjs';
import { FC, PropsWithChildren, useMemo } from 'react';
import { makeActionConfig } from 'utils/configurableActions';
import { useOrganisationalAccounts } from '../hooks';

const useOrganisationsActions: DynamicItemsEvaluationHook = () => {
  const { data, isLoading, error } = useOrganisationalAccounts();

  // fetch definitions. Dependencies: current user, CF mode
  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!data || isLoading || error)
      return [];

    const result = data.map<IButtonItem>((p) => ({
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
          url: `/dynamic/Shesha/organisation-details?id=${p.id}`,
        },
      }),
    }));

    return result;
  }, [data, error, isLoading]);

  return operations;
};

export const OrganisationActions: FC<PropsWithChildren> = ({ children }) => {
  return (
    <DynamicActionsProvider
      id="get-organisations"
      name="Get Organisations"
      useEvaluator={useOrganisationsActions}
    >
      {children}
    </DynamicActionsProvider>
  );
};
