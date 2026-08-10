import { OrderedListOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import React from 'react';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { IToolboxComponent } from '@/interfaces';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { IListComponentProps, IListItemsProps } from './models';
import { getBooleanPropertyOrUndefined, getNumberPropertyOrUndefined, getStringPropertyOrUndefined } from '@/utils/object';
import { ButtonGroupItemProps } from '@/providers';

/** @deprecated: Use DataListComponent instead */
const ListComponent: IToolboxComponent<IListComponentProps> = {
  type: 'list',
  isInput: false,
  name: 'List',
  icon: <OrderedListOutlined />,
  isHidden: false /* Use DataList instead */,
  Factory: () => 'Component deprecated. Use DataListComponent instead.',
  migrator: (m) =>
    m
      .add<IListComponentProps>(0, (prev) => {
        const uniqueStateId = `FORM_LIST_${nanoid()}`;

        const customProps: IListComponentProps = {
          ...prev,
          name: getStringPropertyOrUndefined(prev, "name") ?? "",
          showPagination: getBooleanPropertyOrUndefined(prev, "showPagination") ?? true,
          hideLabel: getBooleanPropertyOrUndefined(prev, "hideLabel") ?? true,
          uniqueStateId: getStringPropertyOrUndefined(prev, "uniqueStateId") ?? uniqueStateId,
          submitHttpVerb: 'POST',
          labelCol: getNumberPropertyOrUndefined(prev, "labelCol") ?? 8,
          wrapperCol: getNumberPropertyOrUndefined(prev, "wrapperCol") ?? 16,
          selectionMode: "selectionMode" in prev && typeof (prev.selectionMode) === "string" && ['none', 'single', 'multiple'].includes(prev.selectionMode)
            ? prev.selectionMode as IListItemsProps["selectionMode"]
            : 'single',
          deleteConfirmMessage: getStringPropertyOrUndefined(prev, 'deleteConfirmMessage') ?? `return '';`,
          totalRecords: 100,
          buttons: ("buttons" in prev ? prev['buttons'] as ButtonGroupItemProps[] : undefined) ?? [
            {
              id: nanoid(),
              itemType: 'item',
              sortOrder: 0,
              name: 'button1',
              label: ' ',
              itemSubType: 'button',
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
        const useExpression = getBooleanPropertyOrUndefined(result, "useExpression");
        if ("useExpression" in result)
          delete result['useExpression'];

        if (useExpression) {
          const migratedExpression = prev.filters ? migrateDynamicExpression(prev.filters) : undefined;
          result.filters = migratedExpression;
        }

        return result;
      }),
};

export default ListComponent;
