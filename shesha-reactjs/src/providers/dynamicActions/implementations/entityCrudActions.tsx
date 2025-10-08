import { isEntityMetadata } from '@/interfaces/metadata';
import { useMetadata } from '@/providers';
import { ButtonGroupItemProps, IButtonGroupItem } from '@/providers/buttonGroupConfigurator/models';
import { DynamicItemsEvaluationHook, DynamicRenderingHoc } from '@/providers/dynamicActionsDispatcher/models';
import React, { PropsWithChildren, useMemo, FC } from 'react';

import { DynamicActionsProvider } from '../index';
import { wrapDisplayName } from '@/utils/react';

const EntityTestItems: ButtonGroupItemProps[] = [
  { id: '1', name: 'btn1', label: 'entity action 1', itemType: 'item', itemSubType: 'button', sortOrder: 0, buttonType: 'link' },
  { id: '2', name: 'btn2', label: 'entity action 2', itemType: 'item', itemSubType: 'button', sortOrder: 1 },
];

const useEntityCrudActions: DynamicItemsEvaluationHook = (args) => {
  const { metadata } = useMetadata(false) ?? {};

  const operations = useMemo<ButtonGroupItemProps[]>(() => {
    if (!isEntityMetadata(metadata))
      return [];

    const result: IButtonGroupItem[] = [
      {
        id: 'create',
        name: `create new`,
        label: `Create new`,
        itemType: 'item',
        itemSubType: 'button',
        sortOrder: 0,
      },
      {
        id: 'read',
        name: `view details`,
        label: `View details`,
        itemType: 'item',
        itemSubType: 'button',
        sortOrder: 1,
      },
      {
        id: 'update',
        name: `edit`,
        label: `Edit`,
        itemType: 'item',
        itemSubType: 'button',
        sortOrder: 2,
      },
      {
        id: 'delete',
        name: `delete`,
        label: `Delete`,
        itemType: 'item',
        itemSubType: 'button',
        sortOrder: 3,
      },
    ];
    return result;
    /*
        return metadata.properties.map<IButtonGroupItem>(sp => ({
            id: sp.path,
            name: sp.path,
            label: sp.label,
            itemSubType: 'button',
            itemType: 'item',
            sortOrder: 0
        }));
        */
    /*
        return metadata.specifications.map<IButtonGroupItem>(sp => ({
            id: sp.name,
            name: sp.name,
            label: sp.name,
            itemSubType: 'button',
            itemType: 'item',
            sortOrder: 0
        }));
        */
  }, [args.item, metadata]);

  return operations;
};

const entityActionsHoc: DynamicRenderingHoc = (WrappedComponent) => {
  return wrapDisplayName((props) => {
    const testItems = useMemo<ButtonGroupItemProps[]>(() => {
      return EntityTestItems;
    }, []);

    return (<WrappedComponent {...props} items={testItems} />);
  }, "entityActionsHoc");
};

export const EntityCrudActions: FC<PropsWithChildren> = ({ children }) => {
  return (
    <DynamicActionsProvider
      id="entity-crud"
      name="CRUD Actions"
      renderingHoc={entityActionsHoc}
      useEvaluator={useEntityCrudActions}
    >
      {children}
    </DynamicActionsProvider>
  );
};
