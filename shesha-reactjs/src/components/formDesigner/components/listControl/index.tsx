import { OrderedListOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { nanoid } from '@/utils/uuid';
import React from 'react';
import { migrateDynamicExpression } from '@/designer-components/_common-migrations/migrateUseExpression';
import { IToolboxComponent } from '@/interfaces';
import { useForm, useFormItem } from '@/providers';
import { validateConfigurableComponentSettings } from '@/providers/form/utils';
import ConfigurableFormItem from '../formItem';
import { DEFAULT_CONFIRM_MESSAGE } from './constants';
import ListControl from './listControl';
import { migrateV0toV1 } from './migrations/migrate-v1';
import { migrateV1toV2 } from './migrations/migrate-v2';
import { IListComponentProps, IListItemsProps } from './models';
import { listSettingsForm } from './settings';
import { ListControlSettings } from './settingsv2';
import { useStyles } from './styles/styles';

/** @deprecated: Use DataListComponent instead */
const ListComponent: IToolboxComponent<IListComponentProps> = {
  type: 'list',
  name: 'List',
  icon: <OrderedListOutlined />,
  isHidden: true /* Use DataList instead */,
  Factory: ({ model }) => {
    const { formMode } = useForm();
    const { namePrefix } = useFormItem();
    const { styles } = useStyles();

    if (model.hidden) return null;

    return (
      <ConfigurableFormItem
        model={{ ...model }}
        className={classNames(
          styles.shaListComponent,
          { horizontal: model?.orientation === 'horizontal' && formMode !== 'designer' } //
        )}
        labelCol={{ span: model?.hideLabel ? 0 : model?.labelCol }}
        wrapperCol={{ span: model?.hideLabel ? 24 : model?.wrapperCol }}
      >
        <ListControl {...model} containerId={model?.id} namePrefix={namePrefix || ''} />
      </ConfigurableFormItem>
    );
  },
  // settingsFormMarkup: listSettingsForm,
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <ListControlSettings
        readOnly={readOnly}
        model={model as unknown as IListItemsProps}
        onSave={onSave as any}
        onCancel={onCancel}
        onValuesChange={onValuesChange as any}
      />
    );
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
          deleteConfirmMessage: prev['deleteConfirmMessage'] ?? `return ${DEFAULT_CONFIRM_MESSAGE}`,
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
  validateSettings: (model) => validateConfigurableComponentSettings(listSettingsForm, model),
};

export default ListComponent;
