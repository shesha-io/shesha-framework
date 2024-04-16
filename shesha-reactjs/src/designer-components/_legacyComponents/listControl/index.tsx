import { OrderedListOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import React from 'react';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { IToolboxComponent } from '@/interfaces';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { IListComponentProps } from './models';
import { ListControlSettings } from './settingsv2';

/** @deprecated: Use DataListComponent instead */
const ListComponent: IToolboxComponent<IListComponentProps> = {
  type: 'list',
  name: 'List',
  icon: <OrderedListOutlined />,
  isHidden: false /* Use DataList instead */,
  Factory: () => 'Component deprecated. Use DataListComponent instead.',
  settingsFormFactory: ({ model, onSave, onCancel }) => {
    return <ListControlSettings readOnly={true} model={model} onSave={onSave as any} onCancel={onCancel} />;
  },
  migrator: (m) =>
    m
      .add<IListComponentProps>(0, (prev) => {
        const uniqueStateId = `FORM_LIST_${nanoid()}`;

        const customProps: IListComponentProps = {
          ...prev,
          name: prev['name'],
          showPagination: prev['showPagination'] ?? true,
          hideLabel: prev['hideLabel'] ?? true,
          uniqueStateId: prev['uniqueStateId'] ?? uniqueStateId,
          submitHttpVerb: 'POST',
          labelCol: prev['labelCol'] ?? 8,
          wrapperCol: prev['wrapperCol'] ?? 16,
          selectionMode: prev['selectionMode'] ?? 'none',
          deleteConfirmMessage: prev['deleteConfirmMessage'] ?? `return '';`,
          totalRecords: 100,
          buttons: prev['buttons'] ?? [
            {
              id: nanoid(),
              itemType: 'item',
              sortOrder: 0,
              name: 'button1',
              label: ' ',
              itemSubType: 'button',
              uniqueStateId,
              buttonAction: 'dispatchAnEvent',
              eventName: 'refreshListItems',
              chosen: false,
              selected: false,
              icon: 'ReloadOutlined',
              buttonType: 'link',
            },
          ],
          paginationDefaultPageSize: 10,
        };
        return customProps;
      })
      .add<IListComponentProps>(1, migrateV0toV1)
      .add<IListComponentProps>(2, migrateV1toV2)
      .add<IListComponentProps>(3, (prev) => {
        const result = { ...prev };
        const useExpression = Boolean(result['useExpression']);
        delete result['useExpression'];

        if (useExpression) {
          const migratedExpression = migrateDynamicExpression(prev.filters);
          result.filters = migratedExpression;
        }

        return result;
      }),
};

export default ListComponent;
